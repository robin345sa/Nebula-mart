import React from 'react';
import { Star, ShoppingBag, Zap, Truck, Check } from 'lucide-react';
import { Product, Language } from '../types';
import { t } from '../lib/translations';

interface ProductCardProps {
  product: Product;
  lang: Language;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  onSelect,
  onAddToCart,
  onBuyNow
}) => {
  const strings = t[lang];
  const title = lang === 'bn' ? product.nameBn || product.name : product.name;
  
  // Calculate simulated coins/savings for Daraz style display
  const coinsSavings = Math.max(3, Math.round((product.price || 0) * 0.01));

  // Determine simulated sold count for realistic e-commerce presentation
  const soldCount = ((product.reviewCount || 0) * 7) + 12;
  const soldText = soldCount >= 1000 ? `${(soldCount / 1000).toFixed(1)}k` : `${soldCount}`;

  return (
    <div className="group relative flex flex-col w-full bg-white rounded-xl border border-slate-200/85 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden text-slate-900 justify-between">
      {/* Top Image Section (Square 1:1 Aspect Ratio) */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-square w-full bg-slate-50 overflow-hidden cursor-pointer"
      >
        <img
          src={(product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]) || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'}
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallback) {
              target.dataset.fallback = 'true';
              target.src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600';
            }
          }}
        />

        {/* Top-Left Discount Percentage Badge */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
            <span className="px-1.5 py-0.5 rounded bg-[#112A7E] text-white text-[9px] sm:text-[10px] font-extrabold tracking-tight shadow-2xs leading-none">
              -{product.discountPercentage}%
            </span>
          </div>
        )}

        {/* Top-Right Hot / Flash Badge */}
        {(product.isHotSelling || product.isFlashDeal) && (
          <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
            <span className="px-1.5 py-0.5 rounded bg-[#1E40AF] text-white text-[8px] sm:text-[9px] font-bold uppercase shadow-2xs leading-none">
              {product.isHotSelling ? 'HOT' : 'FLASH'}
            </span>
          </div>
        )}

        {/* Sleek Bottom-Left Free Delivery Tag */}
        <div className="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded-xs bg-[#112A7E]/90 text-white text-[8px] sm:text-[9px] font-bold tracking-tight flex items-center gap-0.5 shadow-2xs uppercase leading-none">
            <Truck className="w-2.5 h-2.5 shrink-0" />
            <span>{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'COD'}</span>
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="px-2 py-2 sm:p-3 flex flex-col flex-1 justify-between gap-1">
        <div>
          {/* Product Title with Sleek Mall Tag */}
          <h3
            onClick={() => onSelect(product)}
            className="text-[12px] min-[360px]:text-[12.5px] sm:text-[14px] font-semibold text-slate-800 line-clamp-2 leading-[1.35] tracking-tight hover:text-[#112A7E] cursor-pointer transition-colors min-h-[32px] sm:min-h-[38px]"
            title={title}
          >
            <span className="inline-block px-1 py-[1px] rounded-[3px] bg-[#112A7E]/10 text-[#112A7E] border border-[#112A7E]/20 text-[8.5px] sm:text-[9px] font-bold mr-1 align-baseline leading-none">
              Mall
            </span>
            {title}
          </h3>

          {/* Price Section */}
          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[14px] min-[360px]:text-[15px] sm:text-[18px] font-black text-[#112A7E] tabular-nums leading-none">
              ৳{product.price.toLocaleString()}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-[10px] sm:text-[11px] text-slate-400 line-through tabular-nums leading-none">
                ৳{product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Clean Unboxed Ratings & Sold Count */}
          <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500">
            <div className="flex items-center gap-0.5 text-amber-500 font-semibold shrink-0">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{(product.rating || 5).toFixed(1)}</span>
              <span className="text-slate-400 text-[9.5px] sm:text-[10px] tabular-nums">({product.reviewCount || 0})</span>
            </div>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <span className="text-slate-500 text-[9.5px] sm:text-[10.5px] truncate tabular-nums">
              {lang === 'bn' ? `${soldText} বিক্রি` : `${soldText} Sold`}
            </span>
          </div>
        </div>

        {/* Sleek Mobile-Friendly Action Buttons matching Nebula Mart Logo Color Grading (CSS selectors 3, 4, 5, 6) */}
        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => onBuyNow(product)}
            disabled={!product.inStock || product.stock <= 0}
            className="flex-1 h-8 min-[360px]:h-8.5 sm:h-9.5 px-1.5 sm:px-2.5 rounded-lg bg-[#112A7E] hover:bg-[#0D2166] active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-[11px] min-[360px]:text-[11.5px] sm:text-xs transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs whitespace-nowrap"
          >
            <Zap className="w-3 h-3 fill-white shrink-0" />
            <span className="truncate">{lang === 'bn' ? 'অর্ডার করুন' : 'Buy Now'}</span>
          </button>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock || product.stock <= 0}
            title={strings.addToCart}
            aria-label={strings.addToCart}
            className="h-8 w-8 min-[360px]:h-8.5 min-[360px]:w-8.5 sm:h-9.5 sm:w-9.5 rounded-lg border border-[#112A7E]/20 bg-[#112A7E]/5 hover:bg-[#112A7E]/12 hover:border-[#112A7E]/35 text-[#112A7E] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
