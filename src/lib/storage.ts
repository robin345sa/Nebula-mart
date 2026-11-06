import { Product, Category, StoreSettings, Order, OrderStatus, CourierProvider, ProductReview, CartItem, PaymentSettings, HeroBanner, AdminUser, CourierConfig, DatabaseConfig, CustomerAccount, Coupon } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SETTINGS, INITIAL_ORDERS, INITIAL_REVIEWS, DEFAULT_PAYMENT_SETTINGS, SAMPLE_PRODUCTS, INITIAL_BANNERS, INITIAL_ADMIN_USERS, INITIAL_COURIERS, INITIAL_COUPONS } from '../data/initialData';
import { SupabaseDataService, probeSupabaseConnection, getSupabaseClient } from './supabase';
import { FirestoreService, testFirebaseConnection } from './firebase';

const STORAGE_KEYS = {
  PRODUCTS: 'mart_store_products',
  CATEGORIES: 'mart_store_categories',
  SETTINGS: 'mart_store_settings',
  ORDERS: 'mart_store_orders',
  REVIEWS: 'mart_store_reviews',
  CART: 'mart_store_cart',
  WISHLIST: 'mart_store_wishlist',
  THEME: 'mart_store_theme',
  LANG: 'mart_store_lang',
  BANNERS: 'mart_store_banners',
  ADMIN_USERS: 'mart_store_admin_users',
  COURIERS: 'mart_store_couriers',
  CURRENT_USER: 'mart_store_current_admin',
  DB_CONFIG: 'mart_store_db_config',
  DB_SNAPSHOT: 'mart_store_db_snapshot',
  CUSTOMER_ACCOUNTS: 'mart_store_customer_accounts',
  ACTIVE_CUSTOMER: 'mart_store_active_customer',
  COUPONS: 'mart_store_coupons'
};

// IndexedDB dual persistence mirror to guarantee no data is lost on local machine
const IDB_NAME = 'mart_store_database';
const IDB_VERSION = 1;
const IDB_STORE = 'mart_store_keyval';

function openIDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function persistToIDB(key: string, value: any) {
  openIDB().then((db) => {
    if (!db) return;
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, key);
    } catch {}
  }).catch(() => {});
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    let item = localStorage.getItem(key);
    // Backward compatibility: check legacy nebula_mart_ key if not found
    if (!item && key.startsWith('mart_store_')) {
      const legacyKey = key.replace('mart_store_', 'nebula_mart_');
      item = localStorage.getItem(legacyKey);
    }
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
    // Also save legacy key for compatibility
    if (key.startsWith('mart_store_')) {
      const legacyKey = key.replace('mart_store_', 'nebula_mart_');
      localStorage.setItem(legacyKey, JSON.stringify(value));
    }
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
  persistToIDB(key, value);
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

    // Asynchronously push to Firebase Firestore and Supabase
    FirestoreService.saveDoc('products', product.id, product).catch(() => {});
    SupabaseDataService.upsertProduct(product).catch(() => {});
  },

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter(p => p.id !== productId);
    safeSet(STORAGE_KEYS.PRODUCTS, products);

    // Asynchronously delete from Firebase Firestore and Supabase
    FirestoreService.deleteDoc('products', productId).catch(() => {});
    SupabaseDataService.deleteProduct(productId).catch(() => {});
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

    FirestoreService.saveDoc('categories', category.id, category).catch(() => {});
    SupabaseDataService.upsertCategory(category).catch(() => {});
  },

  deleteCategory(categoryId: string): void {
    const categories = this.getCategories().filter(c => c.id !== categoryId);
    safeSet(STORAGE_KEYS.CATEGORIES, categories);

    FirestoreService.deleteDoc('categories', categoryId).catch(() => {});
    SupabaseDataService.deleteCategory(categoryId).catch(() => {});
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
      storeName: stored.storeName === 'Mart Store' ? 'Nebula Mart' : (stored.storeName || 'Nebula Mart'),
      storeNameBn: stored.storeNameBn === 'মাঠ স্টোর' ? 'নেবুলা মার্ট' : (stored.storeNameBn || 'নেবুলা মার্ট'),
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
    FirestoreService.saveDoc('settings', 'global_settings', settings).catch(() => {});
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

    // Asynchronously push to Firebase Firestore & Supabase
    FirestoreService.saveDoc('orders', newOrder.id, newOrder).catch(() => {});
    orderData.items.forEach(item => {
      const p = updatedProducts.find(x => x.id === item.productId);
      if (p) FirestoreService.saveDoc('products', p.id, p).catch(() => {});
    });
    SupabaseDataService.insertOrder(newOrder).catch(() => {});

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

    const updated = orders.find(o => o.id === orderId);
    if (updated) {
      FirestoreService.saveDoc('orders', updated.id, updated).catch(() => {});
    }
    SupabaseDataService.updateOrderStatus(orderId, status).catch(() => {});

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

    SupabaseDataService.updateOrderStatus(orderId, 'shipped', finalCourier).catch(() => {});
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

  getWishlist(): string[] {
    const list = safeGet<string[]>(STORAGE_KEYS.WISHLIST, []);
    return Array.isArray(list) ? list : [];
  },

  isInWishlist(productId: string): boolean {
    const list = this.getWishlist();
    return list.includes(productId);
  },

  toggleWishlist(productId: string): boolean {
    let list = this.getWishlist();
    let isNowInWishlist = false;
    if (list.includes(productId)) {
      list = list.filter(id => id !== productId);
      isNowInWishlist = false;
    } else {
      list.unshift(productId);
      isNowInWishlist = true;
    }
    safeSet(STORAGE_KEYS.WISHLIST, list);
    window.dispatchEvent(new CustomEvent('mart_wishlist_updated', {
      detail: { productId, inWishlist: isNowInWishlist, wishlist: list }
    }));
    return isNowInWishlist;
  },

  addToWishlist(productId: string): void {
    const list = this.getWishlist();
    if (!list.includes(productId)) {
      list.unshift(productId);
      safeSet(STORAGE_KEYS.WISHLIST, list);
      window.dispatchEvent(new CustomEvent('mart_wishlist_updated', {
        detail: { productId, inWishlist: true, wishlist: list }
      }));
    }
  },

  removeFromWishlist(productId: string): void {
    let list = this.getWishlist();
    if (list.includes(productId)) {
      list = list.filter(id => id !== productId);
      safeSet(STORAGE_KEYS.WISHLIST, list);
      window.dispatchEvent(new CustomEvent('mart_wishlist_updated', {
        detail: { productId, inWishlist: false, wishlist: list }
      }));
    }
  },

  clearWishlist(): void {
    safeSet(STORAGE_KEYS.WISHLIST, []);
    window.dispatchEvent(new CustomEvent('mart_wishlist_updated', {
      detail: { wishlist: [] }
    }));
  },

  exportDatabaseJson(): string {
    const data = {
      appName: 'Mart Store (মাঠ স্টোর)',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      orders: this.getOrders(),
      settings: this.getSettings(),
      banners: this.getBanners(),
      couriers: this.getCouriers(),
      reviews: this.getReviews()
    };
    return JSON.stringify(data, null, 2);
  },

  downloadDatabaseFile(customFilename?: string): void {
    try {
      const json = this.exportDatabaseJson();
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = customFilename || `mart-store-database-backup-${dateStr}.json`;
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download database file:', err);
    }
  },

  importDatabaseJson(jsonString: string): { success: boolean; stats?: any; error?: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, error: 'Invalid JSON format' };
      }

      let importedProducts = 0;
      let importedOrders = 0;
      let importedCategories = 0;

      if (Array.isArray(data.products)) {
        safeSet(STORAGE_KEYS.PRODUCTS, data.products);
        importedProducts = data.products.length;
      }
      if (Array.isArray(data.categories)) {
        safeSet(STORAGE_KEYS.CATEGORIES, data.categories);
        importedCategories = data.categories.length;
      }
      if (Array.isArray(data.orders)) {
        safeSet(STORAGE_KEYS.ORDERS, data.orders);
        importedOrders = data.orders.length;
      }
      if (data.settings && typeof data.settings === 'object') {
        safeSet(STORAGE_KEYS.SETTINGS, data.settings);
      }
      if (Array.isArray(data.banners)) {
        safeSet(STORAGE_KEYS.BANNERS, data.banners);
      }
      if (Array.isArray(data.couriers)) {
        safeSet(STORAGE_KEYS.COURIERS, data.couriers);
      }
      if (Array.isArray(data.reviews)) {
        safeSet(STORAGE_KEYS.REVIEWS, data.reviews);
      }

      try {
        window.dispatchEvent(new CustomEvent('nebula_order_updated'));
        window.dispatchEvent(new CustomEvent('nebula_banners_updated'));
      } catch {}

      return {
        success: true,
        stats: {
          products: importedProducts,
          orders: importedOrders,
          categories: importedCategories
        }
      };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to parse JSON file' };
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

    FirestoreService.saveDoc('banners', banner.id, banner).catch(() => {});
    SupabaseDataService.upsertBanner(banner).catch(() => {});

    try {
      window.dispatchEvent(new CustomEvent('nebula_banners_updated'));
    } catch {}
  },

  deleteBanner(bannerId: string): void {
    const banners = this.getBanners().filter(b => b.id !== bannerId);
    safeSet(STORAGE_KEYS.BANNERS, banners);

    FirestoreService.deleteDoc('banners', bannerId).catch(() => {});
    SupabaseDataService.deleteBanner(bannerId).catch(() => {});

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
    return `-- Mart Store (মাঠ স্টোর): Complete Supabase PostgreSQL Schema & Security Rules (RLS)
-- Copy and paste this directly into your Supabase Dashboard > SQL Editor:

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon_name TEXT DEFAULT 'Package',
    product_count INTEGER DEFAULT 0,
    image TEXT,
    banner_image TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    sku TEXT,
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
    is_hot_selling BOOLEAN DEFAULT false,
    is_flash_deal BOOLEAN DEFAULT false,
    is_latest BOOLEAN DEFAULT true,
    is_discount BOOLEAN DEFAULT false,
    badge TEXT DEFAULT '',
    in_stock BOOLEAN DEFAULT true,
    brand TEXT DEFAULT 'Mart Store',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    district TEXT NOT NULL,
    district_bn TEXT,
    thana TEXT,
    address TEXT NOT NULL,
    order_note TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_charge NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'Cash on Delivery',
    sender_number TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'pending',
    courier JSONB DEFAULT '"none"'::jsonb,
    courier_tracking_id TEXT,
    courier_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create hero_banners table
CREATE TABLE IF NOT EXISTS public.hero_banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_bn TEXT,
    subtitle TEXT,
    subtitle_bn TEXT,
    badge TEXT,
    badge_bn TEXT,
    image_url TEXT NOT NULL,
    cta_text TEXT,
    cta_text_bn TEXT,
    link_type TEXT DEFAULT 'all',
    link_value TEXT,
    bg_color TEXT,
    text_color TEXT DEFAULT 'light',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    config_json JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Indexes for ultra-fast query performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_banners_sort ON public.hero_banners (sort_order);

-- 7. Media Storage Bucket Configuration (store-media)
INSERT INTO storage.buckets (id, name, public)
VALUES ('store-media', 'store-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 8. Row Level Security (RLS) Enablement
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to store catalog
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read banners" ON public.hero_banners FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON public.store_settings FOR SELECT USING (true);

-- Allow shoppers to place orders and track orders
CREATE POLICY "Public create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public view orders" ON public.orders FOR SELECT USING (true);

-- Allow full modifications (Admin API and dashboard)
CREATE POLICY "Full access categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Full access products" ON public.products FOR ALL USING (true);
CREATE POLICY "Full access orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Full access banners" ON public.hero_banners FOR ALL USING (true);
CREATE POLICY "Full access settings" ON public.store_settings FOR ALL USING (true);

-- Storage bucket access policies
CREATE POLICY "Public view store media" ON storage.objects FOR SELECT USING (bucket_id = 'store-media');
CREATE POLICY "Public upload store media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-media');
CREATE POLICY "Public update store media" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'store-media');
`;
  },

  getDatabaseConfig(): DatabaseConfig {
    const settings = this.getSettings();
    if (settings.databaseConfig) return settings.databaseConfig;
    const stored = safeGet<DatabaseConfig | null>(STORAGE_KEYS.DB_CONFIG, null);
    if (stored) return stored;
    return (
      INITIAL_SETTINGS.databaseConfig || {
        storageMode: 'local_host',
        hostUrl: '',
        apiKey: '',
        secretToken: '',
        autoSync: true,
        autoDownloadBackup: false,
        lastBackupAt: new Date().toISOString()
      }
    );
  },

  saveDatabaseConfig(config: DatabaseConfig): void {
    safeSet(STORAGE_KEYS.DB_CONFIG, config);
    const settings = this.getSettings();
    settings.databaseConfig = config;
    this.saveSettings(settings);
    FirestoreService.saveDoc('settings', 'database_config', config).catch(() => {});
  },

  getDatabaseStats() {
    const products = this.getProducts();
    const orders = this.getOrders();
    const categories = this.getCategories();
    const reviews = this.getReviews();
    const config = this.getDatabaseConfig();

    const totalSales = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const inStockProducts = products.filter((p) => p.inStock && p.stock > 0).length;
    const outOfStockProducts = products.filter((p) => !p.inStock || p.stock <= 0).length;

    return {
      totalProducts: products.length,
      inStockProducts,
      outOfStockProducts,
      totalOrders: orders.length,
      pendingOrders,
      totalCategories: categories.length,
      totalReviews: reviews.length,
      totalSales,
      storageMode: config.storageMode,
      lastBackupAt: config.lastBackupAt || new Date().toISOString(),
      isLocalPersistent: true
    };
  },

  getMySQLSchema(): string {
    return `-- Mart Store (মাঠ স্টোর): Complete MySQL / MariaDB Schema (cPanel phpMyAdmin)
-- Run this in your cPanel phpMyAdmin or MySQL Server

CREATE DATABASE IF NOT EXISTS mart_store_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mart_store_db;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_bn VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon_name VARCHAR(64) DEFAULT 'Package',
  product_count INT DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_bn VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE,
  category VARCHAR(100) NOT NULL,
  category_bn VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2) DEFAULT NULL,
  discount_percentage INT DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  images JSON DEFAULT NULL,
  description TEXT,
  description_bn TEXT,
  features JSON DEFAULT NULL,
  rating DECIMAL(2,1) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT 0,
  is_hot_selling BOOLEAN DEFAULT 0,
  in_stock BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Customer Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  customer_email VARCHAR(255) DEFAULT NULL,
  district VARCHAR(100) NOT NULL,
  thana VARCHAR(100) DEFAULT NULL,
  address TEXT NOT NULL,
  order_note TEXT DEFAULT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_charge DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(64) DEFAULT 'Cash on Delivery',
  transaction_id VARCHAR(100) DEFAULT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  courier VARCHAR(32) DEFAULT 'none',
  courier_tracking_id VARCHAR(128) DEFAULT NULL,
  courier_status VARCHAR(255) DEFAULT NULL,
  items JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Store Settings & Config Key-Value
CREATE TABLE IF NOT EXISTS store_settings (
  setting_key VARCHAR(128) PRIMARY KEY,
  setting_value JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
  },

  async testCloudConnection(config: DatabaseConfig): Promise<{ success: boolean; message: string; details?: string }> {
    if (config.storageMode === 'local_host') {
      return {
        success: true,
        message: 'লোকাল হোস্ট ডাটাবেস সম্পূর্ণ সক্রিয় ও সুরক্ষিত (Local Host Database Active)'
      };
    }

    if (config.storageMode === 'supabase') {
      const probe = await probeSupabaseConnection(config.hostUrl, config.apiKey);
      if (probe.isConnected) {
        return {
          success: true,
          message: 'সুপাবেস PostgreSQL ডাটাবেসের সাথে কানেকশন সফল হয়েছে!',
          details: probe.details
        };
      } else {
        return {
          success: false,
          message: probe.error || probe.details || 'সুপাবেস কানেকশন টেস্ট ব্যর্থ হয়েছে',
          details: probe.details
        };
      }
    }

    if (!config.hostUrl || !config.hostUrl.trim()) {
      return {
        success: false,
        message: 'দয়া করে হোস্টিং ডাটাবেস URL বা ডোমেইন এন্ডপয়েন্ট প্রদান করুন (Please enter Hosting URL)'
      };
    }

    try {
      const cleanUrl = config.hostUrl.trim();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (config.apiKey && config.apiKey.trim()) {
        headers['apikey'] = config.apiKey.trim();
        headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
      }

      const res = await fetch(cleanUrl, {
        method: 'GET',
        headers
      });

      if (res.ok || res.status === 200 || res.status === 204 || res.status === 401 || res.status === 404) {
        return {
          success: true,
          message: `হোস্টিং সার্ভারের সাথে সফলভাবে যোগাযোগ হয়েছে (HTTP Status: ${res.status})`
        };
      } else {
        return {
          success: false,
          message: `সার্ভার রেসপন্স কোড: ${res.status} (${res.statusText})`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: `কানেকশন ত্রুটি: ${err?.message || 'সার্ভারে কানেক্ট করা যায়নি'}`
      };
    }
  },

  async syncToCloudDatabase(config: DatabaseConfig): Promise<{ success: boolean; message: string }> {
    if (config.storageMode === 'local_host') {
      safeSet(STORAGE_KEYS.DB_SNAPSHOT, this.exportDatabaseJson());
      config.lastBackupAt = new Date().toISOString();
      this.saveDatabaseConfig(config);
      return {
        success: true,
        message: 'লোকাল হোস্টে সম্পূর্ণ ডাটাবেস সফলভাবে সেভ ও ব্যাকআপ হয়েছে।'
      };
    }

    if (config.storageMode === 'supabase') {
      const result = await SupabaseDataService.syncLocalToSupabase({
        products: this.getProducts(),
        categories: this.getCategories(),
        orders: this.getOrders(),
        banners: this.getBanners(),
        settings: this.getSettings()
      });
      if (result.success) {
        config.lastBackupAt = new Date().toISOString();
        this.saveDatabaseConfig(config);
      }
      return {
        success: result.success,
        message: result.message
      };
    }

    if (!config.hostUrl || !config.hostUrl.trim()) {
      return { success: false, message: 'হোস্টিং ডাটাবেস URL প্রয়োজন।' };
    }

    try {
      const payload = {
        store: 'Mart Store',
        exportedAt: new Date().toISOString(),
        products: this.getProducts(),
        orders: this.getOrders(),
        categories: this.getCategories(),
        settings: this.getSettings()
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (config.apiKey && config.apiKey.trim()) {
        headers['apikey'] = config.apiKey.trim();
        headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
      }

      const res = await fetch(config.hostUrl.trim(), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        config.lastBackupAt = new Date().toISOString();
        this.saveDatabaseConfig(config);
        return { success: true, message: 'হোস্টিং ডাটাবেসে সফলভাবে সমস্ত ডাটা সিঙ্ক হয়েছে।' };
      } else {
        return { success: false, message: `হোস্টিং রেসপন্স কোড: ${res.status}` };
      }
    } catch (err: any) {
      return { success: false, message: `সিঙ্ক ব্যর্থ: ${err?.message || 'নেটওয়ার্ক এরর'}` };
    }
  },

  async fetchFromSupabaseAndHydrate(): Promise<{ success: boolean; message: string }> {
    try {
      const prods = await SupabaseDataService.fetchProducts();
      const cats = await SupabaseDataService.fetchCategories();
      const ords = await SupabaseDataService.fetchOrders();
      const bans = await SupabaseDataService.fetchBanners();

      let updatedCount = 0;
      if (prods && prods.length > 0) {
        safeSet(STORAGE_KEYS.PRODUCTS, prods);
        updatedCount += prods.length;
      }
      if (cats && cats.length > 0) {
        safeSet(STORAGE_KEYS.CATEGORIES, cats);
      }
      if (ords && ords.length > 0) {
        safeSet(STORAGE_KEYS.ORDERS, ords);
      }
      if (bans && bans.length > 0) {
        safeSet(STORAGE_KEYS.BANNERS, bans);
      }

      if (updatedCount > 0 || (cats && cats.length > 0)) {
        try {
          window.dispatchEvent(new CustomEvent('nebula_order_updated'));
          window.dispatchEvent(new CustomEvent('nebula_banners_updated'));
        } catch {}
        return {
          success: true,
          message: `সুপাবেস থেকে সফলভাবে ${prods?.length || 0}টি প্রোডাক্ট ও ${ords?.length || 0}টি অর্ডার লোড হয়েছে।`
        };
      } else {
        return {
          success: true,
          message: 'সুপাবেসে বর্তমানে কোনো ডেটা পাওয়া যায়নি।'
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: `ডেটা লোড করতে ব্যর্থ: ${e?.message || 'Error fetching from Supabase'}`
      };
    }
  },

  // Customer Account Management
  getCustomerAccounts(): CustomerAccount[] {
    const accounts = safeGet<CustomerAccount[]>(STORAGE_KEYS.CUSTOMER_ACCOUNTS, []);
    return Array.isArray(accounts) ? accounts : [];
  },

  findCustomerByPhone(phone: string): CustomerAccount | undefined {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const accounts = this.getCustomerAccounts();
    return accounts.find(a => a.phone.replace(/[^0-9]/g, '') === cleanPhone);
  },

  saveCustomerAccount(customer: CustomerAccount): void {
    const accounts = this.getCustomerAccounts();
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const idx = accounts.findIndex(a => a.phone.replace(/[^0-9]/g, '') === cleanPhone);
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...customer };
    } else {
      accounts.unshift(customer);
    }
    safeSet(STORAGE_KEYS.CUSTOMER_ACCOUNTS, accounts);
    FirestoreService.saveDoc('customerAccounts', customer.id, customer).catch(() => {});
  },

  getActiveCustomer(): CustomerAccount | null {
    return safeGet<CustomerAccount | null>(STORAGE_KEYS.ACTIVE_CUSTOMER, null);
  },

  setActiveCustomer(customer: CustomerAccount | null): void {
    safeSet(STORAGE_KEYS.ACTIVE_CUSTOMER, customer);
    try {
      window.dispatchEvent(new CustomEvent('nebula_customer_changed', { detail: customer }));
    } catch {}
  },

  registerCustomer(name: string, phone: string, password?: string): { success: boolean; message: string; customer?: CustomerAccount } {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!name.trim()) {
      return { success: false, message: 'অনুগ্রহ করে আপনার পুরো নাম লিখুন' };
    }
    if (!cleanPhone || cleanPhone.length < 11) {
      return { success: false, message: 'অনুগ্রহ করে সঠিক ১১-ডিজিটের ফোন নম্বর দিন (যেমন: 017XXXXXXXX)' };
    }

    const existing = this.findCustomerByPhone(cleanPhone);
    if (existing) {
      // If user already exists, update their profile with latest name/password
      const updated: CustomerAccount = {
        ...existing,
        name: name.trim(),
        password: password?.trim() || existing.password,
        lastLoginAt: new Date().toISOString()
      };
      this.saveCustomerAccount(updated);
      this.setActiveCustomer(updated);
      return {
        success: true,
        message: 'স্বাগতম! আপনার অ্যাকাউন্ট সফলভাবে আপডেট ও লগইন হয়েছে।',
        customer: updated
      };
    }

    const newCustomer: CustomerAccount = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      phone: cleanPhone,
      password: password?.trim() || undefined,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    this.saveCustomerAccount(newCustomer);
    this.setActiveCustomer(newCustomer);
    return {
      success: true,
      message: 'নেবুলা মার্টে স্বাগতম! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।',
      customer: newCustomer
    };
  },

  loginCustomer(phone: string, password?: string): { success: boolean; message: string; customer?: CustomerAccount } {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 11) {
      return { success: false, message: 'অনুগ্রহ করে সঠিক ফোন নম্বর দিন' };
    }

    const account = this.findCustomerByPhone(cleanPhone);
    if (!account) {
      return {
        success: false,
        message: 'এই ফোন নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন।'
      };
    }

    if (account.password && password && account.password !== password) {
      return { success: false, message: 'ভুল পাসওয়ার্ড। দয়া করে সঠিক পাসওয়ার্ড দিন।' };
    }

    const updated: CustomerAccount = {
      ...account,
      lastLoginAt: new Date().toISOString()
    };
    this.saveCustomerAccount(updated);
    this.setActiveCustomer(updated);
    return {
      success: true,
      message: 'সফলভাবে লগইন হয়েছে! স্বাগতম।',
      customer: updated
    };
  },

  logoutCustomer(): void {
    this.setActiveCustomer(null);
  },

  // --- DISCOUNT COUPONS MANAGEMENT ---
  getCoupons(): Coupon[] {
    const coupons = safeGet<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    return Array.isArray(coupons) ? coupons : (INITIAL_COUPONS || []);
  },

  saveCoupon(coupon: Coupon): void {
    const coupons = this.getCoupons();
    const index = coupons.findIndex(c => c.id === coupon.id || c.code.toLowerCase() === coupon.code.toLowerCase());
    if (index >= 0) {
      coupons[index] = coupon;
    } else {
      coupons.unshift(coupon);
    }
    safeSet(STORAGE_KEYS.COUPONS, coupons);
    FirestoreService.saveDoc('coupons', coupon.id, coupon).catch(() => {});
    try {
      window.dispatchEvent(new CustomEvent('nebula_coupons_updated'));
    } catch {}
  },

  deleteCoupon(couponId: string): void {
    const coupons = this.getCoupons().filter(c => c.id !== couponId);
    safeSet(STORAGE_KEYS.COUPONS, coupons);
    FirestoreService.deleteDoc('coupons', couponId).catch(() => {});
    try {
      window.dispatchEvent(new CustomEvent('nebula_coupons_updated'));
    } catch {}
  },

  toggleCouponStatus(couponId: string): boolean {
    const coupons = this.getCoupons();
    const target = coupons.find(c => c.id === couponId);
    if (target) {
      target.status = target.status === 'active' ? 'inactive' : 'active';
      this.saveCoupon(target);
      return target.status === 'active';
    }
    return false;
  },

  validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; discountAmount: number; message: string } {
    if (!code || !code.trim()) {
      return { valid: false, discountAmount: 0, message: 'অনুগ্রহ করে কুপন কোড লিখুন (Please enter coupon code)' };
    }
    const cleanCode = code.trim().toUpperCase();
    const coupons = this.getCoupons();
    const coupon = coupons.find(c => c.code.trim().toUpperCase() === cleanCode);

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'অকার্যকর কুপন কোড (Invalid coupon code)' };
    }

    if (coupon.status !== 'active') {
      return { valid: false, discountAmount: 0, message: 'এই কুপনটি বর্তমানে নিষ্ক্রিয় রয়েছে (Coupon inactive)' };
    }

    if (coupon.expiresAt) {
      const expiry = new Date(coupon.expiresAt);
      if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
        return { valid: false, discountAmount: 0, message: 'এই কুপনের মেয়াদ শেষ হয়ে গেছে (Coupon expired)' };
      }
    }

    if (coupon.usageLimit && (coupon.timesUsed || 0) >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, message: 'এই কুপনের সর্বোচ্চ ব্যবহারের সীমা শেষ হয়ে গেছে (Usage limit reached)' };
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `এই কুপনের জন্য সর্বনিম্ন ৳${coupon.minOrderAmount} টাকার অর্ডার প্রয়োজন (Min order ৳${coupon.minOrderAmount})`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    return {
      valid: true,
      coupon,
      discountAmount: Math.max(0, discount),
      message: `কুপন "${coupon.code}" সফলভাবে প্রয়োগ করা হয়েছে! (৳${discount} ছাড়)`
    };
  },

  recordCouponUsage(couponIdOrCode: string): void {
    const coupons = this.getCoupons();
    const target = coupons.find(c => c.id === couponIdOrCode || c.code.toUpperCase() === couponIdOrCode.toUpperCase());
    if (target) {
      target.timesUsed = (target.timesUsed || 0) + 1;
      this.saveCoupon(target);
    }
  },

  // --- FIREBASE CLOUD DATABASE OPERATIONS ---
  async syncAllToFirestore(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      const prods = this.getProducts();
      const cats = this.getCategories();
      const ords = this.getOrders();
      const bans = this.getBanners();
      const stngs = this.getSettings();
      const cpns = this.getCoupons();
      const custs = this.getCustomerAccounts();

      let pCount = await FirestoreService.pushBatch('products', prods);
      let cCount = await FirestoreService.pushBatch('categories', cats);
      let oCount = await FirestoreService.pushBatch('orders', ords);
      let bCount = await FirestoreService.pushBatch('banners', bans);
      let cpCount = await FirestoreService.pushBatch('coupons', cpns);
      let custCount = await FirestoreService.pushBatch('customerAccounts', custs);
      await FirestoreService.saveDoc('settings', 'global_settings', stngs);

      return {
        success: true,
        message: `ফায়ারবেস ক্লাউডে সফলভাবে সিঙ্ক হয়েছে! (${pCount} প্রোডাক্ট, ${cCount} ক্যাটাগরি, ${oCount} অর্ডার, ${bCount} ব্যানার, ${cpCount} কুপন)`,
        details: { pCount, cCount, oCount, bCount, cpCount, custCount }
      };
    } catch (err: any) {
      console.error('Firebase sync error:', err);
      return {
        success: false,
        message: `Firebase Sync Error: ${err?.message || 'Failed to sync to cloud'}`
      };
    }
  },

  async fetchAllFromFirestore(): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const [remoteProducts, remoteCats, remoteOrders, remoteBanners, remoteCoupons, remoteSettings, remoteDbConfig] = await Promise.all([
        FirestoreService.getCollection<Product>('products'),
        FirestoreService.getCollection<Category>('categories'),
        FirestoreService.getCollection<Order>('orders'),
        FirestoreService.getCollection<HeroBanner>('banners'),
        FirestoreService.getCollection<Coupon>('coupons'),
        FirestoreService.getCollection<StoreSettings>('settings'),
        FirestoreService.getSingleDoc<DatabaseConfig>('settings', 'database_config')
      ]);

      let count = 0;
      if (remoteProducts && remoteProducts.length > 0) {
        safeSet(STORAGE_KEYS.PRODUCTS, remoteProducts);
        count += remoteProducts.length;
      }
      if (remoteCats && remoteCats.length > 0) {
        safeSet(STORAGE_KEYS.CATEGORIES, remoteCats);
      }
      if (remoteOrders && remoteOrders.length > 0) {
        safeSet(STORAGE_KEYS.ORDERS, remoteOrders);
      }
      if (remoteBanners && remoteBanners.length > 0) {
        safeSet(STORAGE_KEYS.BANNERS, remoteBanners);
      }
      if (remoteCoupons && remoteCoupons.length > 0) {
        safeSet(STORAGE_KEYS.COUPONS, remoteCoupons);
      }
      if (remoteSettings && remoteSettings.length > 0) {
        const found = remoteSettings.find((s: any) => (s as any).id === 'global_settings') || remoteSettings[0];
        if (found) safeSet(STORAGE_KEYS.SETTINGS, found);
      }
      if (remoteDbConfig && (remoteDbConfig.hostUrl || remoteDbConfig.storageMode)) {
        safeSet(STORAGE_KEYS.DB_CONFIG, remoteDbConfig);
        if (remoteDbConfig.storageMode === 'supabase' && remoteDbConfig.hostUrl && remoteDbConfig.apiKey) {
          this.fetchFromSupabaseAndHydrate().catch(() => {});
        }
      }

      window.dispatchEvent(new CustomEvent('nebula_products_updated'));
      window.dispatchEvent(new CustomEvent('nebula_order_updated'));
      window.dispatchEvent(new CustomEvent('nebula_banners_updated'));
      window.dispatchEvent(new CustomEvent('nebula_coupons_updated'));
      window.dispatchEvent(new CustomEvent('nebula_settings_updated'));

      return {
        success: true,
        message: `ক্লাউড থেকে সফলভাবে ডেটা লোড হয়েছে! (${count}টি প্রোডাক্ট সিঙ্ক হয়েছে)`,
        count
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Fetch failed: ${err?.message}`
      };
    }
  },

  initFirebaseSync(): void {
    if (typeof window === 'undefined') return;

    // Realtime listeners across devices
    FirestoreService.subscribeCollection<Product>('products', (cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        safeSet(STORAGE_KEYS.PRODUCTS, cloudProducts);
        window.dispatchEvent(new CustomEvent('nebula_products_updated'));
      }
    });

    FirestoreService.subscribeCollection<Category>('categories', (cloudCats) => {
      if (cloudCats && cloudCats.length > 0) {
        safeSet(STORAGE_KEYS.CATEGORIES, cloudCats);
        window.dispatchEvent(new CustomEvent('nebula_categories_updated'));
      }
    });

    FirestoreService.subscribeCollection<HeroBanner>('banners', (cloudBanners) => {
      if (cloudBanners && cloudBanners.length > 0) {
        safeSet(STORAGE_KEYS.BANNERS, cloudBanners);
        window.dispatchEvent(new CustomEvent('nebula_banners_updated'));
      }
    });

    FirestoreService.subscribeCollection<Coupon>('coupons', (cloudCoupons) => {
      if (cloudCoupons && cloudCoupons.length > 0) {
        safeSet(STORAGE_KEYS.COUPONS, cloudCoupons);
        window.dispatchEvent(new CustomEvent('nebula_coupons_updated'));
      }
    });

    FirestoreService.subscribeCollection<Order>('orders', (cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        safeSet(STORAGE_KEYS.ORDERS, cloudOrders);
        window.dispatchEvent(new CustomEvent('nebula_order_updated'));
      }
    });

    // Realtime listener for global store settings
    FirestoreService.subscribeDoc<StoreSettings>('settings', 'global_settings', (cloudSettings) => {
      if (cloudSettings) {
        safeSet(STORAGE_KEYS.SETTINGS, cloudSettings);
        window.dispatchEvent(new CustomEvent('nebula_settings_updated'));
      }
    });

    // Realtime listener for cross-device database config (Supabase / Cloud keys)
    FirestoreService.subscribeDoc<DatabaseConfig>('settings', 'database_config', (cloudDbConfig) => {
      if (cloudDbConfig && (cloudDbConfig.hostUrl || cloudDbConfig.storageMode)) {
        safeSet(STORAGE_KEYS.DB_CONFIG, cloudDbConfig);
        if (cloudDbConfig.storageMode === 'supabase' && cloudDbConfig.hostUrl && cloudDbConfig.apiKey) {
          StorageService.fetchFromSupabaseAndHydrate()
            .then(() => {
              window.dispatchEvent(new CustomEvent('nebula_products_updated'));
              window.dispatchEvent(new CustomEvent('nebula_categories_updated'));
              window.dispatchEvent(new CustomEvent('nebula_banners_updated'));
            })
            .catch(() => {});
        }
      }
    });

    // Initial check & auto-pull on startup
    setTimeout(async () => {
      try {
        const existingCloudProds = await FirestoreService.getCollection<Product>('products');
        if (!existingCloudProds || existingCloudProds.length === 0) {
          await StorageService.syncAllToFirestore();
        } else {
          // If remote cloud has products, hydrate to ensure fresh remote data is active
          safeSet(STORAGE_KEYS.PRODUCTS, existingCloudProds);
          window.dispatchEvent(new CustomEvent('nebula_products_updated'));
        }
      } catch {}
    }, 1200);
  }
};
