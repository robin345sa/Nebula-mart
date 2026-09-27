import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Truck, Tag, ArrowRight } from 'lucide-react';
import { Language, HeroBanner } from '../types';
import { StorageService } from '../lib/storage';

interface HeroProps {
  lang: Language;
  onShopNow?: () => void;
  onExploreClick?: () => void;
  onSelectCategory?: (categoryName: string) => void;
  banners?: HeroBanner[];
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onShopNow,
  onExploreClick,
  onSelectCategory,
  banners: propBanners
}) => {
  const [banners, setBanners] = useState<HeroBanner[]>(() => {
    if (propBanners && Array.isArray(propBanners) && propBanners.length > 0) return propBanners;
    const active = StorageService.getActiveBanners();
    return (Array.isArray(active) && active.length > 0) ? active : (StorageService.getBanners() || []);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Sync when prop banners change or when banners are updated in Admin
  useEffect(() => {
    if (propBanners && Array.isArray(propBanners) && propBanners.length > 0) {
      setBanners(propBanners);
    } else {
      const active = StorageService.getActiveBanners();
      setBanners((Array.isArray(active) && active.length > 0) ? active : (StorageService.getBanners() || []));
    }
  }, [propBanners]);

  useEffect(() => {
    const handleBannersUpdated = () => {
      const active = StorageService.getActiveBanners();
      setBanners((Array.isArray(active) && active.length > 0) ? active : (StorageService.getBanners() || []));
    };
    window.addEventListener('nebula_banners_updated', handleBannersUpdated);
    window.addEventListener('storage', handleBannersUpdated);
    return () => {
      window.removeEventListener('nebula_banners_updated', handleBannersUpdated);
      window.removeEventListener('storage', handleBannersUpdated);
    };
  }, []);

  const safeBanners = Array.isArray(banners) ? banners : [];
  const activeBanners = safeBanners.filter(b => b && b.isActive !== false);

  // Fallback banner if none exists
  const effectiveBanners: HeroBanner[] = (activeBanners && activeBanners.length > 0) ? activeBanners : [
    {
      id: 'banner-default-himalaya',
      title: "HIMALAYA NATURE'S BEST SALE",
      titleBn: 'হিমালয়া নেচারস বেস্ট সেল অফার',
      subtitle: 'Shop Smart. Choose Nature.',
      subtitleBn: 'স্মার্ট শপিং করুন • সেরা মানের অরজিনাল প্রোডাক্টস',
      badge: 'dm NebulaMall | BRAND DAY',
      badgeBn: 'dm নেবুলামল | ব্র্যান্ড ডে',
      imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1600&auto=format&fit=crop&q=80',
      ctaText: 'Shop Now',
      ctaTextBn: 'এখনই কিনুন',
      linkType: 'all',
      bgColor: '#F5F5ED',
      textColor: 'dark',
      isActive: true,
      order: 1,
      createdAt: '2026-03-01'
    }
  ];

  // Auto-scroll carousel timer (4.5s)
  useEffect(() => {
    if (isPaused || effectiveBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % effectiveBanners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, effectiveBanners.length]);

  const goToPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + effectiveBanners.length) % effectiveBanners.length);
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % effectiveBanners.length);
  };

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      goToNext();
    } else if (diff < -50) {
      goToPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleBannerClick = (banner: HeroBanner) => {
    if (banner.linkType === 'category' && banner.linkValue && onSelectCategory) {
      onSelectCategory(banner.linkValue);
      const el = document.getElementById('products-grid-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else if (onShopNow) {
      onShopNow();
    } else if (onExploreClick) {
      onExploreClick();
    }
  };

  const currentBanner = (effectiveBanners && effectiveBanners.length > 0)
    ? (effectiveBanners[currentIndex % effectiveBanners.length] || effectiveBanners[0])
    : effectiveBanners[0];

  return (
    <section className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-2 pb-2 sm:pb-3 select-none">
      {/* Scrolling Carousel Wrapper */}
      <div
        className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs border border-slate-200/85 bg-[#FAF9F5] group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Carousel Slide Track */}
        <div className="relative w-full min-h-[155px] min-[360px]:min-h-[170px] sm:min-h-[240px] md:min-h-[290px] lg:min-h-[320px] flex items-center">
          {/* Natural Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4F4EB] via-[#FDFDF7] to-[#EFEFE6] pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-t from-stone-300/35 via-stone-200/15 to-transparent pointer-events-none" />

          {/* Slide Content Grid (Side-by-Side even on mobile for true mobile e-commerce UX) */}
          <div
            onClick={() => handleBannerClick(currentBanner)}
            className="relative z-10 w-full h-full flex flex-row items-center justify-between px-3 py-3 sm:p-6 md:p-8 lg:p-10 cursor-pointer gap-2 sm:gap-4"
          >
            {/* Left Content Column */}
            <div className="w-[60%] sm:w-3/5 space-y-1.5 sm:space-y-3.5">
              {/* Mall & Brand Day Badge */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded bg-[#0F172A] text-white text-[9.5px] sm:text-xs font-bold tracking-tight shadow-2xs">
                  <span className="font-extrabold text-[#F85606]">★</span>
                  <span>{lang === 'bn' ? 'নেবুলা মার্ট' : 'Nebula Mart'}</span>
                </span>
                <span className="text-[9px] sm:text-xs font-extrabold text-[#F85606] tracking-wider uppercase border-l-2 border-slate-300 pl-1.5 sm:pl-2">
                  {lang === 'bn' ? 'ব্র্যান্ড ডে' : 'BRAND DAY'}
                </span>
              </div>

              {/* Bold Headline */}
              <h1 className="text-[15px] min-[360px]:text-base sm:text-2xl md:text-3xl lg:text-[38px] font-black text-[#064E3B] tracking-[-0.03em] leading-[1.15] uppercase line-clamp-2">
                {lang === 'bn'
                  ? currentBanner.titleBn || currentBanner.title
                  : currentBanner.title}
              </h1>

              {/* Slogan Subtitle */}
              <p className="text-[10px] min-[360px]:text-[11px] sm:text-sm md:text-base font-medium text-slate-600 tracking-tight line-clamp-1 sm:line-clamp-2">
                {lang === 'bn'
                  ? currentBanner.subtitleBn || currentBanner.subtitle
                  : currentBanner.subtitle}
              </p>

              {/* Promotional Value Badges Row */}
              <div className="hidden min-[360px]:flex flex-wrap items-center gap-1.5 pt-0.5">
                <div className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded bg-[#005B52] text-white text-[8.5px] sm:text-xs font-bold">
                  <Truck className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                  <span className="uppercase">{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash On Delivery'}</span>
                </div>

                <div className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded bg-[#E01A4F] text-white text-[8.5px] sm:text-xs font-black uppercase tracking-tight">
                  <Tag className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-white text-[#E01A4F]" />
                  <span>VOUCHER MAX</span>
                </div>
              </div>

              {/* Shop Now CTA Button */}
              <div className="pt-1 sm:pt-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBannerClick(currentBanner);
                  }}
                  className="h-8 sm:h-10 px-3.5 sm:px-7 rounded-full bg-[#F85606] hover:bg-[#E04D05] active:scale-95 text-white text-[10px] sm:text-xs font-black uppercase tracking-tight shadow-xs hover:shadow-md transition-all inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>{lang === 'bn' ? currentBanner.ctaTextBn || 'এখনই কিনুন' : currentBanner.ctaText || 'Shop Now'}</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Showcase Column with Circular Discount Stamp & Product Image */}
            <div className="relative w-[40%] sm:w-2/5 flex items-center justify-center">
              <div className="absolute -top-1.5 left-0 sm:left-2 md:-left-2 z-20 w-11 h-11 min-[360px]:w-12 min-[360px]:h-12 sm:w-18 sm:h-18 rounded-full bg-[#F85606] text-white flex flex-col items-center justify-center shadow-md border-2 border-white">
                <span className="text-[6.5px] sm:text-[8.5px] font-black uppercase tracking-wider leading-none">UP TO</span>
                <span className="text-xs min-[360px]:text-sm sm:text-xl font-black tracking-tighter leading-none my-0.5">50%</span>
                <span className="text-[6px] sm:text-[8px] font-black uppercase tracking-wider leading-none">OFF</span>
              </div>

              <div className="relative w-28 min-[360px]:w-32 sm:w-56 md:w-68 h-28 min-[360px]:h-32 sm:h-44 md:h-52 flex items-center justify-center">
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title}
                  className="max-h-full max-w-full object-contain filter drop-shadow-lg hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Left Navigation Arrow Button */}
        {effectiveBanners.length > 1 && (
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous Slide"
            className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/20 hover:bg-black/45 text-white flex items-center justify-center backdrop-blur-2xs transition-all cursor-pointer shadow-md z-20 opacity-70 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Carousel Right Navigation Arrow Button */}
        {effectiveBanners.length > 1 && (
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next Slide"
            className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/20 hover:bg-black/45 text-white flex items-center justify-center backdrop-blur-2xs transition-all cursor-pointer shadow-md z-20 opacity-70 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Carousel Bottom Centered Pagination Dots */}
        {effectiveBanners.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 z-20 flex items-center justify-center gap-1.5">
            {effectiveBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 cursor-pointer ${
                  currentIndex % effectiveBanners.length === idx
                    ? 'w-6 sm:w-7 h-2 rounded-full bg-[#F85606] shadow-sm'
                    : 'w-2 h-2 rounded-full bg-slate-300/80 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
