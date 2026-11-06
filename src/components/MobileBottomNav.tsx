import React, { useState } from 'react';
import { Home, LayoutGrid, ShoppingBag, PackageCheck, User, Heart } from 'lucide-react';
import { Language, CustomerAccount } from '../types';

interface MobileBottomNavProps {
  lang: Language;
  cartCount: number;
  wishlistCount?: number;
  onNavigateHome: () => void;
  onOpenCategories: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenAccount: () => void;
  activeCustomer?: CustomerAccount | null;
  activeTab?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  lang,
  cartCount,
  wishlistCount = 0,
  onNavigateHome,
  onOpenCategories,
  onOpenWishlist,
  onOpenCart,
  onOpenOrders,
  onOpenAccount,
  activeCustomer = null,
  activeTab = 'home'
}) => {
  const [showWishlistFeedback, setShowWishlistFeedback] = useState(false);

  const handleWishlistClick = () => {
    // Provide instantaneous visual feedback
    setShowWishlistFeedback(true);
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(35);
      }
    } catch {
      // Ignore vibration error on unsupported platforms
    }
    onOpenWishlist();
    const timer = setTimeout(() => {
      setShowWishlistFeedback(false);
    }, 1800);
    return () => clearTimeout(timer);
  };

  const wishlistTooltipText = lang === 'bn'
    ? (wishlistCount > 0 ? `উইশলিস্ট (${wishlistCount}টি পণ্য সংরক্ষিত)` : 'উইশলিস্ট (পছন্দের তালিকা)')
    : (wishlistCount > 0 ? `Wishlist (${wishlistCount} saved item${wishlistCount === 1 ? '' : 's'})` : 'Wishlist (Saved items)');

  const wishlistAriaLabel = lang === 'bn'
    ? `উইশলিস্ট, ${wishlistCount}টি পণ্য সংরক্ষিত রয়েছে`
    : `Wishlist, ${wishlistCount} saved items`;

  return (
    <nav
      aria-label={lang === 'bn' ? 'মোবাইল নেভিগেশন' : 'Mobile Navigation'}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 md:hidden px-1 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-between max-w-lg mx-auto relative">
        {/* Home */}
        <button
          type="button"
          onClick={onNavigateHome}
          title={lang === 'bn' ? 'হোম পেজ' : 'Home'}
          aria-label={lang === 'bn' ? 'হোম পেজ' : 'Home'}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'home' ? 'text-[#112A7E] font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[9.5px] font-bold leading-none tracking-tight">
            {lang === 'bn' ? 'হোম' : 'Home'}
          </span>
        </button>

        {/* Categories */}
        <button
          type="button"
          onClick={onOpenCategories}
          title={lang === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}
          aria-label={lang === 'bn' ? 'সকল ক্যাটাগরি ব্রাউজ করুন' : 'Browse All Categories'}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'categories' ? 'text-[#112A7E] font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[9.5px] font-bold leading-none tracking-tight">
            {lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
          </span>
        </button>

        {/* Wishlist with text tooltip, aria-label & click feedback */}
        <div className="relative flex-1 min-w-0 flex flex-col items-center justify-center">
          {/* Animated click feedback pill */}
          {showWishlistFeedback && (
            <div
              role="status"
              aria-live="polite"
              className="absolute -top-11 left-1/2 -translate-x-1/2 z-50 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl pointer-events-none flex items-center gap-1.5 whitespace-nowrap animate-bounce"
            >
              <Heart className="w-3 h-3 fill-red-400 text-red-400" />
              <span>
                {lang === 'bn'
                  ? (wishlistCount > 0 ? `উইশলিস্টে ${wishlistCount}টি পণ্য` : 'উইশলিস্ট খোলা হয়েছে')
                  : (wishlistCount > 0 ? `Wishlist (${wishlistCount})` : 'Wishlist opened!')}
              </span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
            </div>
          )}

          <button
            type="button"
            onClick={handleWishlistClick}
            title={wishlistTooltipText}
            aria-label={wishlistAriaLabel}
            aria-expanded={activeTab === 'wishlist'}
            className={`w-full flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none active:scale-90 group ${
              activeTab === 'wishlist' ? 'text-red-500 font-black' : 'text-slate-600 hover:text-red-500'
            }`}
          >
            <div className="relative">
              <Heart
                className={`w-5 h-5 mb-0.5 transition-transform duration-200 group-hover:scale-110 ${
                  wishlistCount > 0 ? 'fill-red-500 text-red-500' : 'text-slate-700'
                } ${showWishlistFeedback ? 'scale-125 text-red-500 fill-red-500' : ''}`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-black bg-red-500 text-white rounded-full shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[9.5px] font-bold leading-none tracking-tight">
              {lang === 'bn' ? 'উইশলিস্ট' : 'Wishlist'}
            </span>
          </button>
        </div>

        {/* Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          title={lang === 'bn' ? `শপিং কার্ট (${cartCount}টি পণ্য)` : `Shopping Cart (${cartCount} items)`}
          aria-label={lang === 'bn' ? `শপিং কার্ট, ${cartCount}টি পণ্য রয়েছে` : `Shopping Cart, ${cartCount} items`}
          className={`relative flex-1 min-w-0 flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'cart' ? 'text-[#112A7E] font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-slate-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9px] font-black bg-[#112A7E] text-white rounded-full shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[9.5px] font-bold leading-none tracking-tight">
            {lang === 'bn' ? 'কার্ট' : 'Cart'}
          </span>
        </button>

        {/* Orders / Tracking */}
        <button
          type="button"
          onClick={onOpenOrders}
          title={lang === 'bn' ? 'অর্ডার ট্র্যাকিং ও হিস্ট্রি' : 'Track Orders & History'}
          aria-label={lang === 'bn' ? 'অর্ডার ট্র্যাকিং ও হিস্ট্রি' : 'Track Orders & History'}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'orders' ? 'text-[#112A7E] font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PackageCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[9.5px] font-bold leading-none tracking-tight">
            {lang === 'bn' ? 'অর্ডারস' : 'Orders'}
          </span>
        </button>

        {/* Account / Profile (matches selector 1 & 2) */}
        <button
          type="button"
          onClick={onOpenAccount}
          title={
            activeCustomer
              ? `${activeCustomer.name} (${activeCustomer.phone})`
              : (lang === 'bn' ? 'অ্যাকাউন্ট ও সাইন আপ' : 'Account & Profile')
          }
          aria-label={
            activeCustomer
              ? (lang === 'bn' ? `অ্যাকাউন্ট: ${activeCustomer.name}` : `Account: ${activeCustomer.name}`)
              : (lang === 'bn' ? 'অ্যাকাউন্ট খুলুন অথবা সাইন আপ করুন' : 'Account & Sign Up')
          }
          className={`relative flex-1 min-w-0 flex flex-col items-center justify-center min-h-[46px] py-1 px-0.5 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'account' ? 'text-[#112A7E] font-black' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5 mb-0.5 text-slate-700 hover:text-[#112A7E]" />
            {activeCustomer && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            )}
          </div>
          <span className="text-[9.5px] font-bold leading-none tracking-tight">
            {lang === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}
          </span>
        </button>
      </div>
    </nav>
  );
};
