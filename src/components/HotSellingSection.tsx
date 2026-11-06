import React from 'react';
import { Flame, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { Product, Language } from '../types';
import { ProductCard } from './ProductCard';

interface HotSellingSectionProps {
  products: Product[];
  lang: Language;
  onSelectProduct?: (product: Product) => void;
  onSelect?: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
}

export const HotSellingSection: React.FC<HotSellingSectionProps> = ({
  products,
  lang,
  onSelectProduct,
  onSelect,
  onAddToCart,
  onBuyNow,
  wishlistIds = [],
  onToggleWishlist
}) => {
  const handleSelect = onSelect || onSelectProduct || (() => {});
  const safeProducts = Array.isArray(products) ? products : [];

  // 1. Gather explicitly marked hot/featured/flash products
  const explicitHot = safeProducts.filter(p => p && (p.isHotSelling || p.isFlashDeal || p.isFeatured));

  // 2. Intelligent fallback: If fewer than 6 items, pull top-discounted and best-rated products
  let displayProducts: Product[] = [...explicitHot];
  if (displayProducts.length < 6 && safeProducts.length > displayProducts.length) {
    const existingIds = new Set(displayProducts.map(p => p.id));
    const supplemental = [...safeProducts]
      .filter(p => p && !existingIds.has(p.id))
      .sort((a, b) => {
        const discA = a.discountPercentage || 0;
        const discB = b.discountPercentage || 0;
        if (discB !== discA) return discB - discA;
        return (b.rating || 0) - (a.rating || 0);
      });

    for (const item of supplemental) {
      if (displayProducts.length >= 6) break;
      displayProducts.push(item);
    }
  }

  // Fallback if none found
  if (displayProducts.length === 0 && safeProducts.length > 0) {
    displayProducts = [...safeProducts].slice(0, 6);
  }

  if (displayProducts.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mb-3 sm:mb-6">
      {/* Pure White Container Box */}
      <div className="bg-white rounded-xl sm:rounded-2xl px-2.5 py-2.5 sm:p-4 border border-slate-200/85 shadow-2xs relative">
        {/* Compact Section Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3.5 relative z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="p-1 rounded-md bg-[#F85606] text-white shadow-2xs shrink-0">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              </span>
              <h2 className="text-sm min-[360px]:text-[15px] sm:text-lg font-black text-slate-900 tracking-tight leading-tight truncate flex items-center gap-1.5">
                <span>{lang === 'bn' ? 'মেগা হট সেলিং অফার' : 'Mega Hot Selling'}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 hidden sm:inline shrink-0" />
              </h2>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-normal truncate mt-0.5">
              {lang === 'bn'
                ? 'গ্রাহকদের পছন্দের শীর্ষে থাকা সেরা ডিলসমূহ'
                : 'Top customer favorites with special discounts'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-orange-50 text-[#F85606] border border-orange-200/70 flex items-center gap-1 whitespace-nowrap">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#F85606]" />
              <span>{displayProducts.length} {lang === 'bn' ? 'টি' : 'Deals'}</span>
            </span>

            {/* View All Deals Shortcut */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('products-grid-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[11px] sm:text-xs font-bold text-[#F85606] hover:text-[#E04D05] flex items-center gap-0.5 sm:gap-1 cursor-pointer transition-colors py-0.5 px-1 sm:px-1.5"
            >
              <span className="hidden min-[360px]:inline">{lang === 'bn' ? 'সব ডিল' : 'View All'}</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>

        {/* Responsive Product Grid: 2 columns on mobile, 3 on md, 4 on lg, 6 on xl */}
        <div
          className={`w-full ${
            displayProducts.length === 1
              ? 'grid grid-cols-1 max-w-xs sm:max-w-sm mx-auto'
              : 'grid grid-cols-2 gap-2 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
          }`}
        >
          {displayProducts.map((product) => (
            <div
              key={`hot-${product.id}`}
              className="w-full flex"
            >
              <ProductCard
                product={product}
                lang={lang}
                onSelect={handleSelect}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
