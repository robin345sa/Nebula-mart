import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { Product, Category, Order, HeroBanner, StoreSettings, DatabaseConfig } from '../types';

let cachedClient: SupabaseClient | null = null;
let currentConfigKey = '';

export interface SupabaseConnectionStatus {
  isConfigured: boolean;
  isConnected: boolean;
  projectUrl: string;
  hasAnonKey: boolean;
  dbReachable?: boolean;
  authReachable?: boolean;
  storageReachable?: boolean;
  details?: string;
  error?: string;
}

/**
 * Returns currently configured Supabase credentials from local settings
 * or Vite environment variables.
 */
export function getSupabaseCredentials(): { url: string; anonKey: string } {
  let url = '';
  let anonKey = '';

  // 1. Check local storage database config
  try {
    const raw = localStorage.getItem('mart_store_db_config') || localStorage.getItem('nebula_mart_db_config');
    if (raw) {
      const cfg: DatabaseConfig = JSON.parse(raw);
      if (cfg && cfg.hostUrl) url = cfg.hostUrl.trim();
      if (cfg && cfg.apiKey) anonKey = cfg.apiKey.trim();
    }
  } catch {}

  // 2. Check store settings if not found in db_config
  if (!url || !anonKey) {
    try {
      const raw = localStorage.getItem('mart_store_settings') || localStorage.getItem('nebula_mart_settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.databaseConfig?.hostUrl) url = s.databaseConfig.hostUrl.trim();
        if (s?.databaseConfig?.apiKey) anonKey = s.databaseConfig.apiKey.trim();
      }
    } catch {}
  }

  // 3. Fallback to Vite environment variables if available
  if (!url) {
    url = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  }
  if (!anonKey) {
    anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

/**
 * Get or initialize Supabase client
 */
export function getSupabaseClient(forceUrl?: string, forceKey?: string): SupabaseClient | null {
  const { url, anonKey } = forceUrl && forceKey ? { url: forceUrl, anonKey: forceKey } : getSupabaseCredentials();

  if (!url || !anonKey) {
    return null;
  }

  const configKey = `${url}:${anonKey}`;
  if (cachedClient && currentConfigKey === configKey) {
    return cachedClient;
  }

  try {
    // Basic URL validation
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) return null;

    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'mart_store_supabase_auth'
      }
    });
    currentConfigKey = configKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Diagnostics & Live Connection Probe
 */
export async function probeSupabaseConnection(
  testUrl?: string,
  testKey?: string
): Promise<SupabaseConnectionStatus> {
  const creds = testUrl && testKey ? { url: testUrl, anonKey: testKey } : getSupabaseCredentials();

  if (!creds.url || !creds.anonKey) {
    return {
      isConfigured: false,
      isConnected: false,
      projectUrl: creds.url,
      hasAnonKey: !!creds.anonKey,
      details: 'Supabase Project URL and Anon API Key are not configured yet.'
    };
  }

  try {
    const client = getSupabaseClient(creds.url, creds.anonKey);
    if (!client) {
      return {
        isConfigured: true,
        isConnected: false,
        projectUrl: creds.url,
        hasAnonKey: true,
        error: 'Invalid Project URL format. Expected: https://<project-ref>.supabase.co'
      };
    }

    let dbReachable = false;
    let authReachable = false;
    let storageReachable = false;
    const notes: string[] = [];

    // 1. Test Auth service reachability
    try {
      const { error: authErr } = await client.auth.getSession();
      if (!authErr) {
        authReachable = true;
        notes.push('Auth Service: Active & Reachable');
      } else {
        notes.push(`Auth Service: Notice (${authErr.message})`);
      }
    } catch {
      notes.push('Auth Service: Network error');
    }

    // 2. Test PostgreSQL / Database query
    try {
      // Probe 'products' table
      const { data, error: dbErr } = await client.from('products').select('id').limit(1);
      if (!dbErr) {
        dbReachable = true;
        notes.push('PostgreSQL Database: Table "products" connected');
      } else {
        // Check if table missing vs network failure
        if (dbErr.code === '42P01' || dbErr.message.toLowerCase().includes('relation "public.products" does not exist') || dbErr.message.includes('not find')) {
          dbReachable = true; // Connection works, but SQL schema not yet executed!
          notes.push('PostgreSQL Connected (Schema tables need to be created using the SQL script)');
        } else {
          notes.push(`PostgreSQL Query Notice: ${dbErr.message}`);
        }
      }
    } catch (dbEx: any) {
      notes.push(`Database probe: ${dbEx?.message || 'Error querying table'}`);
    }

    // 3. Test Storage bucket
    try {
      const { data: buckets, error: storageErr } = await client.storage.listBuckets();
      if (!storageErr) {
        storageReachable = true;
        const hasMediaBucket = buckets?.some(b => b.name === 'store-media');
        notes.push(hasMediaBucket ? 'Storage Bucket "store-media": Found & Active' : 'Storage Active (Bucket "store-media" will be created)');
      }
    } catch {}

    const isConnected = dbReachable || authReachable;

    return {
      isConfigured: true,
      isConnected,
      projectUrl: creds.url,
      hasAnonKey: true,
      dbReachable,
      authReachable,
      storageReachable,
      details: notes.join(' • ')
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      projectUrl: creds.url,
      hasAnonKey: true,
      error: err?.message || 'Failed to connect to Supabase'
    };
  }
}

// -------------------------------------------------------------
// Data Mapping Helpers (TypeScript models <-> Supabase DB rows)
// -------------------------------------------------------------

function mapProductToRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    name_bn: p.nameBn || p.name,
    slug: p.slug,
    sku: p.sku || '',
    category: p.category,
    category_bn: p.categoryBn || p.category,
    price: p.price,
    compare_at_price: p.compareAtPrice || null,
    discount_percentage: p.discountPercentage || 0,
    stock: p.stock,
    images: p.images || [],
    description: p.description || '',
    description_bn: p.descriptionBn || '',
    features: p.features || [],
    features_bn: p.featuresBn || [],
    specifications: p.specifications || {},
    rating: p.rating || 5,
    review_count: p.reviewCount || 0,
    is_featured: !!p.isFeatured,
    is_hot_selling: !!p.isHotSelling,
    is_flash_deal: !!p.isFlashDeal,
    is_latest: !!p.isLatest,
    is_discount: !!p.isDiscount,
    badge: p.badge || '',
    in_stock: p.inStock,
    brand: p.brand || '',
    created_at: p.createdAt || new Date().toISOString()
  };
}

function mapRowToProduct(r: any): Product {
  return {
    id: String(r.id),
    name: r.name,
    nameBn: r.name_bn || r.name,
    slug: r.slug,
    sku: r.sku || '',
    category: r.category,
    categoryBn: r.category_bn || r.category,
    price: Number(r.price) || 0,
    compareAtPrice: Number(r.compare_at_price) || 0,
    discountPercentage: Number(r.discount_percentage) || 0,
    stock: Number(r.stock) || 0,
    images: Array.isArray(r.images) ? r.images : (typeof r.images === 'string' ? [r.images] : []),
    description: r.description || '',
    descriptionBn: r.description_bn || '',
    features: Array.isArray(r.features) ? r.features : [],
    featuresBn: Array.isArray(r.features_bn) ? r.features_bn : [],
    specifications: r.specifications || {},
    rating: Number(r.rating) || 5,
    reviewCount: Number(r.review_count) || 0,
    isFeatured: !!r.is_featured,
    isHotSelling: !!r.is_hot_selling,
    isFlashDeal: !!r.is_flash_deal,
    isLatest: !!r.is_latest,
    isDiscount: !!r.is_discount,
    badge: r.badge || '',
    inStock: r.in_stock ?? (Number(r.stock) > 0),
    brand: r.brand || '',
    createdAt: r.created_at || new Date().toISOString()
  };
}

function mapCategoryToRow(c: Category) {
  return {
    id: c.id,
    name: c.name,
    name_bn: c.nameBn || c.name,
    slug: c.slug,
    icon_name: c.iconName || 'Package',
    product_count: c.productCount || 0,
    image: c.image || null,
    banner_image: c.bannerImage || null,
    is_featured: !!c.isFeatured
  };
}

function mapRowToCategory(r: any): Category {
  return {
    id: String(r.id),
    name: r.name,
    nameBn: r.name_bn || r.name,
    slug: r.slug,
    iconName: r.icon_name || 'Package',
    productCount: Number(r.product_count) || 0,
    image: r.image || undefined,
    bannerImage: r.banner_image || undefined,
    isFeatured: !!r.is_featured
  };
}

function mapOrderToRow(o: Order) {
  return {
    id: o.id,
    order_number: o.orderNumber,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    customer_email: o.customerEmail || null,
    district: o.district,
    district_bn: o.districtBn || null,
    thana: o.thana || null,
    address: o.address,
    order_note: o.orderNote || null,
    items: o.items || [],
    subtotal: o.subtotal,
    delivery_charge: o.deliveryCharge,
    total: o.total,
    payment_method: o.paymentMethod || 'Cash on Delivery',
    sender_number: o.senderNumber || null,
    transaction_id: o.transactionId || null,
    status: o.status || 'pending',
    courier: o.courier || 'none',
    courier_tracking_id: o.courierTrackingId || null,
    courier_status: o.courierStatus || null,
    created_at: o.createdAt || new Date().toISOString()
  };
}

function mapRowToOrder(r: any): Order {
  return {
    id: String(r.id),
    orderNumber: r.order_number,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email || undefined,
    district: r.district,
    districtBn: r.district_bn || undefined,
    thana: r.thana || undefined,
    address: r.address,
    orderNote: r.order_note || undefined,
    items: Array.isArray(r.items) ? r.items : [],
    subtotal: Number(r.subtotal) || 0,
    deliveryCharge: Number(r.delivery_charge) || 0,
    total: Number(r.total) || 0,
    paymentMethod: r.payment_method || 'Cash on Delivery',
    senderNumber: r.sender_number || undefined,
    transactionId: r.transaction_id || undefined,
    status: r.status || 'pending',
    courier: r.courier || 'none',
    courierTrackingId: r.courier_tracking_id || undefined,
    courierStatus: r.courier_status || undefined,
    createdAt: r.created_at || new Date().toISOString()
  };
}

function mapBannerToRow(b: HeroBanner) {
  return {
    id: b.id,
    title: b.title,
    title_bn: b.titleBn || null,
    subtitle: b.subtitle || null,
    subtitle_bn: b.subtitleBn || null,
    badge: b.badge || null,
    badge_bn: b.badgeBn || null,
    image_url: b.imageUrl,
    cta_text: b.ctaText || null,
    cta_text_bn: b.ctaTextBn || null,
    link_type: b.linkType || 'all',
    link_value: b.linkValue || null,
    bg_color: b.bgColor || null,
    text_color: b.textColor || 'light',
    is_active: b.isActive ?? true,
    sort_order: b.order || 0,
    created_at: b.createdAt || new Date().toISOString()
  };
}

function mapRowToBanner(r: any): HeroBanner {
  return {
    id: String(r.id),
    title: r.title,
    titleBn: r.title_bn || undefined,
    subtitle: r.subtitle || undefined,
    subtitleBn: r.subtitle_bn || undefined,
    badge: r.badge || undefined,
    badgeBn: r.badge_bn || undefined,
    imageUrl: r.image_url,
    ctaText: r.cta_text || undefined,
    ctaTextBn: r.cta_text_bn || undefined,
    linkType: r.link_type || 'all',
    linkValue: r.link_value || undefined,
    bgColor: r.bg_color || undefined,
    textColor: r.text_color || 'light',
    isActive: r.is_active ?? true,
    order: Number(r.sort_order) || 0,
    createdAt: r.created_at || new Date().toISOString()
  };
}

// -------------------------------------------------------------
// Supabase Data Service (Fetch, Push, Delete)
// -------------------------------------------------------------

export const SupabaseDataService = {
  // PRODUCTS
  async fetchProducts(): Promise<Product[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        console.warn('Supabase fetchProducts error:', error.message);
        return null;
      }
      return (data || []).map(mapRowToProduct);
    } catch {
      return null;
    }
  },

  async upsertProduct(product: Product): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const row = mapProductToRow(product);
      const { error } = await client.from('products').upsert(row, { onConflict: 'id' });
      if (error) {
        console.error('Supabase upsertProduct error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase upsertProduct exception:', err);
      return false;
    }
  },

  async deleteProduct(productId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('products').delete().eq('id', productId);
      return !error;
    } catch {
      return false;
    }
  },

  // CATEGORIES
  async fetchCategories(): Promise<Category[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('categories').select('*').order('name');
      if (error) return null;
      return (data || []).map(mapRowToCategory);
    } catch {
      return null;
    }
  },

  async upsertCategory(category: Category): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const row = mapCategoryToRow(category);
      const { error } = await client.from('categories').upsert(row, { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('categories').delete().eq('id', categoryId);
      return !error;
    } catch {
      return false;
    }
  },

  // ORDERS
  async fetchOrders(): Promise<Order[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
      if (error) return null;
      return (data || []).map(mapRowToOrder);
    } catch {
      return null;
    }
  },

  async insertOrder(order: Order): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const row = mapOrderToRow(order);
      const { error } = await client.from('orders').upsert(row, { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  async updateOrderStatus(orderId: string, status: string, courierInfo?: any): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const updatePayload: Record<string, any> = { status };
      if (courierInfo) {
        updatePayload.courier = courierInfo;
        if (courierInfo.consignmentId) updatePayload.courier_tracking_id = courierInfo.consignmentId;
        if (courierInfo.status) updatePayload.courier_status = courierInfo.status;
      }
      const { error } = await client.from('orders').update(updatePayload).eq('id', orderId);
      return !error;
    } catch {
      return false;
    }
  },

  // BANNERS
  async fetchBanners(): Promise<HeroBanner[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('hero_banners').select('*').order('sort_order', { ascending: true });
      if (error) return null;
      return (data || []).map(mapRowToBanner);
    } catch {
      return null;
    }
  },

  async upsertBanner(banner: HeroBanner): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const row = mapBannerToRow(banner);
      const { error } = await client.from('hero_banners').upsert(row, { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteBanner(bannerId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('hero_banners').delete().eq('id', bannerId);
      return !error;
    } catch {
      return false;
    }
  },

  // SETTINGS
  async fetchSettings(): Promise<StoreSettings | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('store_settings').select('*').eq('id', 'primary').single();
      if (error || !data) return null;
      return data.config_json as StoreSettings;
    } catch {
      return null;
    }
  },

  async saveSettings(settings: StoreSettings): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('store_settings').upsert({
        id: 'primary',
        config_json: settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      return !error;
    } catch {
      return false;
    }
  },

  // MEDIA STORAGE UPLOAD
  async uploadFileToStorage(file: File | Blob, customFileName?: string): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const bucketName = 'store-media';
      const ext = file instanceof File ? file.name.split('.').pop() || 'webp' : 'webp';
      const cleanName = (customFileName || `image-${Date.now()}`)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 40);
      const filePath = `uploads/${Date.now()}_${cleanName}.${ext}`;

      const { data, error } = await client.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('Supabase storage upload error:', error.message);
        return null;
      }

      const { data: publicData } = client.storage.from(bucketName).getPublicUrl(filePath);
      return publicData?.publicUrl || null;
    } catch (err) {
      console.warn('Supabase storage exception:', err);
      return null;
    }
  },

  // MIGRATION / SYNC
  async syncLocalToSupabase(localData: {
    products: Product[];
    categories: Category[];
    orders: Order[];
    banners?: HeroBanner[];
    settings?: StoreSettings;
  }): Promise<{ success: boolean; message: string; counts: { products: number; categories: number; orders: number; banners: number } }> {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        message: 'Supabase client is not configured.',
        counts: { products: 0, categories: 0, orders: 0, banners: 0 }
      };
    }

    try {
      let syncedProducts = 0;
      let syncedCategories = 0;
      let syncedOrders = 0;
      let syncedBanners = 0;

      // 1. Sync Categories
      if (localData.categories && localData.categories.length > 0) {
        const catRows = localData.categories.map(mapCategoryToRow);
        const { error: catErr } = await client.from('categories').upsert(catRows, { onConflict: 'id' });
        if (!catErr) syncedCategories = catRows.length;
      }

      // 2. Sync Products
      if (localData.products && localData.products.length > 0) {
        const prodRows = localData.products.map(mapProductToRow);
        // Upsert in batches of 50 to avoid request payload limits
        for (let i = 0; i < prodRows.length; i += 50) {
          const batch = prodRows.slice(i, i + 50);
          const { error: prodErr } = await client.from('products').upsert(batch, { onConflict: 'id' });
          if (!prodErr) syncedProducts += batch.length;
        }
      }

      // 3. Sync Orders
      if (localData.orders && localData.orders.length > 0) {
        const orderRows = localData.orders.map(mapOrderToRow);
        for (let i = 0; i < orderRows.length; i += 50) {
          const batch = orderRows.slice(i, i + 50);
          const { error: orderErr } = await client.from('orders').upsert(batch, { onConflict: 'id' });
          if (!orderErr) syncedOrders += batch.length;
        }
      }

      // 4. Sync Banners
      if (localData.banners && localData.banners.length > 0) {
        const bannerRows = localData.banners.map(mapBannerToRow);
        const { error: bannerErr } = await client.from('hero_banners').upsert(bannerRows, { onConflict: 'id' });
        if (!bannerErr) syncedBanners = bannerRows.length;
      }

      // 5. Sync Settings
      if (localData.settings) {
        await client.from('store_settings').upsert({
          id: 'primary',
          config_json: localData.settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      }

      return {
        success: true,
        message: `সফলভাবে সিঙ্ক সম্পন্ন হয়েছে: ${syncedProducts}টি প্রোডাক্ট, ${syncedCategories}টি ক্যাটাগরি, ${syncedOrders}টি অর্ডার, ${syncedBanners}টি ব্যানার।`,
        counts: {
          products: syncedProducts,
          categories: syncedCategories,
          orders: syncedOrders,
          banners: syncedBanners
        }
      };
    } catch (err: any) {
      return {
        success: false,
        message: `সিঙ্ক ব্যর্থ: ${err?.message || 'অজানা ত্রুটি'}`,
        counts: { products: 0, categories: 0, orders: 0, banners: 0 }
      };
    }
  }
};
