import React, { useState } from 'react';
import { ShoppingBag, Search, Camera, Globe, Menu, X, Phone, Flame, Zap, Truck, Tag, Gift, SlidersHorizontal, Sun, Moon, Heart, User } from 'lucide-react';
import { Language, Theme, StoreSettings, CustomerAccount } from '../types';
import { t } from '../lib/translations';
import { INITIAL_SETTINGS } from '../data/initialData';

interface NavbarProps {
  lang: Language;
  onLanguageChange?: (lang: Language) => void;
  onToggleLang?: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  onOpenAccount?: () => void;
  activeCustomer?: CustomerAccount | null;
  onOpenAdmin: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  categories?: { id: string; name: string; nameBn: string; slug: string }[];
  settings?: StoreSettings;
  onNavigateHome?: () => void;
  activeChannel?: string;
  onSelectChannel?: (channel: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  onToggleLang,
  theme,
  onToggleTheme,
  cartCount,
  onOpenCart,
  wishlistCount = 0,
  onOpenWishlist = () => {},
  onOpenAccount = () => {},
  activeCustomer = null,
  onOpenAdmin,
  searchQuery,
  onSearchChange,
  selectedCategory = 'All',
  onSelectCategory = (_cat: string) => {},
  categories = [],
  settings = INITIAL_SETTINGS,
  onNavigateHome = () => {},
  activeChannel = 'for-you',
  onSelectChannel = (_ch: string) => {}
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const strings = t[lang];
  const safeSettings = { ...INITIAL_SETTINGS, ...(settings || {}) };

  const handleLanguageToggle = () => {
    if (onLanguageChange) {
      onLanguageChange(lang === 'en' ? 'bn' : 'en');
    } else if (onToggleLang) {
      onToggleLang();
    }
  };

  const channels = [
    { id: 'for-you', labelEn: 'For You', labelBn: 'আপনার জন্য', icon: Flame, isHot: true },
    { id: 'voucher-max', labelEn: 'Voucher Max', labelBn: 'ভাউচার ম্যাক্স', tag: 'VOUCHER MAX', isTag: true },
    { id: 'daily-needs', labelEn: 'Daily Needs', labelBn: 'প্রয়োজনীয় পণ্য', icon: ShoppingBag },
    { id: 'fast-delivery', labelEn: 'Fast Delivery', labelBn: 'ফাস্ট ডেলিভারি', icon: Truck },
    { id: 'mega-deals', labelEn: 'Mega Deals', labelBn: 'মেগা অফার', icon: Zap },
    { id: 'free-shipping', labelEn: 'Free Delivery', labelBn: 'ফ্রি শিপিং', icon: Gift }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/90 shadow-2xs">
      {/* Main Bar with Prominent Logo & Responsive Search */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 pt-2 pb-1.5 sm:py-2.5">
        <div className="flex items-center gap-2 sm:gap-4 justify-between">
          {/* Brand Logo & Name */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0 min-w-0"
          >
            <div className="w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center bg-[#112A7E] shadow-xs group-hover:scale-105 transition-transform shrink-0 ring-1 ring-[#112A7E]/20">
              <img
                src="/logo/nebula-mart.svg?v=3"
                alt="Nebula Mart"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo/nebula-mart.svg';
                }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm min-[360px]:text-base sm:text-xl font-black tracking-tight text-[#112A7E] leading-none flex items-center truncate">
                Nebula <span className="text-[#1E40AF] ml-1">Mart</span>
              </span>
              <span className="text-[8.5px] min-[360px]:text-[9px] sm:text-[11px] text-slate-500 font-semibold tracking-tight mt-0.5 truncate">
                {lang === 'bn' ? 'নেবুলা মার্ট • ১০০% বিশ্বস্ত শপ' : 'Nebula Mart • 100% Trusted'}
              </span>
            </div>
          </div>

          {/* Desktop/Tablet Search Box */}
          <div className="hidden md:block flex-1 max-w-2xl relative min-w-0">
            <div className="relative flex items-center w-full h-[42px] rounded-xl border-2 border-[#112A7E] bg-white shadow-2xs overflow-hidden transition-all focus-within:border-[#1E40AF]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={lang === 'bn' ? 'পণ্য বা ক্যাটাগরি খুঁজুন...' : 'Search products or categories...'}
                className="w-full h-full pl-4 pr-24 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-[88px] text-slate-400 hover:text-slate-600 p-1.5 cursor-pointer"
                  aria-label="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="absolute right-1 flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('products-grid-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  aria-label="Search"
                  className="h-[34px] px-4 rounded-lg bg-[#112A7E] hover:bg-[#0D2166] active:scale-95 text-white text-xs font-bold tracking-tight transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'খুঁজুন' : 'Search'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Action Tools: Lang Switch, Cart, Mobile Menu (Wishlist & Account on sm+) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={handleLanguageToggle}
              className="flex items-center justify-center h-8 sm:h-10 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border border-slate-200/90 hover:border-[#112A7E]/30 bg-slate-50 active:bg-slate-100 text-[#112A7E] text-xs font-bold transition-colors cursor-pointer select-none"
              title="Toggle Language"
              aria-label="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#112A7E] mr-1" />
              <span className="text-[10px] min-[360px]:text-[11px] sm:text-xs">{lang === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Wishlist Button: hidden on small mobile (present in bottom nav), visible on sm+ */}
            <button
              onClick={onOpenWishlist}
              className="hidden sm:flex relative items-center justify-center gap-1.5 h-9 sm:h-10 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-red-50/80 hover:bg-red-100 active:scale-95 text-red-500 border border-red-200/80 transition-all cursor-pointer shadow-2xs shrink-0"
              title={strings.wishlist || (lang === 'bn' ? 'উইশলিস্ট' : 'Wishlist')}
              aria-label={strings.wishlist || 'Wishlist'}
            >
              <Heart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-xs font-bold text-red-600">
                {lang === 'bn' ? 'উইশলিস্ট' : 'Wishlist'}
              </span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black bg-red-500 text-white rounded-full shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Account / Sign In / Register Button: on sm+ */}
            <button
              onClick={onOpenAccount}
              className={`hidden sm:flex relative items-center justify-center gap-1.5 h-9 sm:h-10 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95 ${
                activeCustomer
                  ? 'bg-blue-50 hover:bg-blue-100 text-[#112A7E] border-[#112A7E]/30'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90'
              }`}
              title={
                activeCustomer
                  ? `${activeCustomer.name} (${activeCustomer.phone})`
                  : (lang === 'bn' ? 'অ্যাকাউন্ট ও সাইন আপ' : 'Account & Sign Up')
              }
              aria-label={activeCustomer ? 'Account Profile' : 'Account & Sign Up'}
            >
              <div className="relative">
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#112A7E]" />
                {activeCustomer && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                )}
              </div>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[85px]">
                {activeCustomer ? activeCustomer.name.split(' ')[0] : (lang === 'bn' ? 'অ্যাকাউন্ট' : 'Account')}
              </span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-[#112A7E]/8 hover:bg-[#112A7E]/15 active:scale-95 text-[#112A7E] border border-[#112A7E]/20 transition-all cursor-pointer shadow-2xs shrink-0"
              title={strings.cart}
              aria-label={strings.cart}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 text-[9px] sm:text-[10px] font-black bg-[#112A7E] text-white rounded-full shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-lg sm:rounded-xl border border-slate-200/90 lg:hidden text-slate-700 hover:bg-slate-50 active:bg-slate-100 cursor-pointer shrink-0"
              aria-label="Toggle Categories Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dedicated Mobile Search Bar Row */}
        <div className="mt-1.5 md:hidden">
          <div className="relative flex items-center w-full h-[38px] rounded-xl border-[1.5px] border-[#112A7E] bg-slate-50/60 focus-within:bg-white shadow-2xs overflow-hidden transition-all">
            <Search className="w-4 h-4 text-[#112A7E]/60 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={lang === 'bn' ? 'নেবুলা মার্টে পণ্য খুঁজুন...' : 'Search in Nebula Mart...'}
              className="w-full h-full pl-2 pr-20 text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-[64px] text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('products-grid-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="absolute right-1 h-[30px] px-3 rounded-lg bg-[#112A7E] active:bg-[#0D2166] text-white text-[11px] font-bold tracking-tight cursor-pointer flex items-center justify-center"
            >
              {lang === 'bn' ? 'খুঁজুন' : 'Search'}
            </button>
          </div>
        </div>

        {/* Channels Sub-Navigation Row */}
        <div className="flex items-center gap-3.5 sm:gap-6 mt-1.5 pt-1 border-t border-slate-100 overflow-x-auto scrollbar-none no-scrollbar scroll-smooth">
          {channels.map((ch) => {
            const Icon = ch.icon;
            const isActive = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => {
                  onSelectChannel(ch.id);
                  const el = document.getElementById('products-grid-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center gap-1 py-1 min-h-[28px] sm:min-h-[32px] whitespace-nowrap text-[11px] sm:text-xs font-bold transition-all cursor-pointer relative shrink-0 ${
                  isActive
                    ? 'text-[#112A7E] font-extrabold'
                    : 'text-slate-600 hover:text-[#112A7E]'
                }`}
              >
                {ch.isTag ? (
                  <span className="px-1.5 py-0.5 rounded-xs bg-[#112A7E] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider leading-none">
                    {ch.tag}
                  </span>
                ) : Icon ? (
                  <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isActive ? 'text-[#112A7E] fill-[#112A7E]' : 'text-slate-400'}`} />
                ) : null}

                <span>{lang === 'bn' ? ch.labelBn : ch.labelEn}</span>

                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#112A7E] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu for Categories */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              {strings.categories}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onSelectCategory('All');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  selectedCategory.toLowerCase() === 'all'
                    ? 'bg-[#112A7E] text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {strings.allCategories}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.name);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    selectedCategory === cat.name
                      ? 'bg-[#112A7E] text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {lang === 'bn' ? cat.nameBn : cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Account, Wishlist & Cart in Drawer */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAccount();
              }}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-blue-50/70 hover:bg-blue-100 text-[#112A7E] font-bold text-xs border border-[#112A7E]/20 active:scale-98 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#112A7E]" />
                <span>
                  {activeCustomer
                    ? `${activeCustomer.name} (${activeCustomer.phone})`
                    : (lang === 'bn' ? 'অ্যাকাউন্ট খুলুন / সাইন আপ' : 'Account / Sign Up')}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#112A7E] text-white">
                {activeCustomer ? (lang === 'bn' ? 'প্রোফাইল' : 'Profile') : (lang === 'bn' ? 'সাইন আপ' : 'Sign Up')}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWishlist();
                }}
                title={lang === 'bn' ? `পছন্দের তালিকা (${wishlistCount}টি পণ্য)` : `Wishlist (${wishlistCount} items)`}
                aria-label={lang === 'bn' ? `উইশলিস্ট দেখুন, ${wishlistCount}টি পণ্য সংরক্ষিত` : `View Wishlist, ${wishlistCount} items saved`}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-50 text-red-600 font-bold text-xs border border-red-200/70 active:scale-95 transition-all cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-red-500' : ''}`} />
                <span>{lang === 'bn' ? `উইশলিস্ট (${wishlistCount})` : `Wishlist (${wishlistCount})`}</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCart();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#112A7E]/10 text-[#112A7E] font-bold text-xs border border-[#112A7E]/20 active:scale-95 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{lang === 'bn' ? `কার্ট (${cartCount})` : `Cart (${cartCount})`}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Nebula Mart • {lang === 'bn' ? 'অনলাইন শপ' : 'Online E-Commerce'}</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{lang === 'bn' ? '১০০% ক্যাশ অন ডেলিভারি' : 'Cash On Delivery'}</span>
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
