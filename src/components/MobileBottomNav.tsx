import React from 'react';
import { Home, LayoutGrid, ShoppingBag, PackageCheck, User } from 'lucide-react';
import { Language } from '../types';

interface MobileBottomNavProps {
  lang: Language;
  cartCount: number;
  onNavigateHome: () => void;
  onOpenCategories: () => void;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  onOpenAccount: () => void;
  activeTab?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  lang,
  cartCount,
  onNavigateHome,
  onOpenCategories,
  onOpenCart,
  onOpenOrders,
  onOpenAccount,
  activeTab = 'home'
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 md:hidden px-1.5 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <button
          type="button"
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'home' ? 'text-[#F85606]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold leading-none tracking-tight">
            {lang === 'bn' ? 'হোম' : 'Home'}
          </span>
        </button>

        {/* Categories */}
        <button
          type="button"
          onClick={onOpenCategories}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'categories' ? 'text-[#F85606]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold leading-none tracking-tight">
            {lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
          </span>
        </button>

        {/* Cart */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[46px] py-1 px-1 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer select-none active:scale-95"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5 text-slate-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9px] font-black bg-[#E01A4F] text-white rounded-full shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold leading-none tracking-tight">
            {lang === 'bn' ? 'কার্ট' : 'Cart'}
          </span>
        </button>

        {/* Orders / Tracking */}
        <button
          type="button"
          onClick={onOpenOrders}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'orders' ? 'text-[#F85606]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PackageCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold leading-none tracking-tight">
            {lang === 'bn' ? 'অর্ডারস' : 'Orders'}
          </span>
        </button>

        {/* Account / Support */}
        <button
          type="button"
          onClick={onOpenAccount}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
            activeTab === 'account' ? 'text-[#F85606]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold leading-none tracking-tight">
            {lang === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}
          </span>
        </button>
      </div>
    </nav>
  );
};
