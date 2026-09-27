import { Product, Category, StoreSettings, Order, OrderStatus, CourierProvider, ProductReview, CartItem, PaymentSettings, HeroBanner, AdminUser, CourierConfig } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_ORDERS, INITIAL_REVIEWS, DEFAULT_PAYMENT_SETTINGS, SAMPLE_PRODUCTS, INITIAL_BANNERS, INITIAL_ADMIN_USERS, INITIAL_COURIERS } from '../data/initialData';

const STORAGE_KEYS = {
  PRODUCTS: 'nebula_mart_products',
  CATEGORIES: 'nebula_mart_categories',
  SETTINGS: 'nebula_mart_settings',
  ORDERS: 'nebula_mart_orders',
  REVIEWS: 'nebula_mart_reviews',
  CART: 'nebula_mart_cart',
  THEME: 'nebula_mart_theme',
  LANG: 'nebula_mart_lang',
  BANNERS: 'nebula_mart_banners',
  ADMIN_USERS: 'nebula_mart_admin_users',
  COURIERS: 'nebula_mart_couriers',
  CURRENT_USER: 'nebula_mart_current_admin'
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) return fallback;
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export const StorageService = {
  getProducts(): Product[] {
    const prods = safeGet<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return Array.isArray(prods) ? prods : (INITIAL_PRODUCTS || []);
  },

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    safeSet(STORAGE_KEYS.PRODUCTS, products);
  },

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    safeSet(STORAGE_KEYS.PRODUCTS, products);
  },

  getCategories(): Category[] {
    const cats = safeGet<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return Array.isArray(cats) ? cats : (INITIAL_CATEGORIES || []);
  },

  saveCategory(category: Category): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    safeSet(STORAGE_KEYS.CATEGORIES, categories);
  },

  deleteCategory(categoryId: string): void {
    const categories = this.getCategories().filter(c => c.id !== categoryId);
    safeSet(STORAGE_KEYS.CATEGORIES, categories);
  },

  getSettings(): StoreSettings {
    const stored = safeGet<StoreSettings | null>(STORAGE_KEYS.SETTINGS, null);
    if (!stored) return INITIAL_SETTINGS;

    // Defensive merge guaranteeing paymentSettings and its methods never crash
    const mergedPayment: PaymentSettings = {
      cod: {
        enabled: true,
        ...DEFAULT_PAYMENT_SETTINGS.cod,
        ...(stored.paymentSettings?.cod || {})
      },
      bkash: {
        enabled: true,
        ...DEFAULT_PAYMENT_SETTINGS.bkash,
        ...(stored.paymentSettings?.bkash || {})
      },
      nagad: {
        enabled: true,
        ...DEFAULT_PAYMENT_SETTINGS.nagad,
        ...(stored.paymentSettings?.nagad || {})
      }
    };

    return {
      ...INITIAL_SETTINGS,
      ...stored,
      logoUrl: stored.logoUrl && stored.logoUrl.trim() ? stored.logoUrl : INITIAL_SETTINGS.logoUrl,
      paymentSettings: mergedPayment
    };
  },

  getPaymentSettings(): PaymentSettings {
    const settings = this.getSettings();
    return settings.paymentSettings || DEFAULT_PAYMENT_SETTINGS;
  },

  saveSettings(settings: StoreSettings): void {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  },

  getOrders(): Order[] {
    const orders = safeGet<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return Array.isArray(orders) ? orders : (INITIAL_ORDERS || []);
  },

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'courier' | 'createdAt'>): { success: boolean; order?: Order; error?: string } {
    const products = this.getProducts();
    
    // Check stock for all items
    for (const item of orderData.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product not found: ${item.productName}` };
      }
      if (prod.stock < item.quantity) {
        return { success: false, error: `Only ${prod.stock} items left for ${prod.name}` };
      }
    }

    // Deduct stock safely
    const updatedProducts = products.map(prod => {
      const matched = orderData.items.find(i => i.productId === prod.id);
      if (matched) {
        const remaining = prod.stock - matched.quantity;
        return {
          ...prod,
          stock: Math.max(0, remaining),
          inStock: remaining > 0
        };
      }
      return prod;
    });
    safeSet(STORAGE_KEYS.PRODUCTS, updatedProducts);

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `NM-${randomSuffix}`,
      status: 'pending',
      courier: 'none',
      createdAt: new Date().toISOString()
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    safeSet(STORAGE_KEYS.ORDERS, orders);

    try {
      window.dispatchEvent(new CustomEvent('nebula_order_updated'));
    } catch {}

    return { success: true, order: newOrder };
  },

  updateOrderStatus(orderId: string, status: OrderStatus): void {
    const orders = this.getOrders().map(order => {
      if (order.id === orderId) {
        return { ...order, status };
      }
      return order;
    });
    safeSet(STORAGE_KEYS.ORDERS, orders);

    try {
      window.dispatchEvent(new CustomEvent('nebula_order_updated'));
    } catch {}
  },

  dispatchSteadfastCourier(orderId: string): { success: boolean; trackingId: string } {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, trackingId: '' };

    const trackingId = `SF-BD-${Math.floor(100000 + Math.random() * 900000)}`;
    orders[orderIndex] = {
      ...orders[orderIndex],
      courier: 'steadfast' as CourierProvider,
      courierTrackingId: trackingId,
      courierStatus: 'Booked on Steadfast Courier (Pickup Pending)',
      status: 'shipped' as OrderStatus
    };
    safeSet(STORAGE_KEYS.ORDERS, orders);
    return { success: true, trackingId };
  },

  updateOrderCourier(orderId: string, courierData: any, trackingId?: string, courierStatus?: string): void {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const isObj = typeof courierData === 'object' && courierData !== null;
    const finalCourier = isObj ? courierData : courierData;
    const finalTracking = isObj ? (courierData.consignmentId || courierData.trackingId || '') : (trackingId || '');
    const finalStatus = isObj ? (courierData.status || `Booked on ${courierData.provider}`) : (courierStatus || 'shipped');

    orders[orderIndex] = {
      ...orders[orderIndex],
      courier: finalCourier,
      courierTrackingId: finalTracking,
      courierStatus: finalStatus,
      status: 'shipped' as OrderStatus
    };
    safeSet(STORAGE_KEYS.ORDERS, orders);
  },

  dispatchPathaoCourier(orderId: string): { success: boolean; trackingId: string } {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return { success: false, trackingId: '' };

    const trackingId = `PT-DH-${Math.floor(100000 + Math.random() * 900000)}`;
    orders[orderIndex] = {
      ...orders[orderIndex],
      courier: 'pathao' as CourierProvider,
      courierTrackingId: trackingId,
      courierStatus: 'Dispatched via Pathao Merchant API',
      status: 'shipped' as OrderStatus
    };
    safeSet(STORAGE_KEYS.ORDERS, orders);
    return { success: true, trackingId };
  },

  getReviews(productId?: string): ProductReview[] {
    const reviews = safeGet<ProductReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    const valid = Array.isArray(reviews) ? reviews : (INITIAL_REVIEWS || []);
    if (productId) {
      return valid.filter(r => r && r.productId === productId);
    }
    return valid;
  },

  addReview(review: Omit<ProductReview, 'id' | 'date'>): void {
    const reviews = this.getReviews();
    const newReview: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    reviews.unshift(newReview);
    safeSet(STORAGE_KEYS.REVIEWS, reviews);
  },

  getCart(): CartItem[] {
    const cart = safeGet<CartItem[]>(STORAGE_KEYS.CART, []);
    return Array.isArray(cart) ? cart : [];
  },

  saveCart(cart: CartItem[]): void {
    safeSet(STORAGE_KEYS.CART, cart);
  },

  addToCart(product: Product, quantity = 1): CartItem[] {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.product.id === product.id);

    if (existingIndex >= 0) {
      const newQty = Math.min(product.stock, cart[existingIndex].quantity + quantity);
      cart[existingIndex] = {
        ...cart[existingIndex],
        quantity: newQty
      };
    } else {
      cart.push({
        product,
        quantity: Math.min(product.stock, quantity)
      });
    }

    this.saveCart(cart);
    return cart;
  },

  updateCartQuantity(productId: string, quantity: number): CartItem[] {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(item => item.product.id !== productId);
    } else {
      cart = cart.map(item => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity: Math.min(item.product.stock, quantity)
          };
        }
        return item;
      });
    }

    this.saveCart(cart);
    return cart;
  },

  removeFromCart(productId: string): CartItem[] {
    const cart = this.getCart().filter(item => item.product.id !== productId);
    this.saveCart(cart);
    return cart;
  },

  clearCart(): void {
    safeSet(STORAGE_KEYS.CART, []);
  },

  exportDatabaseJson(): string {
    const data = {
      products: this.getProducts(),
      categories: this.getCategories(),
      orders: this.getOrders(),
      settings: this.getSettings(),
      reviews: this.getReviews(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabaseJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.products) safeSet(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.categories) safeSet(STORAGE_KEYS.CATEGORIES, data.categories);
      if (data.orders) safeSet(STORAGE_KEYS.ORDERS, data.orders);
      if (data.settings) safeSet(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.reviews) safeSet(STORAGE_KEYS.REVIEWS, data.reviews);
      return true;
    } catch {
      return false;
    }
  },

  // --- HERO BANNERS MANAGEMENT ---
  getBanners(): HeroBanner[] {
    const banners = safeGet<HeroBanner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    const list = Array.isArray(banners) ? banners : (INITIAL_BANNERS || []);
    return list.sort((a, b) => ((a && a.order) || 0) - ((b && b.order) || 0));
  },

  getActiveBanners(): HeroBanner[] {
    const list = this.getBanners();
    return Array.isArray(list) ? list.filter(b => b && b.isActive !== false) : [];
  },

  saveBanner(banner: HeroBanner): void {
    const banners = this.getBanners();
    const index = banners.findIndex(b => b.id === banner.id);
    if (index >= 0) {
      banners[index] = banner;
    } else {
      banners.push(banner);
    }
    safeSet(STORAGE_KEYS.BANNERS, banners);
    try {
      window.dispatchEvent(new CustomEvent('nebula_banners_updated'));
    } catch {}
  },

  deleteBanner(bannerId: string): void {
    const banners = this.getBanners().filter(b => b.id !== bannerId);
    safeSet(STORAGE_KEYS.BANNERS, banners);
    try {
      window.dispatchEvent(new CustomEvent('nebula_banners_updated'));
    } catch {}
  },

  toggleBannerStatus(bannerId: string): boolean {
    const banners = this.getBanners();
    const target = banners.find(b => b.id === bannerId);
    if (target) {
      target.isActive = !target.isActive;
      safeSet(STORAGE_KEYS.BANNERS, banners);
      try {
        window.dispatchEvent(new CustomEvent('nebula_banners_updated'));
      } catch {}
      return target.isActive;
    }
    return false;
  },

  reorderBanners(banners: HeroBanner[]): void {
    const reordered = banners.map((b, idx) => ({ ...b, order: idx + 1 }));
    safeSet(STORAGE_KEYS.BANNERS, reordered);
    try {
      window.dispatchEvent(new CustomEvent('nebula_banners_updated'));
    } catch {}
  },

  // --- ADMIN USERS & AUTHENTICATION ---
  getAdminUsers(): AdminUser[] {
    return safeGet<AdminUser[]>(STORAGE_KEYS.ADMIN_USERS, INITIAL_ADMIN_USERS);
  },

  saveAdminUser(user: AdminUser): void {
    const users = this.getAdminUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    safeSet(STORAGE_KEYS.ADMIN_USERS, users);
  },

  deleteAdminUser(userId: string): boolean {
    const users = this.getAdminUsers();
    // Prevent deleting the last master admin
    const target = users.find(u => u.id === userId);
    if (target?.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
      return false;
    }
    const filtered = users.filter(u => u.id !== userId);
    safeSet(STORAGE_KEYS.ADMIN_USERS, filtered);
    return true;
  },

  authenticateAdmin(identifier: string, password: string): { success: boolean; user?: AdminUser; error?: string } {
    const users = this.getAdminUsers();
    const cleanId = identifier.trim().toLowerCase();
    const user = users.find(u => 
      (u.email.toLowerCase() === cleanId || u.name.toLowerCase() === cleanId) && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid credentials. Please check your email/username and password.' };
    }

    if (user.status === 'inactive') {
      return { success: false, error: 'This account has been deactivated. Please contact the administrator.' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveAdminUser(user);
    this.setCurrentUser(user);

    return { success: true, user };
  },

  getCurrentUser(): AdminUser | null {
    return safeGet<AdminUser | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: AdminUser | null): void {
    if (user) {
      safeSet(STORAGE_KEYS.CURRENT_USER, user);
      localStorage.setItem('nebula_admin_auth', 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.removeItem('nebula_admin_auth');
    }
  },

  changeAdminPassword(userId: string, currentPass: string, newPass: string): { success: boolean; error?: string } {
    const users = this.getAdminUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User account not found' };
    }

    if (user.password !== currentPass) {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (!newPass || newPass.trim().length < 4) {
      return { success: false, error: 'New password must be at least 4 characters long' };
    }

    user.password = newPass.trim();
    this.saveAdminUser(user);
    this.setCurrentUser(user); // refresh current logged in session
    return { success: true };
  },

  // --- COURIER MANAGEMENT ---
  getCouriers(): CourierConfig[] {
    return safeGet<CourierConfig[]>(STORAGE_KEYS.COURIERS, INITIAL_COURIERS);
  },

  saveCourier(courier: CourierConfig): void {
    const couriers = this.getCouriers();
    if (courier.isDefault) {
      couriers.forEach(c => (c.isDefault = false));
    }
    const index = couriers.findIndex(c => c.id === courier.id);
    if (index >= 0) {
      couriers[index] = courier;
    } else {
      couriers.push(courier);
    }
    safeSet(STORAGE_KEYS.COURIERS, couriers);
  },

  deleteCourier(courierId: string): void {
    const couriers = this.getCouriers().filter(c => c.id !== courierId);
    safeSet(STORAGE_KEYS.COURIERS, couriers);
  },

  savePaymentSettings(payment: PaymentSettings): void {
    const settings = this.getSettings();
    settings.paymentSettings = payment;
    this.saveSettings(settings);
  },

  loadSampleCatalog(): void {
    safeSet(STORAGE_KEYS.PRODUCTS, SAMPLE_PRODUCTS);
    safeSet(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    safeSet(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  },

  resetToDefault(): void {
    safeSet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    safeSet(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    safeSet(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    safeSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    safeSet(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },

  clearAllProducts(): void {
    safeSet(STORAGE_KEYS.PRODUCTS, []);
  },

  clearAllCategories(): void {
    safeSet(STORAGE_KEYS.CATEGORIES, []);
  },

  startFreshStore(): void {
    safeSet(STORAGE_KEYS.PRODUCTS, []);
    safeSet(STORAGE_KEYS.CATEGORIES, []);
    safeSet(STORAGE_KEYS.ORDERS, []);
    safeSet(STORAGE_KEYS.CART, []);
  },

  getSupabaseSqlSchema(): string {
    return `-- Nebula Mart: Supabase PostgreSQL Schema & Security Rules (RLS)
-- Run this in your Supabase SQL Editor

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_name TEXT DEFAULT 'Package',
    product_count INTEGER DEFAULT 0,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT UNIQUE,
    category TEXT NOT NULL,
    category_bn TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    compare_at_price NUMERIC(10,2),
    discount_percentage INTEGER DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT,
    description_bn TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    features_bn JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    rating NUMERIC(2,1) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_latest BOOLEAN DEFAULT true,
    is_discount BOOLEAN DEFAULT false,
    in_stock BOOLEAN DEFAULT true,
    brand TEXT DEFAULT 'Nebula Mart',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    district TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    district TEXT NOT NULL,
    thana TEXT,
    address TEXT NOT NULL,
    order_note TEXT,
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_charge NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'Cash on Delivery',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    courier TEXT DEFAULT 'none' CHECK (courier IN ('none', 'steadfast', 'pathao')),
    courier_tracking_id TEXT,
    courier_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    image TEXT
);

-- 6. Store settings table
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active products and categories
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

-- Allow guests to create orders without exposing other orders
CREATE POLICY "Anyone can insert order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Only authenticated admins can modify products, view all orders, and dispatch couriers
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
`;
  }
};
