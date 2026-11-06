import React, { useState, useEffect } from 'react';
import { Product, Order, Language, Theme, StoreSettings, Category, CartItem, HeroBanner, CustomerAccount } from './types';
import { StorageService } from './lib/storage';
import { t } from './lib/translations';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HotSellingSection } from './components/HotSellingSection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AccountSupportModal } from './components/AccountSupportModal';
import { Footer } from './components/Footer';
import { Filter, SlidersHorizontal, Sparkles, AlertCircle, ShoppingBag, ShieldCheck, ArrowRight, Home, Zap, User, Heart } from 'lucide-react';

export default function App() {
  // Theme & Language (Enforcing clean white architecture)
  const [theme, setTheme] = useState<Theme>(() => {
    return 'light';
  });
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('nebula_lang') as Language) || 'bn';
  });

  // Store data
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [settings, setSettings] = useState<StoreSettings>(() => StorageService.getSettings());
  const [banners, setBanners] = useState<HeroBanner[]>(() => StorageService.getActiveBanners());
  const [cartItems, setCartItems] = useState<CartItem[]>(() => StorageService.getCart());
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => StorageService.getWishlist());

  // Search, Filter & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeChannel, setActiveChannel] = useState<string>('for-you');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'newest'>('featured');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [orderTrackingPhone, setOrderTrackingPhone] = useState<string>('');
  const [isAccountSupportOpen, setIsAccountSupportOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<CustomerAccount | null>(() => StorageService.getActiveCustomer());

  // Listen for customer authentication state changes across components
  useEffect(() => {
    const handleCustomerChange = (e: any) => {
      setActiveCustomer(e.detail ?? StorageService.getActiveCustomer());
    };
    window.addEventListener('nebula_customer_changed', handleCustomerChange);
    return () => {
      window.removeEventListener('nebula_customer_changed', handleCustomerChange);
    };
  }, []);

  // Check /admin (or #/admin or ?admin) route to securely open the Admin Panel without any frontend buttons
  useEffect(() => {
    const handleRouteCheck = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        path === '/admin' ||
        path.endsWith('/admin') ||
        path === '/admin/' ||
        hash === '#admin' ||
        hash === '#/admin' ||
        search.includes('admin') ||
        path === '/about' ||
        path.endsWith('/about') ||
        hash === '#about' ||
        hash === '#/about' ||
        search.includes('about')
      ) {
        setIsAdminOpen(true);
      }
    };

    handleRouteCheck();
    window.addEventListener('popstate', handleRouteCheck);
    window.addEventListener('hashchange', handleRouteCheck);

    // Secure admin shortcut for owner/admin: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleRouteCheck);
      window.removeEventListener('hashchange', handleRouteCheck);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Listen for storage update events and hydrate from Supabase cloud on mount
  useEffect(() => {
    const handleSyncEvent = () => {
      refreshStoreData();
    };

    const handleWishlistEvent = () => {
      setWishlistIds(StorageService.getWishlist());
    };

    const handleCartEvent = () => {
      setCartItems(StorageService.getCart());
    };

    window.addEventListener('nebula_order_updated', handleSyncEvent);
    window.addEventListener('nebula_banners_updated', handleSyncEvent);
    window.addEventListener('nebula_products_updated', handleSyncEvent);
    window.addEventListener('nebula_categories_updated', handleSyncEvent);
    window.addEventListener('nebula_settings_updated', handleSyncEvent);
    window.addEventListener('mart_wishlist_updated', handleWishlistEvent);
    window.addEventListener('mart_cart_updated', handleCartEvent);

    // Initialize real-time multi-device cloud synchronization via Firebase Firestore
    StorageService.initFirebaseSync();

    // Background cloud hydration if Supabase is also configured
    const dbCfg = StorageService.getDatabaseConfig();
    if (dbCfg.storageMode === 'supabase' && dbCfg.hostUrl && dbCfg.apiKey) {
      StorageService.fetchFromSupabaseAndHydrate()
        .then(() => refreshStoreData())
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('nebula_order_updated', handleSyncEvent);
      window.removeEventListener('nebula_banners_updated', handleSyncEvent);
      window.removeEventListener('nebula_products_updated', handleSyncEvent);
      window.removeEventListener('nebula_categories_updated', handleSyncEvent);
      window.removeEventListener('nebula_settings_updated', handleSyncEvent);
      window.removeEventListener('mart_wishlist_updated', handleWishlistEvent);
      window.removeEventListener('mart_cart_updated', handleCartEvent);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('admin') || path.includes('about')) {
      window.history.pushState(null, '', '/');
    } else if (hash.includes('admin') || hash.includes('about')) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  // Sync theme with DOM root class
  useEffect(() => {
    localStorage.setItem('nebula_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('nebula_lang', lang);
  }, [lang]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'bn' : 'en'));
  };

  const refreshStoreData = () => {
    setProducts(StorageService.getProducts());
    setCategories(StorageService.getCategories());
    setSettings(StorageService.getSettings());
    setBanners(StorageService.getActiveBanners());
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    const updated = StorageService.addToCart(product, quantity);
    setCartItems(updated);
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    const updated = StorageService.addToCart(product, quantity);
    setCartItems(updated);
    if (selectedProduct) setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    const updated = StorageService.updateCartQuantity(productId, quantity);
    setCartItems(updated);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updated = StorageService.removeFromCart(productId);
    setCartItems(updated);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    setCompletedOrder(order);
    refreshStoreData();
  };

  // Wishlist operations
  const handleToggleWishlist = (productId: string) => {
    StorageService.toggleWishlist(productId);
    setWishlistIds(StorageService.getWishlist());
  };

  const handleClearWishlist = () => {
    StorageService.clearWishlist();
    setWishlistIds([]);
  };

  const handleMoveAllWishlistToCart = () => {
    const list = StorageService.getWishlist();
    const validProds = list
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p && p.inStock && p.stock > 0));

    if (validProds.length > 0) {
      let updated = StorageService.getCart();
      for (const prod of validProds) {
        updated = StorageService.addToCart(prod, 1);
      }
      setCartItems(updated);
      setIsWishlistOpen(false);
      setIsCartOpen(true);
    }
  };

  // Filter and Sort Products
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
  const safeSearch = (searchQuery || '').toLowerCase();

  const filteredProducts = safeProducts.filter(product => {
    if (!product) return false;
    const nameMatch =
      (product.name || '').toLowerCase().includes(safeSearch) ||
      (product.nameBn || '').toLowerCase().includes(safeSearch) ||
      (product.category || '').toLowerCase().includes(safeSearch) ||
      (product.sku || '').toLowerCase().includes(safeSearch);

    const categoryMatch =
      !selectedCategory ||
      selectedCategory === 'All' ||
      (product.category || '').toLowerCase() === selectedCategory.toLowerCase() ||
      product.categoryBn === selectedCategory;

    let channelMatch = true;
    if (activeChannel === 'wishlist') {
      channelMatch = wishlistIds.includes(product.id);
    } else if (activeChannel === 'voucher-max') {
      channelMatch = (product.discountPercentage || 0) > 15 || !!product.isDiscount;
    } else if (activeChannel === 'daily-needs') {
      channelMatch = true;
    } else if (activeChannel === 'fast-delivery') {
      channelMatch = !!product.inStock && (product.stock || 0) > 0;
    } else if (activeChannel === 'mega-deals') {
      channelMatch = !!product.isFlashDeal || !!product.isHotSelling || (product.discountPercentage || 0) >= 20;
    }

    return nameMatch && categoryMatch && channelMatch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return 0; // featured default
  });

  const strings = t[lang] || t['bn'];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F6] text-slate-900 pb-16 md:pb-0">
      {/* Top Navigation */}
      <Navbar
        lang={lang}
        theme={theme}
        onLanguageChange={setLang}
        onToggleLang={toggleLanguage}
        onToggleTheme={toggleTheme}
        cartCount={safeCartItems.reduce((acc, i) => acc + (i?.quantity || 1), 0)}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAccount={() => setIsAccountSupportOpen(true)}
        activeCustomer={activeCustomer}
        onOpenAdmin={() => setIsAdminOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categories={categories}
        settings={settings}
        activeChannel={activeChannel}
        onSelectChannel={(ch) => {
          setActiveChannel(ch);
          if (ch === 'for-you') {
            setSelectedCategory('All');
          }
        }}
        onNavigateHome={() => {
          setSelectedCategory('All');
          setActiveChannel('for-you');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Hero Banner Section (Only shown when not actively searching) */}
      {!searchQuery && (
        <>
          <Hero
            lang={lang}
            banners={banners}
            onShopNow={() => {
              const el = document.getElementById('products-grid-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onSelectCategory={(catName) => {
              setSelectedCategory(catName);
              const el = document.getElementById('products-grid-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Dynamic Category Visual Showcase */}
          <CategoryShowcase
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catName) => {
              setSelectedCategory(catName);
              const el = document.getElementById('products-grid-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            lang={lang}
          />

          {/* High-Conversion Mega Hot Selling Section */}
          <HotSellingSection
            products={products}
            lang={lang}
            onSelect={(prod) => setSelectedProduct(prod)}
            onAddToCart={(prod) => handleAddToCart(prod, 1)}
            onBuyNow={(prod) => handleBuyNow(prod, 1)}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        </>
      )}

      {/* Main Catalog & Shopping Area */}
      <main id="products-grid-section" className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-6">
        {/* Category Filter Pills & Search Results Header */}
        <div className="space-y-2.5 sm:space-y-3.5 mb-3.5 sm:mb-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF6B35] shrink-0" />
                <h2 className="text-sm min-[360px]:text-base sm:text-xl lg:text-2xl font-black text-[#0F172A] tracking-tight leading-tight truncate">
                  {searchQuery
                    ? `${lang === 'bn' ? 'ফলাফল:' : 'Results:'} "${searchQuery}"`
                    : (strings.allProducts || strings.shop || (lang === 'bn' ? 'সকল প্রোডাক্ট' : 'All Products'))}
                </h2>
              </div>
              <p className="text-[10px] sm:text-xs text-[#64748B] font-normal leading-normal tracking-tight mt-0.5 truncate">
                {lang === 'bn'
                  ? `মোট ${filteredProducts?.length || 0} টি পণ্য পাওয়া গেছে`
                  : `Showing ${filteredProducts?.length || 0} products with Cash on Delivery`}
              </p>
            </div>

            {/* Compact Sort Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 tracking-tight hidden sm:flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {strings.sortBy || (lang === 'bn' ? 'সাজান' : 'Sort By')}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label={strings.sortBy || 'Sort By'}
                className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg border border-[#E5E7EB] bg-white text-[11px] sm:text-xs font-semibold tracking-tight text-[#111827] focus:outline-hidden focus:border-[#0EA5E9] shadow-2xs cursor-pointer"
              >
                <option value="featured" className="bg-white text-[#111827]">
                  {strings.featured || strings.sortFeatured || (lang === 'bn' ? 'জনপ্রিয় পণ্যসমূহ' : 'Featured Products')}
                </option>
                <option value="price-low" className="bg-white text-[#111827]">
                  {strings.priceLowHigh || strings.sortPriceLowHigh || (lang === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High')}
                </option>
                <option value="price-high" className="bg-white text-[#111827]">
                  {strings.priceHighLow || strings.sortPriceHighLow || (lang === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low')}
                </option>
                <option value="rating" className="bg-white text-[#111827]">
                  {strings.highestRated || strings.sortRating || (lang === 'bn' ? 'সর্বোচ্চ রেটিং' : 'Highest Rated')}
                </option>
                <option value="newest" className="bg-white text-[#111827]">
                  {strings.newestArrivals || strings.latestArrivals || (lang === 'bn' ? 'নতুন কালেকশন' : 'Newest Arrivals')}
                </option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills (Horizontally scrollable with sleek spacing) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 min-h-[30px] sm:min-h-[34px] rounded-full text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-[#F85606] text-white shadow-2xs border border-[#F85606]'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {strings.allProducts || strings.shop || (lang === 'bn' ? 'সকল প্রোডাক্ট' : 'All Products')}
            </button>

            {safeCategories.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1 min-h-[30px] sm:min-h-[34px] rounded-full text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F85606] text-white shadow-2xs border border-[#F85606]'
                      : 'bg-white text-slate-700 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {lang === 'bn' ? cat.nameBn : cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid (Sleek 2 columns on mobile with 8px gap, 3 on md, 4 on lg, 5 on xl) */}
        {(!products || products.length === 0) ? (
          <div className="py-10 sm:py-14 text-center bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-10 space-y-3.5 shadow-2xs max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto text-[#FF6B35]">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-xl font-black text-[#0F172A] tracking-tight leading-tight">
                {lang === 'bn' ? 'স্টোর সম্পূর্ণ প্রস্তুত' : 'Your Store is Ready'}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed">
                {lang === 'bn'
                  ? 'বর্তমানে কোনো পণ্য তালিকায় নেই। স্যাম্পল পণ্য লোড করতে পারেন।'
                  : 'No items currently in the catalog. You can load starter samples.'}
              </p>
            </div>
            <div className="flex items-center justify-center pt-1">
              <button
                onClick={() => {
                  StorageService.loadSampleCatalog();
                  refreshStoreData();
                }}
                className="h-10 px-5 rounded-xl bg-[#F85606] hover:bg-[#E04D05] text-white text-xs font-bold tracking-tight cursor-pointer transition-colors shadow-2xs"
              >
                {lang === 'bn' ? 'স্যাম্পল পণ্য লোড করুন' : 'Load Starter Samples'}
              </button>
            </div>
          </div>
        ) : (!filteredProducts || filteredProducts.length === 0) ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-8 space-y-3.5 shadow-2xs max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                {lang === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No Products Found'}
              </h3>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
                {lang === 'bn'
                  ? 'আপনার অনুসন্ধানের সাথে মেলে এমন কোনো পণ্য বর্তমানে তালিকায় নেই।'
                  : 'We could not find any products matching your selection.'}
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="h-10 px-5 rounded-xl bg-[#F85606] text-white text-xs font-bold cursor-pointer hover:bg-[#E04D05] transition-colors"
            >
              {lang === 'bn' ? 'সব পণ্য প্রদর্শন করুন' : 'Show All Products'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                onSelect={(prod) => setSelectedProduct(prod)}
                onAddToCart={(prod) => handleAddToCart(prod, 1)}
                onBuyNow={(prod) => handleBuyNow(prod, 1)}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          lang={lang}
          settings={settings}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        products={products}
        wishlistIds={wishlistIds}
        lang={lang}
        settings={settings}
        onToggleWishlist={handleToggleWishlist}
        onClearWishlist={handleClearWishlist}
        onAddToCart={(prod, qty) => handleAddToCart(prod, qty || 1)}
        onBuyNow={(prod, qty) => handleBuyNow(prod, qty || 1)}
        onMoveAllToCart={handleMoveAllWishlistToCart}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        lang={lang}
        settings={settings}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Guest Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cartItems}
          lang={lang}
          settings={settings}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Order Success & Invoice Receipt Modal */}
      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          lang={lang}
          settings={settings}
          onClose={() => setCompletedOrder(null)}
        />
      )}

      {/* Full Admin Dashboard Modal (with Drag & Drop Image Uploader & Courier Dispatch) */}
      {isAdminOpen && (
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={handleCloseAdmin}
          lang={lang}
          onProductsUpdated={refreshStoreData}
          onOrdersUpdated={refreshStoreData}
        />
      )}

      {/* Footer */}
      <Footer
        lang={lang}
        settings={settings}
        categories={categories}
        onSelectCategory={(catName) => {
          setSelectedCategory(catName);
          const el = document.getElementById('products-grid-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => {
          setIsOrderTrackingOpen(false);
          setOrderTrackingPhone('');
        }}
        lang={lang}
        settings={settings}
        initialPhone={orderTrackingPhone}
      />

      {/* Account & Registration Support Modal */}
      <AccountSupportModal
        isOpen={isAccountSupportOpen}
        onClose={() => setIsAccountSupportOpen(false)}
        lang={lang}
        settings={settings}
        onOpenOrders={(phone) => {
          if (phone) setOrderTrackingPhone(phone);
          setIsOrderTrackingOpen(true);
        }}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Mobile Fixed Bottom Navigation (Home / Categories / Wishlist / Cart / Orders / Account) */}
      <MobileBottomNav
        lang={lang}
        cartCount={safeCartItems.reduce((acc, i) => acc + (i?.quantity || 1), 0)}
        wishlistCount={wishlistIds.length}
        onNavigateHome={() => {
          setSelectedCategory('All');
          setActiveChannel('for-you');
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCategories={() => {
          const el = document.getElementById('categories-showcase-section') || document.getElementById('products-grid-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrderTrackingOpen(true)}
        onOpenAccount={() => setIsAccountSupportOpen(true)}
        activeCustomer={activeCustomer}
        activeTab={
          isAccountSupportOpen
            ? 'account'
            : isWishlistOpen
            ? 'wishlist'
            : isOrderTrackingOpen
            ? 'orders'
            : selectedCategory === 'All' && !searchQuery
            ? 'home'
            : 'categories'
        }
      />
    </div>
  );
}
