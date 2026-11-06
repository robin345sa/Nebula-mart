import React from 'react';
import { X, Trash2, Heart, ShoppingBag, Zap, ArrowRight, Sparkles, Check, ShoppingCart } from 'lucide-react';
import { Product, Language, StoreSettings } from '../types';
import { t } from '../lib/translations';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  wishlistIds: string[];
  lang: Language;
  settings: StoreSettings;
  onToggleWishlist: (productId: string) => void;
  onClearWishlist: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product, quantity?: number) => void;
  onMoveAllToCart: () => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  products,
  wishlistIds,
  lang,
  settings,
  onToggleWishlist,
  onClearWishlist,
  onAddToCart,
  onBuyNow,
  onMoveAllToCart,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  const strings = t[lang];
  const safeWishlistIds = Array.isArray(wishlistIds) ? wishlistIds : [];
  const wishlistedProducts = safeWishlistIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const totalWishlistCount = wishlistedProducts.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#131B2E] h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#131B2E]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center border border-red-100 dark:border-red-900/40">
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-none">
                <span>{lang === 'bn' ? 'উইশলিস্ট' : 'My Wishlist'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 font-bold">
                  {totalWishlistCount}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                {lang === 'bn' ? 'আপনার পছন্দের সংরক্ষিত পণ্যসমূহ' : 'Your saved favorite items'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {totalWishlistCount > 0 && (
              <button
                type="button"
                onClick={onClearWishlist}
                className="text-[11px] text-slate-400 hover:text-red-500 font-semibold px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title={lang === 'bn' ? 'উইশলিস্ট খালি করুন' : 'Clear all'}
              >
                {lang === 'bn' ? 'সব মুছুন' : 'Clear'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              aria-label="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3">
          {totalWishlistCount === 0 ? (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-400 border border-red-100 dark:border-red-900/30">
                <Heart className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {strings.wishlistEmptyTitle || (lang === 'bn' ? 'আপনার উইশলিস্ট খালি' : 'Your Wishlist is Empty')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {strings.wishlistEmptyDesc || (lang === 'bn'
                    ? 'যেকোনো পণ্যের ওপর হার্ট (❤️) আইকনে ক্লিক করে সহজেই উইশলিস্টে সংরক্ষণ করুন।'
                    : 'Tap the heart icon on any product to save it here for later.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const el = document.getElementById('products-grid-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#112A7E] hover:bg-[#0D2166] text-white text-xs font-bold tracking-tight transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {lang === 'bn' ? 'পণ্য ব্রাউজ করুন' : 'Explore Products'}
              </button>
            </div>
          ) : (
            wishlistedProducts.map((product) => {
              const title = lang === 'bn' ? product.nameBn || product.name : product.name;
              const hasDiscount = product.compareAtPrice > product.price;

              return (
                <div
                  key={product.id}
                  className="group relative flex gap-3 p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:shadow-xs transition-all"
                >
                  {/* Thumbnail (Click to open details) */}
                  <div
                    onClick={() => {
                      onClose();
                      onSelectProduct(product);
                    }}
                    className="w-20 h-20 sm:w-22 sm:h-22 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 shrink-0 border border-slate-100 dark:border-slate-800 relative cursor-pointer group-hover:opacity-95"
                  >
                    <img
                      src={(product.images && product.images[0]) || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discountPercentage > 0 && (
                      <span className="absolute top-1 left-1 px-1 py-0.5 rounded-xs bg-[#112A7E] text-white text-[9px] font-black leading-none">
                        -{product.discountPercentage}%
                      </span>
                    )}
                  </div>

                  {/* Product Details & Actions */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4
                          onClick={() => {
                            onClose();
                            onSelectProduct(product);
                          }}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug tracking-tight hover:text-[#112A7E] cursor-pointer"
                          title={title}
                        >
                          {title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onToggleWishlist(product.id)}
                          className="text-slate-400 hover:text-red-500 p-1 -mr-1 rounded-md transition-colors cursor-pointer shrink-0"
                          title={lang === 'bn' ? 'উইশলিস্ট থেকে মুছুন' : 'Remove from wishlist'}
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price Section */}
                      <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm sm:text-base font-black text-[#112A7E] dark:text-blue-400 tabular-nums">
                          ৳{product.price.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] text-slate-400 line-through tabular-nums">
                            ৳{product.compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Stock availability */}
                      <div className="mt-0.5">
                        {product.inStock && product.stock > 0 ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {lang === 'bn' ? 'স্টকে আছে' : 'In Stock'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {lang === 'bn' ? 'স্টক শেষ' : 'Out of Stock'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Direct Action Buttons */}
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onBuyNow(product, 1);
                          onClose();
                        }}
                        disabled={!product.inStock || product.stock <= 0}
                        className="flex-1 h-7 sm:h-8 px-2 rounded-lg bg-[#112A7E] hover:bg-[#0D2166] text-white text-[11px] font-bold tracking-tight disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                      >
                        <Zap className="w-3 h-3 fill-white shrink-0" />
                        <span className="truncate">{lang === 'bn' ? 'অর্ডার করুন' : 'Buy Now'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddToCart(product, 1)}
                        disabled={!product.inStock || product.stock <= 0}
                        className="h-7 sm:h-8 px-2.5 rounded-lg border border-[#112A7E]/30 bg-[#112A7E]/5 hover:bg-[#112A7E]/15 text-[#112A7E] text-[11px] font-bold tracking-tight disabled:opacity-40 flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                        title={strings.addToCart}
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span className="hidden sm:inline">{lang === 'bn' ? 'কার্টে' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer with Bulk Actions */}
        {totalWishlistCount > 0 && (
          <div className="p-4 border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 shrink-0 space-y-2">
            <button
              type="button"
              onClick={onMoveAllToCart}
              className="w-full h-11 rounded-xl bg-[#112A7E] hover:bg-[#0D2166] active:scale-98 text-white font-bold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{strings.moveAllToCart || (lang === 'bn' ? 'সবগুলো কার্টে যোগ করুন' : 'Move All to Cart')}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {lang === 'bn' ? 'শপিং চালিয়ে যান' : 'Continue Shopping'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
