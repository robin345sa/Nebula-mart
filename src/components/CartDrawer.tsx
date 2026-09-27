import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { CartItem, Language, StoreSettings } from '../types';
import { t } from '../lib/translations';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  lang: Language;
  settings: StoreSettings;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  lang,
  settings,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const strings = t[lang];
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white dark:bg-[#131B2E] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#FF6B35]" />
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white tracking-[-0.025em]">
              {strings.cart} ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-[-0.02em]">
                  {strings.emptyCartTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs font-normal leading-relaxed">
                  {strings.emptyCartDesc}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold tracking-[-0.015em] transition-colors cursor-pointer"
              >
                {strings.continueShopping}
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => {
              const title = lang === 'bn' ? product.nameBn || product.name : product.name;
              return (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  {/* Thumbnail */}
                  <div className="w-18 h-18 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                    <img
                      src={product.images[0]}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 tracking-[-0.015em]">
                        {title}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm sm:text-base font-black text-[#0F172A] dark:text-white tracking-[-0.025em] tabular-nums">
                          ৳{(product.price * quantity).toLocaleString()}
                        </span>
                        {quantity > 1 && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            (৳{product.price} each)
                          </span>
                        )}
                      </div>

                      {/* Quantity control */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-slate-800 dark:text-white tabular-nums">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                          disabled={quantity >= product.stock}
                          className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-medium tracking-tight">{strings.subtotal}</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="font-medium tracking-tight">{strings.deliveryCharge}</span>
                <span className="font-normal text-slate-500">
                  {lang === 'bn' ? 'চেকআউটে নির্ধারিত হবে (৳৮০/৳১৩০)' : 'Calculated at checkout (৳80/৳130)'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-[-0.01em]">
                {strings.total}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#FF6B35] tracking-[-0.03em] tabular-nums">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>

            {/* Primary Action: PROCEED TO CHECKOUT */}
            <button
              onClick={onProceedToCheckout}
              className="w-full h-12 rounded-lg bg-[#FF6B35] hover:bg-[#E85924] text-white font-bold text-sm tracking-[-0.015em] flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <span>{strings.proceedToCheckout}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {lang === 'bn' ? '১০০% ক্যাশ অন ডেলিভারি সুবিধা' : 'Cash on Delivery • Safe & Verified'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
