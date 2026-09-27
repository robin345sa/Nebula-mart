import React, { useRef } from 'react';
import { Flame, Sparkles, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { Product, Language } from '../types';
import { ProductCard } from './ProductCard';

interface HotSellingSectionProps {
  products: Product[];
  lang: Language;
  onSelectProduct?: (product: Product) => void;
  onSelect?: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const HotSellingSection: React.FC<HotSellingSectionProps> = ({
  products,
  lang,
  onSelectProduct,
  onSelect,
  onAddToCart,
  onBuyNow
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleSelect = onSelect || onSelectProduct || (() => {});

  const safeProducts = Array.isArray(products) ? products : [];

  // Filter products marked as Hot Selling, Flash Deal, or Featured by admin
  const hotProducts = safeProducts.filter(p => p && (p.isHotSelling || p.isFlashDeal || p.isFeatured));

  // If no products explicitly marked, take top products
  const displayProducts = hotProducts.length > 0
    ? hotProducts
    : [...safeProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);

  if (!displayProducts || displayProducts.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mb-3 sm:mb-6">
      {/* Pure White Container Box (CSS selector 3 target with refined mobile padding) */}
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

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-orange-50 text-[#F85606] border border-orange-200/70 flex items-center gap-1 whitespace-nowrap">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#F85606]" />
              <span>{displayProducts.length} {lang === 'bn' ? 'টি' : 'Deals'}</span>
            </span>

            {/* Scrolling Navigation Arrows */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:text-[#F85606] active:bg-orange-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Scroll Left"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:text-[#F85606] active:bg-orange-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Scroll Right"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Scrolling Product Rail */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-2 sm:gap-3 overflow-x-auto pb-1 pt-0.5 scroll-smooth snap-x snap-mandatory scrollbar-none no-scrollbar"
        >
          {displayProducts.map((product) => (
            <div
              key={`hot-${product.id}`}
              className="shrink-0 w-[148px] min-[360px]:w-[158px] sm:w-[195px] md:w-[215px] snap-start flex"
            >
              <div className="w-full flex">
                <ProductCard
                  product={product}
                  lang={lang}
                  onSelect={handleSelect}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
