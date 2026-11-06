import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Send,
  Printer,
  Search,
  ExternalLink,
  DollarSign,
  AlertTriangle,
  Download,
  Upload,
  Copy,
  Check,
  Flame,
  Zap,
  Layers,
  Sparkles,
  RotateCcw,
  TrendingUp,
  Users,
  CreditCard,
  Lock,
  Shield,
  Activity,
  BarChart3,
  Target,
  PieChart,
  Bell,
  ArrowUpRight,
  Eye,
  SlidersHorizontal,
  Globe,
  Database,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Tag
} from 'lucide-react';
import { Product, Order, Category, StoreSettings, Language, OrderStatus, AdminUser, HeroBanner } from '../../types';
import { t } from '../../lib/translations';
import { StorageService } from '../../lib/storage';
import { ImageDropZone } from './ImageDropZone';
import { AdminCategories } from './AdminCategories';
import { AdminCouriers } from './AdminCouriers';
import { AdminBanners } from './AdminBanners';
import { AdminStaff } from './AdminStaff';
import { AdminSecuritySettings } from './AdminSecuritySettings';
import { AdminPayments } from './AdminPayments';
import { AdminDatabase } from './AdminDatabase';
import { AdminCoupons } from './AdminCoupons';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onProductsUpdated: () => void;
  onOrdersUpdated: () => void;
}

// Navigation tabs supported
export type AdminTab = 
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'coupons'
  | 'banners'
  | 'couriers'
  | 'payments'
  | 'database'
  | 'staff'
  | 'security'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  lang: initialLang,
  onProductsUpdated,
  onOrdersUpdated
}) => {
  const [adminLang, setAdminLang] = useState<Language>(() => {
    return (localStorage.getItem('nebula_admin_lang') as Language) || initialLang || 'bn';
  });
  const lang = adminLang;
  const strings = t[lang];

  const handleToggleAdminLang = () => {
    setAdminLang((prev) => {
      const next = prev === 'bn' ? 'en' : 'bn';
      localStorage.setItem('nebula_admin_lang', next);
      return next;
    });
  };

  // Auth State (Real user authentication via StorageService)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const user = StorageService.getCurrentUser();
    if (user) return user;
    // If was previously authenticated with legacy flag, default to master admin
    if (localStorage.getItem('nebula_admin_auth') === 'true') {
      const admins = StorageService.getAdminUsers();
      return admins[0] || null;
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nebula_admin_auth') === 'true';
  });

  const [loginEmail, setLoginEmail] = useState('admin@nebulamart.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const tabsScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (tabsScrollRef.current) {
      const activeBtn = tabsScrollRef.current.querySelector(`[data-tab-id="${activeTab}"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeTab]);

  // Live Data states
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [banners, setBanners] = useState<HeroBanner[]>(() => StorageService.getBanners());
  const [settings, setSettings] = useState<StoreSettings>(() => StorageService.getSettings());

  // Filter & Search states
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Selected Order for Invoice view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Custom Delete Target Modal State (No window.confirm!)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'category';
    id: string;
    name: string;
  } | null>(null);

  // Global In-App Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Product Add/Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formNameBn, setFormNameBn] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCategoryBn, setFormCategoryBn] = useState('');
  const [formPrice, setFormPrice] = useState<number>(1000);
  const [formComparePrice, setFormComparePrice] = useState<number>(1200);
  const [formStock, setFormStock] = useState<number>(20);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState('');
  const [formDescriptionBn, setFormDescriptionBn] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>(['']);
  const [formBrand, setFormBrand] = useState('Nebula Mart');
  const [formIsHotSelling, setFormIsHotSelling] = useState(false);
  const [formIsFlashDeal, setFormIsFlashDeal] = useState(false);
  const [formBadge, setFormBadge] = useState('');

  // Courier notification toast
  const [courierToast, setCourierToast] = useState<{ message: string; type: 'steadfast' | 'pathao' } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const refreshAll = () => {
    setOrders(StorageService.getOrders());
    setProducts(StorageService.getProducts());
    setCategories(StorageService.getCategories());
    setSettings(StorageService.getSettings());
    onProductsUpdated();
    onOrdersUpdated();
  };

  useEffect(() => {
    if (isOpen) {
      refreshAll();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOrderEvent = () => {
      setOrders(StorageService.getOrders());
    };
    window.addEventListener('nebula_order_updated', handleOrderEvent);
    window.addEventListener('storage', handleOrderEvent);
    return () => {
      window.removeEventListener('nebula_order_updated', handleOrderEvent);
      window.removeEventListener('storage', handleOrderEvent);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = StorageService.authenticateAdmin(loginEmail, loginPassword);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      setAuthError('');
      showToast(
        lang === 'bn'
          ? `স্বাগতম, ${result.user.name} (${result.user.role === 'admin' ? 'অ্যাডমিন' : 'মডারেটর'})!`
          : `Welcome back, ${result.user.name} (${result.user.role})!`
      );
    } else {
      setAuthError(
        result.error ||
          (lang === 'bn' ? 'ভুল ইমেইল বা পাসওয়ার্ড' : 'Invalid credentials. Please verify your login details.')
      );
    }
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    showToast(lang === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Successfully logged out', 'info');
  };

  // Courier Dispatch actions
  const handleDispatchSteadfast = (orderId: string) => {
    const res = StorageService.dispatchSteadfastCourier(orderId);
    if (res.success) {
      refreshAll();
      showToast(
        lang === 'bn'
          ? `স্টেডফাস্ট কুরিয়ারে বুকিং সম্পন্ন! ট্র্যাকিং নং: ${res.trackingId}`
          : `Booked on Steadfast Courier! Tracking ID: ${res.trackingId}`,
        'success'
      );
    }
  };

  const handleDispatchPathao = (orderId: string) => {
    const res = StorageService.dispatchPathaoCourier(orderId);
    if (res.success) {
      refreshAll();
      showToast(
        lang === 'bn'
          ? `পাঠাও কুরিয়ারে অর্ডার প্রেরণ সম্পন্ন! ট্র্যাকিং নং: ${res.trackingId}`
          : `Dispatched to Pathao Courier! Consignment ID: ${res.trackingId}`,
        'success'
      );
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    StorageService.updateOrderStatus(orderId, newStatus);
    refreshAll();
    showToast(lang === 'bn' ? 'অর্ডারের স্ট্যাটাস পরিবর্তিত হয়েছে' : 'Order status updated', 'success');
  };

  // Product Add / Edit
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormName('');
    setFormNameBn('');
    setFormSku(`NM-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategory(categories[0]?.name || 'Smart Gadgets');
    setFormCategoryBn(categories[0]?.nameBn || 'স্মার্ট গ্যাজেটস');
    setFormPrice(1200);
    setFormComparePrice(1500);
    setFormStock(25);
    setFormImages([]);
    setFormDescription('');
    setFormDescriptionBn('');
    setFormFeatures(['100% Genuine Quality']);
    setFormBrand('Nebula Mart');
    setFormIsHotSelling(false);
    setFormIsFlashDeal(false);
    setFormBadge('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormNameBn(prod.nameBn);
    setFormSku(prod.sku);
    setFormCategory(prod.category);
    setFormCategoryBn(prod.categoryBn);
    setFormPrice(prod.price);
    setFormComparePrice(prod.compareAtPrice);
    setFormStock(prod.stock);
    setFormImages(prod.images);
    setFormDescription(prod.description);
    setFormDescriptionBn(prod.descriptionBn);
    setFormFeatures(prod.features.length > 0 ? prod.features : ['']);
    setFormBrand(prod.brand || 'Nebula Mart');
    setFormIsHotSelling(Boolean(prod.isHotSelling || prod.isFeatured));
    setFormIsFlashDeal(Boolean(prod.isFlashDeal));
    setFormBadge(prod.badge || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0) return;

    const discountPercentage = formComparePrice > formPrice
      ? Math.round(((formComparePrice - formPrice) / formComparePrice) * 100)
      : 0;

    const cleanImages = formImages.length > 0
      ? formImages
      : ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'];

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: formName.trim(),
      nameBn: formNameBn.trim() || formName.trim(),
      slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sku: formSku.trim() || `NM-${Math.floor(100 + Math.random() * 900)}`,
      category: formCategory,
      categoryBn: formCategoryBn || formCategory,
      price: formPrice,
      compareAtPrice: formComparePrice,
      discountPercentage,
      stock: formStock,
      images: cleanImages,
      description: formDescription.trim(),
      descriptionBn: formDescriptionBn.trim() || formDescription.trim(),
      features: formFeatures.filter(f => f.trim().length > 0),
      featuresBn: formFeatures.filter(f => f.trim().length > 0),
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 0,
      inStock: formStock > 0,
      brand: formBrand,
      isFeatured: formIsHotSelling,
      isHotSelling: formIsHotSelling,
      isFlashDeal: formIsFlashDeal,
      badge: formBadge.trim() || undefined,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString().split('T')[0]
    };

    StorageService.saveProduct(newProduct);
    refreshAll();
    setIsProductModalOpen(false);
    showToast(strings.productSavedSuccess, 'success');
  };

  // Quick 1-click toggles for Hot Selling and Flash Deal
  const handleToggleHotSelling = (prod: Product) => {
    const isNowHot = !(prod.isHotSelling || prod.isFeatured);
    const updated: Product = {
      ...prod,
      isHotSelling: isNowHot,
      isFeatured: isNowHot
    };
    StorageService.saveProduct(updated);
    refreshAll();
    showToast(
      lang === 'bn'
        ? (isNowHot ? `🔥 "${prod.name}" মেগা হট সেলিং হিসেবে চিহ্নিত হয়েছে!` : `"${prod.name}" হট সেলিং থেকে সরানো হয়েছে`)
        : (isNowHot ? `🔥 "${prod.name}" marked as Hot Selling!` : `"${prod.name}" removed from Hot Selling`),
      'success'
    );
  };

  const handleToggleFlashDeal = (prod: Product) => {
    const isNowFlash = !prod.isFlashDeal;
    const updated: Product = {
      ...prod,
      isFlashDeal: isNowFlash
    };
    StorageService.saveProduct(updated);
    refreshAll();
    showToast(
      lang === 'bn'
        ? (isNowFlash ? `⚡ "${prod.name}" ফ্ল্যাশ ডিলে যুক্ত হয়েছে!` : `"${prod.name}" ফ্ল্যাশ ডিল থেকে সরানো হয়েছে`)
        : (isNowFlash ? `⚡ "${prod.name}" added to Flash Deals!` : `"${prod.name}" removed from Flash Deals`),
      'success'
    );
  };

  // Confirm delete product or category (no window.confirm!)
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'product') {
      StorageService.deleteProduct(deleteTarget.id);
      refreshAll();
      showToast(strings.productDeletedSuccess, 'success');
    } else if (deleteTarget.type === 'category') {
      StorageService.deleteCategory(deleteTarget.id);
      refreshAll();
      showToast(strings.categoryDeletedSuccess, 'success');
    }

    setDeleteTarget(null);
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);
    refreshAll();
    showToast(lang === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings updated successfully!', 'success');
  };

  // Start Completely Fresh Store (User explicit request: "এমন ওয়েবসাইট দেবা যেখানে তোমার একবারে সবকিছু নতুন থাকবে। আমি অ্যাডমিন প্যানেলের মাধ্যমে ওইগুলো অ্যাড করবো")
  const handleStartFreshStore = () => {
    const confirmMessage = lang === 'bn'
      ? 'আপনি কি নিশ্চিত যে আপনি সকল ডেমো প্রোডাক্ট, ক্যাটাগরি ও অর্ডার মুছে ফেলে একটি সম্পূর্ণ ফ্রেশ ও খালি স্টোর শুরু করতে চান?\n\n(আপনি পরে চাইলে যেকোনো সময় "স্যাম্পল পণ্য লোড" বাটনে ক্লিক করে আবার ডেমো ডাটা ফিরিয়ে আনতে পারবেন)'
      : 'Are you sure you want to clear all demo products, categories, and orders to start a 100% fresh store?\n\n(You can restore sample data anytime via "Load Sample Products")';

    if (window.confirm(confirmMessage)) {
      StorageService.startFreshStore();
      refreshAll();
      showToast(lang === 'bn' ? 'স্টোর সম্পূর্ণ নতুন ও খালি করা হয়েছে! এখন আপনি নতুন ক্যাটাগরি ও প্রোডাক্ট অ্যাড করুন।' : 'Store is now completely clean and fresh for your custom products!', 'success');
    }
  };

  // Restore Starter Demo Catalog
  const handleLoadSampleCatalog = () => {
    StorageService.resetToDefault();
    refreshAll();
    showToast(lang === 'bn' ? 'স্যাম্পল প্রোডাক্ট এবং ক্যাটাগরি সফলভাবে লোড হয়েছে।' : 'Sample products and catalog restored successfully.', 'success');
  };

  // Real-Time Analytics derived strictly from actual live orders
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const shippedOrdersCount = orders.filter(o => o.status === 'shipped').length;
  const processedPaymentsTotal = validOrders.reduce((acc, o) => acc + o.total, 0);

  // Real unique customer calculations
  const uniqueCustomerMap = new Map<string, { name: string; phone: string; count: number; totalSpent: number }>();
  orders.forEach(o => {
    const key = (o.customerPhone || o.customerName || 'customer').trim();
    if (!key) return;
    const existing = uniqueCustomerMap.get(key);
    if (existing) {
      existing.count += 1;
      existing.totalSpent += o.total;
    } else {
      uniqueCustomerMap.set(key, {
        name: o.customerName || 'Customer',
        phone: o.customerPhone || 'N/A',
        count: 1,
        totalSpent: o.total
      });
    }
  });

  const uniqueCustomersCount = uniqueCustomerMap.size;
  const repeatCustomersCount = Array.from(uniqueCustomerMap.values()).filter(c => c.count > 1).length;

  // Real 7-day breakdown: last 7 days including today
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayName = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
    
    const dayOrders = orders.filter(o => {
      if (!o.createdAt) return false;
      return o.createdAt.startsWith(dateKey) && o.status !== 'cancelled';
    });
    
    const daySales = dayOrders.reduce((sum, o) => sum + o.total, 0);
    const dayOrderCount = dayOrders.length;
    
    return {
      date: dateKey,
      label: dayName,
      sales: daySales,
      orders: dayOrderCount
    };
  });

  const weeklySales = last7DaysData.reduce((sum, day) => sum + day.sales, 0);
  const weeklyOrdersCount = last7DaysData.reduce((sum, day) => sum + day.orders, 0);
  const dailyAverageSales = Math.round(weeklySales / 7);
  const maxDaySales = Math.max(...last7DaysData.map(d => d.sales), 1);
  const maxDayOrders = Math.max(...last7DaysData.map(d => d.orders), 1);

  // Dynamic Monthly Target Goal
  const monthlyGoalTarget = 25000;
  const goalAchievedPercent = Math.min(100, Math.round((totalRevenue / monthlyGoalTarget) * 100));
  const remainingForGoal = Math.max(0, monthlyGoalTarget - totalRevenue);
  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 1200;
  const ordersNeededToReachGoal = remainingForGoal > 0 ? Math.ceil(remainingForGoal / (averageOrderValue || 1200)) : 0;

  // Real fulfillment percentage
  const fulfillmentRate = totalOrdersCount > 0
    ? Math.round(((deliveredOrdersCount + shippedOrdersCount) / totalOrdersCount) * 100)
    : 0;

  const filteredOrders = orders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customerPhone.includes(orderSearch);
    return matchesFilter && matchesSearch;
  });

  // If modal not open, return null after all hooks
  if (!isOpen) return null;

  // Login View if not logged in
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-2xl relative">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleToggleAdminLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#FF6B35] text-xs font-bold transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'English Version' : 'বাংলা ভার্সন'}</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer text-base"
            >
              ✕
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-[#0F172A] p-0.5 mx-auto mb-3 shadow-md overflow-hidden flex items-center justify-center">
              <img
                src={settings.logoUrl || '/logo/nebula-mart.svg'}
                alt="Nebula Mart"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo/nebula-mart.svg';
                }}
              />
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A]">
              {strings.adminLogin}
            </h2>
            <p className="text-xs text-[#64748B] mt-1">
              {lang === 'bn' ? 'নেবুলা মার্ট অ্যাডমিন কন্ট্রোল প্যানেল' : 'Nebula Mart Secure Portal'}
            </p>
          </div>

          {authError && (
            <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-semibold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {strings.adminEmail}
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {strings.adminPassword}
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900"
              />
            </div>

            <div className="p-2.5 rounded-md bg-slate-100 text-[11px] text-slate-500">
              Demo Access: <span className="font-mono text-slate-800">admin@nebulamart.com</span> / <span className="font-mono text-slate-800">admin123</span>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-[#FF6B35] hover:bg-[#E85924] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              {strings.loginButton}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const ADMIN_TABS = [
    { id: 'dashboard' as AdminTab, labelBn: 'ড্যাশবোর্ড', labelEn: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    { id: 'orders' as AdminTab, labelBn: 'অর্ডারসমূহ', labelEn: 'Orders', icon: ShoppingBag, permission: 'orders', badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { id: 'products' as AdminTab, labelBn: 'প্রোডাক্টস', labelEn: 'Products', icon: Package, permission: 'products' },
    { id: 'categories' as AdminTab, labelBn: 'ক্যাটাগরি', labelEn: 'Categories', icon: Layers, permission: 'categories' },
    { id: 'coupons' as AdminTab, labelBn: 'কুপন ডিসকাউন্ট', labelEn: 'Coupons', icon: Tag, permission: 'coupons' },
    { id: 'banners' as AdminTab, labelBn: 'ব্যানার', labelEn: 'Banners', icon: SlidersHorizontal, permission: 'banners' },
    { id: 'couriers' as AdminTab, labelBn: 'কুরিয়ার', labelEn: 'Couriers', icon: Truck, permission: 'couriers' },
    { id: 'payments' as AdminTab, labelBn: 'পেমেন্ট', labelEn: 'Payments', icon: CreditCard, permission: 'payments' },
    { id: 'database' as AdminTab, labelBn: 'ডাটাবেস', labelEn: 'Database', icon: Database, permission: 'settings' },
    { id: 'staff' as AdminTab, labelBn: 'স্টাফ ও রোলস', labelEn: 'Staff & Roles', icon: Users, permission: 'staff' },
    { id: 'security' as AdminTab, labelBn: 'সিকিউরিটি', labelEn: 'Security', icon: Shield, permission: 'settings' },
    { id: 'settings' as AdminTab, labelBn: 'সেটিংস', labelEn: 'Settings', icon: Settings, permission: 'settings' },
  ].filter(tab => {
    if (!currentUser) return true;
    if (currentUser.role === 'admin') return true;
    return currentUser.permissions?.[tab.permission as keyof typeof currentUser.permissions];
  });

  return (
    <div className="fixed inset-0 z-50 flex bg-white overflow-hidden text-slate-900">
      {/* Toast notification for courier actions */}
      {courierToast && (
        <div className="fixed top-5 right-5 z-60 animate-in slide-in-from-top duration-300">
          <div className="p-4 rounded-xl shadow-xl border bg-white border-emerald-300 flex items-center gap-3">
            <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase">
                {courierToast.type === 'steadfast' ? 'Steadfast Courier' : 'Pathao Courier'}
              </h4>
              <p className="text-xs text-slate-600">{courierToast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar - Pure White Architecture */}
      <aside className="w-64 bg-white text-slate-900 flex flex-col justify-between shrink-0 hidden md:flex border-r border-slate-200">
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-slate-200 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-xl bg-white p-0.5 border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/logo/nebula-mart.svg?v=2"
                alt="Nebula Mart"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo/nebula-mart.svg';
                }}
              />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight block text-slate-900">Nebula Mart</span>
              <span className="text-[10px] text-emerald-600 uppercase tracking-wider font-bold">
                ● Admin Control Hub
              </span>
            </div>
          </div>

          {/* Current Admin / Staff Profile Badge */}
          {currentUser && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${currentUser.role === 'admin' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                    {currentUser.role === 'admin' ? (lang === 'bn' ? 'অ্যাডমিন' : 'Super Admin') : (lang === 'bn' ? 'মডারেটর' : 'Moderator')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {(currentUser?.role === 'admin' || currentUser?.permissions?.dashboard) && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{strings.dashboard}</span>
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.permissions?.orders) && (
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'orders' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{strings.orders}</span>
                </div>
                {pendingOrdersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.permissions?.products) && (
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'products' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>{strings.products}</span>
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.permissions?.categories) && (
              <button
                onClick={() => setActiveTab('categories')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'categories' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{strings.categories}</span>
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.permissions?.coupons) && (
              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'coupons' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>{lang === 'bn' ? 'কুপন ডিসকাউন্ট' : 'Coupons & Promo'}</span>
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.permissions?.banners) && (
              <button
                onClick={() => setActiveTab('banners')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'banners' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{lang === 'bn' ? 'ব্যানার স্লাইডার' : 'Hero Banners'}</span>
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.permissions?.couriers) && (
              <button
                onClick={() => setActiveTab('couriers')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'couriers' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>{strings.couriers} (Steadfast/Pathao)</span>
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.permissions?.payments) && (
              <button
                onClick={() => setActiveTab('payments')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'payments' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{lang === 'bn' ? 'পেমেন্ট গেটওয়ে' : 'Payment Methods'}</span>
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.permissions?.staff) && (
              <button
                onClick={() => setActiveTab('staff')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'staff' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{lang === 'bn' ? 'মডারেটর ও রোল' : 'Staff & Roles'}</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'security' 
                  ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{lang === 'bn' ? 'পাসওয়ার্ড সিকিউরিটি' : 'Change Password'}</span>
            </button>

            {(currentUser?.role === 'admin' || currentUser?.permissions?.settings) && (
              <button
                onClick={() => setActiveTab('database')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'database' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-[#112A7E]" />
                  <span>{lang === 'bn' ? 'ডাটাবেস ও স্টোরেজ' : 'Database & Hosting'}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Auto-Save Active" />
              </button>
            )}

            {(currentUser?.role === 'admin' || currentUser?.permissions?.settings) && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'settings' 
                    ? 'bg-orange-50 text-[#FF6B35] shadow-xs border-l-4 border-[#FF6B35]' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{strings.settings}</span>
              </button>
            )}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-200 space-y-2 bg-white">
          {/* Admin Language Toggle Button in Sidebar */}
          <button
            onClick={handleToggleAdminLang}
            className="w-full py-2 px-3 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#FF6B35] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
            title="Toggle Admin Language (English / বাংলা)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'স্টোরে ফিরে যান' : 'Back to Storefront'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{strings.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Pure White Architecture */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white text-slate-900">
        {/* Top Header Bar */}
        <header className="h-14 sm:h-16 border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between bg-white shrink-0 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Carousel / Drawer Trigger Button */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B35] border border-orange-200 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer select-none"
                title={lang === 'bn' ? 'নেভিগেশন মেনু খুলুন' : 'Open Navigation Menu'}
                aria-label="Toggle Admin Navigation"
              >
                <Menu className="w-4 h-4 text-[#FF6B35]" />
                <span className="truncate max-w-[100px] sm:max-w-[130px]">
                  {ADMIN_TABS.find(t => t.id === activeTab)?.[lang === 'bn' ? 'labelBn' : 'labelEn'] || activeTab}
                </span>
                <ChevronDown className="w-3 h-3 text-[#FF6B35]/70 shrink-0" />
              </button>
            </div>

            {/* Desktop Tab Heading */}
            <h1 className="hidden md:block text-base font-bold text-slate-900 capitalize">
              {ADMIN_TABS.find(t => t.id === activeTab)?.[lang === 'bn' ? 'labelBn' : 'labelEn'] || `${activeTab} Management`}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language Switcher Toggle */}
            <button
              onClick={handleToggleAdminLang}
              className="px-2 sm:px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-[#FF6B35] text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
              title="Change Language / ভাষা পরিবর্তন"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">{lang === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Start Fresh Store Button */}
            <button
              onClick={handleStartFreshStore}
              className="px-2 sm:px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100 text-red-700 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
              title={lang === 'bn' ? 'সকল ডেমো ডাটা মুছে ফ্রেশ শুরু করুন' : 'Start Fresh Store'}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden sm:inline text-xs">{lang === 'bn' ? 'নতুন স্টোর' : 'Fresh'}</span>
            </button>

            {/* Load Demo Data Button */}
            <button
              onClick={handleLoadSampleCatalog}
              className="hidden min-[480px]:flex px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer transition-colors items-center gap-1"
              title={lang === 'bn' ? 'স্যাম্পল পণ্য ও ক্যাটাগরি লোড' : 'Load Samples'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline text-xs">{lang === 'bn' ? 'স্যাম্পল ডাটা' : 'Samples'}</span>
            </button>

            {/* Close Admin Button */}
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 cursor-pointer transition-colors flex items-center gap-1"
              title={lang === 'bn' ? 'অ্যাডমিন বন্ধ করুন' : 'Close'}
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">{lang === 'bn' ? 'বন্ধ করুন' : 'Close'}</span>
            </button>
          </div>
        </header>

        {/* Mobile Horizontal Carousel Tabs Ribbon with Arrow Scrolling */}
        <div className="md:hidden border-b border-slate-200 bg-slate-50/90 px-1.5 py-1.5 flex items-center gap-1 shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => scrollCarousel('left')}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-2xs active:scale-90 shrink-0 cursor-pointer"
            aria-label="Scroll Carousel Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={tabsScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar py-0.5 scroll-smooth flex-1"
          >
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 select-none ${
                    isActive
                      ? 'bg-[#FF6B35] text-white shadow-xs font-black ring-2 ring-orange-200'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{lang === 'bn' ? tab.labelBn : tab.labelEn}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black leading-none ${isActive ? 'bg-white text-[#FF6B35]' : 'bg-amber-500 text-black'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollCarousel('right')}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-2xs active:scale-90 shrink-0 cursor-pointer"
            aria-label="Scroll Carousel Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Slide-Out Navigation Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            />

            {/* Slide Drawer Panel */}
            <div className="relative w-[85vw] max-w-xs h-full bg-white shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250 border-r border-slate-200">
              <div>
                {/* Drawer Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs flex items-center justify-center overflow-hidden">
                      <img
                        src="/logo/nebula-mart.svg?v=3"
                        alt="Nebula Mart"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo/nebula-mart.svg';
                        }}
                      />
                    </div>
                    <div>
                      <span className="font-black text-sm text-slate-900 block leading-tight">Nebula Mart</span>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                        ● Admin Menu
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Current Staff Info */}
                {currentUser && (
                  <div className="m-3 p-2.5 rounded-xl bg-orange-50/60 border border-orange-200/80 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FF6B35] text-white flex items-center justify-center font-bold text-xs uppercase">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">{currentUser.role}</p>
                    </div>
                  </div>
                )}

                {/* Navigation Links list */}
                <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
                  {ADMIN_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileNavOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-orange-50 text-[#FF6B35] border-l-4 border-[#FF6B35] font-black'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B35]' : 'text-slate-500'}`} />
                          <span>{lang === 'bn' ? tab.labelBn : tab.labelEn}</span>
                        </div>
                        {tab.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50">
                <button
                  onClick={() => {
                    handleToggleAdminLang();
                    setMobileNavOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-orange-200 bg-white hover:bg-orange-50 text-[#FF6B35] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileNavOpen(false);
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'স্টোরে ফিরে যান' : 'Back to Store'}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileNavOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{strings.logout}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-5 sm:space-y-6">
          {/* TAB 1: DASHBOARD (Redesigned per Reference Screenshot 2) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome & Quick Action Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#0F172A] text-white shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">👋</span>
                    <h2 className="text-lg font-bold">
                      {lang === 'bn' 
                        ? `স্বাগতম, ${currentUser?.name || 'অ্যাডমিনিস্ট্রেটর'}!`
                        : `Welcome back, ${currentUser?.name || 'Administrator'}!`}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ● Live Store
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {lang === 'bn' 
                      ? 'মাঠ স্টোরের লাইভ সেলস, ডাটাবেস ও কুরিয়ার ডেলিভারি ড্যাশবোর্ড ওভারভিউ।'
                      : 'Mart Store live sales, database & logistics dashboard overview.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={handleOpenAddProduct}
                    className="px-3.5 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#E85924] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{strings.addProduct}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{strings.orders} ({orders.length})</span>
                  </button>
                </div>
              </div>

              {/* TOP ROW: Average Weekly Sales + 4 KPI Cards (Reference Screenshot 2) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Average Weekly Sales Hero Card (5 cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {lang === 'bn' ? 'গড় সাপ্তাহিক বিক্রি' : 'Average Weekly Sales'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                        <TrendingUp className="w-3 h-3" />
                        <span>{weeklyOrdersCount > 0 ? `+${weeklyOrdersCount} Orders` : 'Live'}</span>
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">
                        ৳{(weeklySales > 0 ? weeklySales : totalRevenue).toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {weeklySales > 0
                          ? (lang === 'bn' ? 'গত ৭ দিনের মোট' : 'last 7 days total')
                          : (lang === 'bn' ? 'বর্তমান মোট বিক্রি' : 'current total sales')}
                      </span>
                    </div>
                  </div>

                  {/* Neon Green Wave SVG Sparkline Chart - Computed strictly from real 7 days order data */}
                  <div className="my-4 relative h-28 w-full overflow-hidden">
                    {(() => {
                      const sparklinePoints = last7DaysData.map((d, i) => {
                        const x = 20 + i * 60;
                        const y = maxDaySales > 0 && d.sales > 0
                          ? Math.max(15, Math.round(95 - (d.sales / maxDaySales) * 75))
                          : 95;
                        return { x, y, sales: d.sales, label: d.label, date: d.date, orders: d.orders };
                      });
                      const pathD = sparklinePoints.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
                      const areaD = `${pathD} L 380,120 L 20,120 Z`;
                      return (
                        <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="neonGreenGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d={areaD} fill="url(#neonGreenGradient)" />
                          <path d={pathD} fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          {sparklinePoints.map((p, i) => (
                            <circle
                              key={i}
                              cx={p.x}
                              cy={p.y}
                              r={p.sales > 0 ? "4.5" : "3"}
                              fill={p.sales > 0 ? "#10B981" : "#FFFFFF"}
                              stroke={p.sales > 0 ? "#FFFFFF" : "#10B981"}
                              strokeWidth="2"
                            >
                              <title>{`${p.label} (${p.date}): ৳${p.sales.toLocaleString()} (${p.orders} orders)`}</title>
                            </circle>
                          ))}
                        </svg>
                      );
                    })()}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'দৈনিক গড়' : 'Daily Average'}</span>
                      <span className="font-bold text-slate-800">৳{dailyAverageSales.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'কনভার্সন রেট' : 'Conversion Rate'}</span>
                      <span className="font-bold text-emerald-600">{fulfillmentRate}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">{lang === 'bn' ? 'সফল ডেলিভারি' : 'Fulfillment'}</span>
                      <span className="font-bold text-slate-800">{deliveredOrdersCount}/{orders.length}</span>
                    </div>
                  </div>
                </div>

                {/* 4 KPI Grid Metric Cards (7 cols) - Strictly derived from live orders */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Metric 1: Orders */}
                  <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 shadow-xs flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                        {lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
                      </span>
                      <p className="text-2xl font-black text-slate-900 mt-1">{orders.length}</p>
                      <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>
                          {orders.length > 0 
                            ? (lang === 'bn' ? `● ${orders.length}টি লাইভ অর্ডার নথিভুক্ত` : `● ${orders.length} verified live orders`) 
                            : (lang === 'bn' ? '● এখনো কোনো অর্ডার আসেনি' : '● No orders placed yet')}
                        </span>
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Metric 2: Income */}
                  <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 shadow-xs flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        {lang === 'bn' ? 'মোট আয়' : 'Total Revenue'}
                      </span>
                      <p className="text-2xl font-black text-slate-900 mt-1">৳{totalRevenue.toLocaleString()}</p>
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                        <span>● {validOrders.length} {lang === 'bn' ? 'টি অর্ডারের কার্যকর মূল্য' : 'valid orders total'}</span>
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Metric 3: Notifications / Pending */}
                  <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 shadow-xs flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                        {lang === 'bn' ? 'পেন্ডিং অর্ডার' : 'Pending Review'}
                      </span>
                      <p className="text-2xl font-black text-slate-900 mt-1">{pendingOrdersCount}</p>
                      <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                        <span>
                          {pendingOrdersCount > 0 
                            ? (lang === 'bn' ? '● কল ভেরিফিকেশন ও বুকিং আবশ্যক' : '● Needs customer confirmation') 
                            : (lang === 'bn' ? '● কোনো পেন্ডিং অর্ডার নেই' : '● All orders processed')}
                        </span>
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                      <Bell className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Metric 4: Payments */}
                  <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/40 shadow-xs flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                        {lang === 'bn' ? 'গৃহীত পেমেন্ট' : 'Processed Payments'}
                      </span>
                      <p className="text-2xl font-black text-slate-900 mt-1">৳{processedPaymentsTotal.toLocaleString()}</p>
                      <span className="text-[11px] text-purple-600 font-semibold flex items-center gap-1 mt-1">
                        <span>● {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি ও এমএফএস' : 'COD, bKash & Nagad'}</span>
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: Total Users & Active Users + Sales & Views Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Users & Engagement Widget (5 cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {lang === 'bn' ? 'গ্রাহক ট্রাফিক ও সক্রিয়তা' : 'Customer Traffic & Activity'}
                    </span>
                    <span className="text-xs font-bold text-slate-400">All Bangladesh</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Total Customers with Real Equalizer Bars */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block uppercase">
                          {lang === 'bn' ? 'মোট আসল গ্রাহক' : 'Total Live Customers'}
                        </span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-2xl font-black text-slate-900">{uniqueCustomersCount}</span>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {uniqueCustomersCount === 1 ? (lang === 'bn' ? 'জন' : 'User') : (lang === 'bn' ? 'জন' : 'Users')}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                          {orders.length > 0 
                            ? (lang === 'bn' ? `● মোট ${orders.length}টি লাইভ অর্ডার` : `● ${orders.length} live orders`) 
                            : (lang === 'bn' ? '● এখনো কোনো অর্ডার আসেনি' : '● No orders placed')}
                        </span>
                      </div>

                      {/* Stylized Vertical Equalizer Bars Based on 7-Day Order Volume */}
                      <div className="mt-3 pt-2">
                        <div className="flex items-end gap-1.5 h-14">
                          {last7DaysData.map((day, i) => {
                            const barHeight = maxDayOrders > 0 && day.orders > 0
                              ? Math.max(18, Math.round((day.orders / maxDayOrders) * 100))
                              : 8;
                            return (
                              <div
                                key={i}
                                className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                                title={`${day.label} (${day.date}): ${day.orders} orders (৳${day.sales.toLocaleString()})`}
                              >
                                <div
                                  style={{ height: `${barHeight}%` }}
                                  className={`w-full rounded-xs transition-all ${
                                    day.orders > 0
                                      ? 'bg-[#F43F5E] group-hover:brightness-110 shadow-2xs'
                                      : 'bg-slate-200'
                                  }`}
                                />
                                <span className="text-[9px] text-slate-400 font-semibold truncate w-full text-center">
                                  {day.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Active Customers with Radial Gauge */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-between text-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">
                        {lang === 'bn' ? 'সক্রিয় অর্ডার রেশিও' : 'Active Orders Ratio'}
                      </span>
                      
                      {/* Circular Radial Ring */}
                      <div className="relative w-20 h-20 my-1 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-200"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#FF6B35] transition-all duration-500"
                            strokeDasharray={`${orders.length > 0 ? Math.max(10, Math.round((validOrders.length / orders.length) * 100)) : 0}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-sm font-black text-slate-900">
                            {orders.length > 0 ? `${Math.round((validOrders.length / orders.length) * 100)}%` : '0%'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-slate-800">
                          {validOrders.length} {lang === 'bn' ? 'সক্রিয় অর্ডার' : 'Active Orders'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {repeatCustomersCount > 0 
                            ? `${repeatCustomersCount} ${lang === 'bn' ? 'জন একাধিকবার অর্ডার করেছেন' : 'Repeat Customers'}`
                            : (lang === 'bn' ? '১০০% নতুন গ্রাহক' : '100% New Customers')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sales & Orders Real Timeline Bar Chart (7 cols) */}
                <div className="lg:col-span-7 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {lang === 'bn' ? 'রিসেন্ট সেলস অ্যানালিটিক্স (গত ৭ দিন)' : 'Recent Sales Analytics (Last 7 Days)'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {lang === 'bn' 
                          ? `প্রকৃত অর্ডার ডাটার ভিত্তিতে লাইভ প্রদর্শিত (মোট: ৳${weeklySales.toLocaleString()})`
                          : `Live calculation based on actual customer orders (Total: ৳${weeklySales.toLocaleString()})`}
                      </p>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#3B82F6]" />
                        <span className="font-semibold text-slate-600">{lang === 'bn' ? 'বিক্রি (৳)' : 'Sales (৳)'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#8B5CF6]" />
                        <span className="font-semibold text-slate-600">{lang === 'bn' ? 'অর্ডারের সংখ্যা' : 'Orders'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Bar Columns Chart from Real last7DaysData */}
                  <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2 border-b border-slate-100">
                    {last7DaysData.map((item, index) => {
                      const salesHeight = maxDaySales > 0 && item.sales > 0
                        ? Math.max(12, Math.round((item.sales / maxDaySales) * 100))
                        : 4;
                      const ordersHeight = maxDayOrders > 0 && item.orders > 0
                        ? Math.max(12, Math.round((item.orders / maxDayOrders) * 100))
                        : 4;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                          <div className="w-full flex items-end justify-center gap-1 h-36">
                            {/* Real Sales Bar */}
                            <div
                              style={{ height: `${salesHeight}%` }}
                              className={`w-2.5 sm:w-4 rounded-t-xs transition-all cursor-pointer ${
                                item.sales > 0 ? 'bg-[#3B82F6] hover:brightness-110' : 'bg-slate-100'
                              }`}
                              title={`${item.label} (${item.date})\n${lang === 'bn' ? 'বিক্রি' : 'Sales'}: ৳${item.sales.toLocaleString()}`}
                            />
                            {/* Real Orders Count Bar */}
                            <div
                              style={{ height: `${ordersHeight}%` }}
                              className={`w-2.5 sm:w-4 rounded-t-xs transition-all cursor-pointer ${
                                item.orders > 0 ? 'bg-[#8B5CF6] hover:brightness-110' : 'bg-slate-100'
                              }`}
                              title={`${item.label} (${item.date})\n${lang === 'bn' ? 'অর্ডার' : 'Orders'}: ${item.orders}টি`}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-600">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {orders.length > 0
                        ? (lang === 'bn' ? `সর্বশেষ বিক্রি: ${orders[0].customerName} (৳${orders[0].total.toLocaleString()})` : `Latest order: ${orders[0].customerName} (৳${orders[0].total.toLocaleString()})`)
                        : (lang === 'bn' ? 'অর্ডার আসলে সরাসরি এখানে যুক্ত হবে' : 'Orders will reflect dynamically here')}
                    </span>
                    <span className="font-bold text-[#3B82F6]">
                      ৳{weeklySales.toLocaleString()} {lang === 'bn' ? '৭ দিনের মোট' : '7-Day Total'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Sales Target / Goal + Courier Logistics Center */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Real Dynamic Sales Target Goal Card (6 cols) */}
                <div className="lg:col-span-6 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {lang === 'bn' ? 'মাসিক বিক্রয় লক্ষ্যমাত্রা' : 'Monthly Sales Target & Goal'}
                      </span>
                      <span className="text-xs font-black text-[#FF6B35]">
                        {goalAchievedPercent}% {lang === 'bn' ? 'অর্জিত' : 'Achieved'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900">৳{totalRevenue.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 font-semibold">
                        / ৳{monthlyGoalTarget.toLocaleString()} {lang === 'bn' ? 'লক্ষ্যমাত্রা' : 'Goal'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Real Proportional Width */}
                  <div className="my-4">
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#FF6B35] transition-all duration-500"
                        style={{ width: `${goalAchievedPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mt-1.5">
                      <span>৳0</span>
                      <span>৳{(monthlyGoalTarget * 0.25).toLocaleString()}</span>
                      <span>৳{(monthlyGoalTarget * 0.5).toLocaleString()}</span>
                      <span>৳{monthlyGoalTarget.toLocaleString()} Target</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/80 flex items-center justify-between text-xs">
                    <span className="text-orange-900 font-semibold">
                      {remainingForGoal > 0 ? (
                        lang === 'bn' 
                          ? `টার্গেট পূরণ হতে আর ৳${remainingForGoal.toLocaleString()} (গড়ে ~${ordersNeededToReachGoal}টি অর্ডার) প্রয়োজন।`
                          : `৳${remainingForGoal.toLocaleString()} (~${ordersNeededToReachGoal} orders) left to reach goal.`
                      ) : (
                        lang === 'bn'
                          ? '🎉 অভিনন্দন! আপনি বর্তমান বিক্রয় লক্ষ্যমাত্রা সম্পূর্ণ অর্জন করেছেন!'
                          : '🎉 Congratulations! You have achieved your sales goal!'
                      )}
                    </span>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-bold text-[#FF6B35] hover:underline shrink-0 ml-2"
                    >
                      {lang === 'bn' ? 'পণ্য প্রমোট' : 'Boost Products'}
                    </button>
                  </div>
                </div>

                {/* Courier Logistics Gateways (6 cols) */}
                <div className="lg:col-span-6 p-5 rounded-2xl border border-slate-200 bg-[#0F172A] text-white shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#FF6B35]">
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">
                          {lang === 'bn' ? 'কুরিয়ার ও পার্সেল হ্যান্ডলিং' : 'Steadfast & Pathao Gateways'}
                        </h3>
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          ● Automated Dispatch Active
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('couriers')}
                      className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold cursor-pointer"
                    >
                      {lang === 'bn' ? 'কনফিগ দেখুন' : 'Config'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[11px] text-slate-400 block font-semibold">Steadfast Courier</span>
                      <span className="text-lg font-black text-white">
                        {orders.filter(o => o.courier === 'steadfast').length} Dispatched
                      </span>
                      <span className="text-[10px] text-blue-400 block mt-0.5">API Connected</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-[11px] text-slate-400 block font-semibold">Pathao Courier</span>
                      <span className="text-lg font-black text-white">
                        {orders.filter(o => o.courier === 'pathao').length} Dispatched
                      </span>
                      <span className="text-[10px] text-red-400 block mt-0.5">API Connected</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                    <span className="text-slate-300">
                      {pendingOrdersCount > 0 
                        ? `${pendingOrdersCount} unassigned orders waiting for courier booking`
                        : 'All orders dispatched to couriers'}
                    </span>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#FF6B35] hover:underline"
                    >
                      {lang === 'bn' ? 'প্রসেস করুন →' : 'Process Orders →'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {lang === 'bn' ? 'সাম্প্রতিক অর্ডার ও কুরিয়ার বুকিং' : 'Recent Customer Orders & Express Dispatch'}
                    </h3>
                    <span className="text-[11px] text-slate-500">Live order queue from storefront checkout</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#FF6B35] hover:underline cursor-pointer"
                  >
                    {strings.viewAll} ({orders.length}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-600 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Order #</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">District</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Courier</th>
                        <th className="p-3 text-right">Express Dispatch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500 bg-slate-50/50">
                            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-slate-700">
                              {lang === 'bn' ? 'এখনো কোনো গ্রাহক অর্ডার করেননি' : 'No customer orders yet'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                              {lang === 'bn' 
                                ? 'আপনার স্টোরফ্রন্টে কোনো কাস্টমার অর্ডার প্লেস করলে তা তাৎক্ষণিকভাবে স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।' 
                                : 'When a customer places an order on your storefront checkout, it will appear here in real-time.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-bold text-slate-900">{order.orderNumber}</td>
                            <td className="p-3 font-medium text-slate-800">{order.customerName}</td>
                            <td className="p-3 font-mono text-slate-600">{order.customerPhone}</td>
                            <td className="p-3 text-slate-600">{order.district}</td>
                            <td className="p-3 font-bold text-[#0F172A]">৳{order.total}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {order.courier === 'steadfast' && (
                                <span className="text-blue-600 font-bold">Steadfast ({order.courierTrackingId})</span>
                              )}
                              {order.courier === 'pathao' && (
                                <span className="text-red-600 font-bold">Pathao ({order.courierTrackingId})</span>
                              )}
                              {order.courier === 'none' && <span className="text-slate-400">Unassigned</span>}
                            </td>
                            <td className="p-3 text-right">
                              {order.courier === 'none' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleDispatchSteadfast(order.id)}
                                    className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold cursor-pointer transition-colors"
                                    title="Send to Steadfast Courier"
                                  >
                                    Steadfast
                                  </button>
                                  <button
                                    onClick={() => handleDispatchPathao(order.id)}
                                    className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer transition-colors"
                                    title="Send to Pathao Courier"
                                  >
                                    Pathao
                                  </button>
                                </div>
                              ) : (
                                <span className="text-emerald-600 font-semibold text-[11px]">✓ Dispatched</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Order Controls: Filter & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                        orderFilter === st
                          ? 'bg-[#0F172A] text-white '
                          : 'bg-slate-100  text-slate-700  hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by Order #, Name, Phone..."
                    className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Full Orders Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="p-3">Order</th>
                        <th className="p-3">Customer Details</th>
                        <th className="p-3">Delivery Address</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Total (COD)</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Courier Service</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{order.orderNumber}</span>
                            <span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-900 block">{order.customerName}</span>
                            <span className="font-mono text-slate-600 block">{order.customerPhone}</span>
                            {order.customerEmail && <span className="text-[10px] text-slate-400">{order.customerEmail}</span>}
                          </td>
                          <td className="p-3 max-w-[200px]">
                            <span className="font-medium text-slate-700 block line-clamp-2">{order.address}</span>
                            <span className="text-[10px] text-slate-500">{order.thana ? `${order.thana}, ` : ''}{order.district}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800">{order.items.length} items</span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                              {order.items.map(i => i.productName).join(', ')}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-black text-slate-900 block">৳{order.total}</span>
                            {order.paymentMethod === 'bKash' ? (
                              <div className="mt-1 space-y-0.5">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-[#E2136E]">
                                  bKash
                                </span>
                                {order.senderNumber && (
                                  <span className="text-[10px] text-slate-600 font-mono block">
                                    From: {order.senderNumber}
                                  </span>
                                )}
                                {order.transactionId && (
                                  <span className="text-[10px] text-pink-700 font-mono font-bold block">
                                    Trx: {order.transactionId}
                                  </span>
                                )}
                              </div>
                            ) : order.paymentMethod === 'Nagad' ? (
                              <div className="mt-1 space-y-0.5">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#F7941D]">
                                  Nagad
                                </span>
                                {order.senderNumber && (
                                  <span className="text-[10px] text-slate-600 font-mono block">
                                    From: {order.senderNumber}
                                  </span>
                                )}
                                {order.transactionId && (
                                  <span className="text-[10px] text-orange-700 font-mono font-bold block">
                                    Trx: {order.transactionId}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 block">
                                COD (Del: ৳{order.deliveryCharge})
                              </span>
                            )}
                            {order.couponCode && (
                              <span className="inline-block mt-1 text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {order.couponCode} (-৳{order.discountAmount || 0})
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className="h-8 px-2 rounded border border-slate-200 bg-white text-xs font-semibold"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3">
                            {order.courier === 'steadfast' && (
                              <div className="space-y-0.5">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                                  Steadfast Courier
                                </span>
                                <span className="font-mono text-[10px] text-slate-600 block">
                                  {order.courierTrackingId}
                                </span>
                              </div>
                            )}
                            {order.courier === 'pathao' && (
                              <div className="space-y-0.5">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                                  Pathao Courier
                                </span>
                                <span className="font-mono text-[10px] text-slate-600 block">
                                  {order.courierTrackingId}
                                </span>
                              </div>
                            )}
                            {order.courier === 'none' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDispatchSteadfast(order.id)}
                                  className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  Send Steadfast
                                </button>
                                <button
                                  onClick={() => handleDispatchPathao(order.id)}
                                  className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  Send Pathao
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 text-xs cursor-pointer"
                            >
                              Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT (with Drag-and-Drop Uploader) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products by name or SKU..."
                    className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="w-full sm:w-auto h-9 px-4 rounded-lg bg-[#FF6B35] hover:bg-[#E85924] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{strings.addProduct}</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase">
                      <tr>
                        <th className="p-3">Product Image</th>
                        <th className="p-3">Product Title & SKU</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Selling Price</th>
                        <th className="p-3">Compare Price</th>
                        <th className="p-3">Stock Units</th>
                        <th className="p-3 text-center">Deals / Showcase</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {products
                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                        .map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block line-clamp-1">{prod.name}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-slate-400">SKU: {prod.sku}</span>
                                {prod.badge && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase">
                                    {prod.badge}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-slate-600">{prod.category}</td>
                            <td className="p-3 font-bold text-[#0F172A]">৳{prod.price}</td>
                            <td className="p-3 text-slate-400 line-through">৳{prod.compareAtPrice}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                prod.stock > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {prod.stock} in stock
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {/* 1-Click Hot Selling Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleHotSelling(prod)}
                                  className={`p-1.5 rounded-md border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    prod.isHotSelling || prod.isFeatured
                                      ? 'bg-amber-500 border-amber-600 text-white shadow-xs'
                                      : 'border-slate-200  text-slate-400 hover:text-amber-500 hover:border-amber-300'
                                  }`}
                                  title={prod.isHotSelling || prod.isFeatured ? 'Hot Selling (Active) - Click to Remove' : 'Click to add to Mega Hot Selling'}
                                >
                                  <Flame className={`w-3.5 h-3.5 ${prod.isHotSelling || prod.isFeatured ? 'fill-white' : ''}`} />
                                  <span className="text-[10px] hidden xl:inline">Hot</span>
                                </button>

                                {/* 1-Click Flash Deal Toggle */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleFlashDeal(prod)}
                                  className={`p-1.5 rounded-md border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                    prod.isFlashDeal
                                      ? 'bg-purple-600 border-purple-700 text-white shadow-xs'
                                      : 'border-slate-200  text-slate-400 hover:text-purple-600 hover:border-purple-300'
                                  }`}
                                  title={prod.isFlashDeal ? 'Flash Deal (Active) - Click to Remove' : 'Click to add to Flash Deals'}
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                  <span className="text-[10px] hidden xl:inline">Flash</span>
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 rounded text-blue-600 hover:bg-blue-50 cursor-pointer"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'product', id: prod.id, name: prod.name })}
                                className="p-1.5 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                                title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES MANAGEMENT (Custom category images, drag & drop, add/edit/delete) */}
          {activeTab === 'categories' && (
            <AdminCategories
              categories={categories}
              products={products}
              lang={lang}
              onRefresh={refreshAll}
              onShowToast={showToast}
              onRequestDelete={(cat) => setDeleteTarget({ type: 'category', id: cat.id, name: cat.name })}
            />
          )}

          {/* TAB 4: STATE-WISE COURIER LOGISTICS & DISPATCH (Steadfast & Pathao) */}
          {activeTab === 'couriers' && (
            <AdminCouriers
              orders={orders}
              settings={settings}
              lang={lang}
              onRefresh={refreshAll}
              onShowToast={showToast}
              onSaveSettings={(newSettings) => {
                setSettings(newSettings);
                StorageService.saveSettings(newSettings);
                showToast(lang === 'bn' ? 'কুরিয়ার সেটিংস সফলভাবে সংরক্ষিত হয়েছে' : 'Courier settings saved successfully', 'success');
              }}
            />
          )}

          {/* TAB 5: SETTINGS & DATABASE / SUPABASE EXPORT */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <form onSubmit={handleSaveSettings} className="p-6 rounded-xl border border-slate-200 bg-white space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase">
                  {lang === 'bn' ? 'ডেলিভারি চার্জ ও স্টোর সেটিংস' : 'Delivery Charges & Store Information'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {strings.deliveryDhaka} (৳)
                    </label>
                    <input
                      type="number"
                      value={settings.deliveryChargeInsideDhaka}
                      onChange={(e) => setSettings({ ...settings, deliveryChargeInsideDhaka: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {strings.deliveryOutsideDhaka} (৳)
                    </label>
                    <input
                      type="number"
                      value={settings.deliveryChargeOutsideDhaka}
                      onChange={(e) => setSettings({ ...settings, deliveryChargeOutsideDhaka: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Store Physical Address
                  </label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                  />
                </div>

                {/* PAYMENT METHODS CONFIGURATION (bKash, Nagad, COD) */}
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {lang === 'bn' ? 'পেমেন্ট গেটওয়ে ও অ্যাকাউন্ট সেটিংস' : 'Payment Methods Configuration'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {lang === 'bn' ? 'বিকাশ, নগদ এবং ক্যাশ অন ডেলিভারি নম্বর ও শর্তাবলী কনফিগার করুন' : 'Manage account numbers and instructions for bKash, Nagad & COD'}
                    </p>
                  </div>

                  {/* Cash on Delivery Toggle */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash on Delivery (COD)'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {lang === 'bn' ? 'চেকআউট পেজে ক্যাশ অন ডেলিভারি অপশন সক্রিয় রাখুন' : 'Enable pay on delivery at checkout'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.paymentSettings?.cod?.enabled ?? true}
                      onChange={(e) => setSettings({
                        ...settings,
                        paymentSettings: {
                          ...settings.paymentSettings,
                          cod: {
                            ...(settings.paymentSettings?.cod || { title: 'Cash on Delivery', titleBn: 'ক্যাশ অন ডেলিভারি' }),
                            enabled: e.target.checked
                          },
                          bkash: settings.paymentSettings?.bkash || { enabled: true, title: 'bKash', titleBn: 'বিকাশ', accountNumber: '', accountType: 'Merchant' },
                          nagad: settings.paymentSettings?.nagad || { enabled: true, title: 'Nagad', titleBn: 'নগদ', accountNumber: '', accountType: 'Merchant' }
                        }
                      })}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* bKash Settings Box */}
                  <div className="p-4 rounded-xl border border-pink-200 bg-pink-50/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#E2136E]" />
                        <span className="text-xs font-bold text-slate-900">
                          bKash (বিকাশ) Settings
                        </span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-[11px] font-semibold text-slate-600">
                          {settings.paymentSettings?.bkash?.enabled ?? true ? (lang === 'bn' ? 'চালু' : 'Active') : (lang === 'bn' ? 'বন্ধ' : 'Disabled')}
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.paymentSettings?.bkash?.enabled ?? true}
                          onChange={(e) => setSettings({
                            ...settings,
                            paymentSettings: {
                              ...settings.paymentSettings,
                              cod: settings.paymentSettings?.cod || { enabled: true, title: 'Cash on Delivery', titleBn: 'ক্যাশ অন ডেলিভারি' },
                              bkash: {
                                ...(settings.paymentSettings?.bkash || { title: 'bKash', titleBn: 'বিকাশ' }),
                                enabled: e.target.checked,
                                accountNumber: settings.paymentSettings?.bkash?.accountNumber || '',
                                accountType: settings.paymentSettings?.bkash?.accountType || 'Merchant'
                              },
                              nagad: settings.paymentSettings?.nagad || { enabled: true, title: 'Nagad', titleBn: 'নগদ', accountNumber: '', accountType: 'Merchant' }
                            }
                          })}
                          className="w-4 h-4 rounded text-[#E2136E] accent-[#E2136E] cursor-pointer"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          bKash Account Number
                        </label>
                        <input
                          type="text"
                          value={settings.paymentSettings?.bkash?.accountNumber ?? ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            paymentSettings: {
                              ...settings.paymentSettings,
                              cod: settings.paymentSettings?.cod || { enabled: true, title: 'Cash on Delivery', titleBn: 'ক্যাশ অন ডেলিভারি' },
                              bkash: {
                                ...(settings.paymentSettings?.bkash || { enabled: true, title: 'bKash', titleBn: 'বিকাশ' }),
                                accountNumber: e.target.value
                              },
                              nagad: settings.paymentSettings?.nagad || { enabled: true, title: 'Nagad', titleBn: 'নগদ', accountNumber: '', accountType: 'Merchant' }
                            }
                          })}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Account Type
                        </label>
                        <select
                          value={settings.paymentSettings?.bkash?.accountType ?? 'Merchant'}
                          onChange={(e) => setSettings({
                            ...settings,
                            paymentSettings: {
                              ...settings.paymentSettings,
                              cod: settings.paymentSettings?.cod || { enabled: true, title: 'Cash on Delivery', titleBn: 'ক্যাশ অন ডেলিভারি' },
                              bkash: {
                                ...(settings.paymentSettings?.bkash || { enabled: true, title: 'bKash', titleBn: 'বিকাশ', accountNumber: '' }),
                                accountType: e.target.value as 'Merchant' | 'Personal'
                              },
                              nagad: settings.paymentSettings?.nagad || { enabled: true, title: 'Nagad', titleBn: 'নগদ', accountNumber: '', accountType: 'Merchant' }
                            }
                          })}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                        >
                          <option value="Merchant">Merchant Payment (মার্চেন্ট)</option>
                          <option value="Personal">Personal Send Money (ব্যক্তিগত)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Nagad Settings Box */}
                  <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#F7941D]" />
                        <span className="text-xs font-bold text-slate-900">
                          Nagad (নগদ) Settings
                        </span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-[11px] font-semibold text-slate-600">
                          {settings.paymentSettings?.nagad?.enabled ?? true ? (lang === 'bn' ? 'চালু' : 'Active') : (lang === 'bn' ? 'বন্ধ' : 'Disabled')}
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.paymentSettings?.nagad?.enabled ?? true}
                          onChange={(e) => setSettings({
                            ...settings,
                            paymentSettings: {
                              ...settings.paymentSettings,
                              cod: settings.paymentSettings?.cod || { enabled: true, title: 'Cash on Delivery', titleBn: 'ক্যাশ অন ডেলিভারি' },
                              bkash: settings.paymentSettings?.bkash || { enabled: true, title: 'bKash', titleBn: 'বিকাশ', accountNumber: '', accountType: 'Merchant' },
                              nagad: {
                                ...(settings.paymentSettings?.nagad || { title: 'Nagad', titleBn: 'নগদ' }),
                                enabled: e.target.checked,
                                accountNumber: settings.paymentSettings?.nagad?.accountNumber || '',
                                accountType: settings.paymentSettings?.nagad?.accountType || 'Merchant'
                              }
                            }
                          })}
                          className="w-4 h-4 rounded text-[#F7941D] accent-[#F7941D] cursor-pointer"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nagad Account Number
                        </label>
                        <input
                          type="text"
                          value={settings.paymentSettings?.nagad?.accountNumber ?? ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            paymentSettings: {
                              ...settings.paymentSettings,
                              cod: settings.paymentSettings?.cod || { enabled: true, title: 'Cash on Delivery', titleBn: 'ক্যাশ অন ডেলিভারি' },
                              bkash: settings.paymentSettings?.bkash || { enabled: true, title: 'bKash', titleBn: 'বিকাশ', accountNumber: '', accountType: 'Merchant' },
                              nagad: {
                                ...(settings.paymentSettings?.nagad || { enabled: true, title: 'Nagad', titleBn: 'নগদ' }),
                                accountNumber: e.target.value
                              }
                            }
                          })}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Account Type
                        </label>
                        <select
                          value={settings.paymentSettings?.nagad?.accountType ?? 'Merchant'}
                          onChange={(e) => setSettings({
                            ...settings,
                            paymentSettings: {
                              ...settings.paymentSettings,
                              cod: settings.paymentSettings?.cod || { enabled: true, title: 'Cash on Delivery', titleBn: 'ক্যাশ অন ডেলিভারি' },
                              bkash: settings.paymentSettings?.bkash || { enabled: true, title: 'bKash', titleBn: 'বিকাশ', accountNumber: '', accountType: 'Merchant' },
                              nagad: {
                                ...(settings.paymentSettings?.nagad || { enabled: true, title: 'Nagad', titleBn: 'নগদ', accountNumber: '' }),
                                accountType: e.target.value as 'Merchant' | 'Personal'
                              }
                            }
                          })}
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                        >
                          <option value="Merchant">Merchant Payment (মার্চেন্ট)</option>
                          <option value="Personal">Personal Send Money (ব্যক্তিগত)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#FF6B35] hover:bg-[#E85924] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {lang === 'bn' ? 'সেটিংস সেভ করুন' : 'Save Changes'}
                </button>
              </form>

              {/* Supabase Database SQL Schema Export */}
              <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Supabase Database Schema & SQL Migration
                    </h3>
                    <p className="text-xs text-slate-500">
                      Copy this SQL to create tables and Row Level Security (RLS) in your Supabase project.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(StorageService.getSupabaseSqlSchema());
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 :bg-slate-700 cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                </div>

                <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono max-h-48 overflow-y-auto">
                  {StorageService.getSupabaseSqlSchema()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: DISCOUNT COUPONS */}
          {activeTab === 'coupons' && (
            <AdminCoupons
              lang={lang}
              showToast={showToast}
            />
          )}

          {/* TAB: HERO BANNERS */}
          {activeTab === 'banners' && (
            <AdminBanners
              lang={lang}
              categories={categories}
              showToast={showToast}
              onBannersUpdated={() => {
                setBanners(StorageService.getBanners());
                refreshAll();
              }}
            />
          )}

          {/* TAB: PAYMENT METHODS CONFIGURATION */}
          {activeTab === 'payments' && (
            <AdminPayments
              lang={lang}
              onSettingsUpdated={() => {
                setSettings(StorageService.getSettings());
                refreshAll();
              }}
            />
          )}

          {/* TAB: DATABASE & HOSTING STORAGE ENGINE */}
          {activeTab === 'database' && (
            <AdminDatabase
              lang={lang}
              onRefreshAll={refreshAll}
              showToast={showToast}
            />
          )}

          {/* TAB: STAFF & MODERATOR MANAGEMENT */}
          {activeTab === 'staff' && (
            <AdminStaff
              lang={lang}
              currentUser={currentUser}
              onStaffUpdated={refreshAll}
            />
          )}

          {/* TAB: SECURITY & PASSWORD CHANGE */}
          {activeTab === 'security' && (
            <AdminSecuritySettings
              lang={lang}
              currentUser={currentUser}
              onPasswordChanged={() => {
                showToast(
                  lang === 'bn'
                    ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।'
                    : 'Password changed successfully! Please use it on your next login.',
                  'success'
                );
              }}
            />
          )}
        </div>
      </main>

      {/* Add / Edit Product Modal with DRAG & DROP Image Upload */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? strings.editProduct : strings.addProduct}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Product Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {strings.productName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Smart Wireless Headphones"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {strings.productNameBn}
                  </label>
                  <input
                    type="text"
                    value={formNameBn}
                    onChange={(e) => setFormNameBn(e.target.value)}
                    placeholder="যেমন: স্মার্ট ওয়্যারলেস হেডফোন"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Price, Compare Price, Stock, SKU */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {strings.productPrice} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {strings.comparePrice}
                  </label>
                  <input
                    type="number"
                    value={formComparePrice}
                    onChange={(e) => setFormComparePrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {strings.productStock} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {strings.productSku}
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.productCategory}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => {
                    const sel = categories.find(c => c.name === e.target.value);
                    setFormCategory(e.target.value);
                    if (sel) setFormCategoryBn(sel.nameBn);
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.nameBn})</option>
                  ))}
                </select>
              </div>

              {/* Promotions, Hot Selling & Badges */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase block tracking-wider">
                  {lang === 'bn' ? 'প্রোমোশন ও শোকেস সেটিংস' : 'Promotions & Showcase Settings'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-white border border-slate-200 hover:border-amber-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={formIsHotSelling}
                      onChange={(e) => setFormIsHotSelling(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        🔥 {lang === 'bn' ? 'মেগা হট সেলিং' : 'Mega Hot Selling'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {lang === 'bn' ? 'হোমপেজে স্পেশাল সেকশনে দেখাবে' : 'Highlight on homepage top section'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-white border border-slate-200 hover:border-purple-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={formIsFlashDeal}
                      onChange={(e) => setFormIsFlashDeal(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        ⚡ {lang === 'bn' ? 'ফ্ল্যাশ ডিল' : 'Flash Deal'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {lang === 'bn' ? 'স্পেশাল ডিসকাউন্ট ব্যাজ' : 'Special flash deal tag'}
                      </span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {lang === 'bn' ? 'কাস্টম ব্যাজ টেক্সট (ঐচ্ছিক)' : 'Custom Badge Text (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. HOT SELLER, BEST VALUE, সীমিত স্টক"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* DRAG AND DROP IMAGE UPLOADER */}
              <div className="pt-2 border-t border-slate-100">
                <ImageDropZone
                  images={formImages}
                  onChange={setFormImages}
                  lang={lang}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.productDescription}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Key details about the product..."
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  {strings.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#FF6B35] hover:bg-[#E85924] text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {strings.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal for selected order */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Invoice #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-slate-400">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
              <p><strong>Address:</strong> {selectedOrder.address}, {selectedOrder.thana ? `${selectedOrder.thana}, ` : ''}{selectedOrder.district}</p>
              <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Cash on Delivery'} (৳{selectedOrder.total})</p>
              {selectedOrder.senderNumber && (
                <p><strong>Sender Phone ({selectedOrder.paymentMethod}):</strong> <span className="font-mono font-bold text-slate-900">{selectedOrder.senderNumber}</span></p>
              )}
              {selectedOrder.transactionId && (
                <p><strong>Transaction ID (TrxID):</strong> <span className="font-mono font-bold text-[#E2136E] bg-pink-50 px-2 py-0.5 rounded border border-pink-200">{selectedOrder.transactionId}</span></p>
              )}
              {selectedOrder.couponCode && (
                <p><strong>Coupon:</strong> {selectedOrder.couponCode} (-৳{selectedOrder.discountAmount || 0})</p>
              )}
              <p><strong>Courier:</strong> {selectedOrder.courier} (Tracking: {selectedOrder.courierTrackingId || 'None'})</p>
            </div>

            <div className="border-t pt-3 space-y-1">
              <span className="text-xs font-bold block mb-1">Items:</span>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-600">
                  <span>{it.productName} × {it.quantity}</span>
                  <span className="font-bold">৳{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-[#0F172A] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Delete Confirmation Modal (Replaces native window.confirm) */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title={
          deleteTarget?.type === 'product'
            ? (lang === 'bn' ? 'পণ্য মুছে ফেলুন' : 'Delete Product')
            : (lang === 'bn' ? 'ক্যাটাগরি মুছে ফেলুন' : 'Delete Category')
        }
        itemName={deleteTarget?.name || ''}
        itemType={deleteTarget?.type || 'item'}
        lang={lang}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Floating Modern Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-100 max-w-md animate-slide-up">
          <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
            toast.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : toast.type === 'info'
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-emerald-600 text-white border-emerald-700'
          }`}>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              {toast.type === 'error' ? '⚠️' : '✓'}
            </div>
            <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
