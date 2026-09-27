import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { HeroBanner, Language } from '../types';

interface HeroBannerSliderProps {
  banners: HeroBanner[];
  lang: Language;
  onBannerAction: (banner: HeroBanner) => void;
}

export const HeroBannerSlider: React.FC<HeroBannerSliderProps> = ({
  banners,
  lang,
  onBannerAction
}) => {
  const activeBanners = banners.filter(b => b.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-advance every 5 seconds unless hovered/paused
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= activeBanners.length && activeBanners.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> next
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full bg-[#FAFAFA] dark:bg-slate-950 py-3 sm:py-5 border-b border-[#E5E7EB] dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg select-none group"
          style={{ backgroundColor: currentBanner.bgColor || '#0F172A' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Slide Presentation */}
          <div
            onClick={() => onBannerAction(currentBanner)}
            className="cursor-pointer relative min-h-[300px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[460px] flex items-center"
          >
            {/* Background Graphic & Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                className="w-full h-full object-cover opacity-25 sm:opacity-30 scale-105 transition-transform duration-1000 ease-out group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent sm:via-black/60" />
            </div>

            {/* Slide Content Grid */}
            <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 sm:p-8 md:p-12 lg:p-16 text-white">
              {/* Left Column: Headlines & Call-To-Action */}
              <div className="md:col-span-7 lg:col-span-7 space-y-3 sm:space-y-4 max-w-xl">
                {/* Badge (e.g. Daraj/Amazon style 'MEGA OFFERS' or 'ANNIVERSARY DEAL') */}
                {(currentBanner.badge || currentBanner.badgeBn) && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/30 backdrop-blur-md text-[#FF8A50] text-[11px] sm:text-xs font-black tracking-wider uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B35] animate-pulse" />
                    <span>
                      {lang === 'bn' && currentBanner.badgeBn
                        ? currentBanner.badgeBn
                        : currentBanner.badge}
                    </span>
                  </div>
                )}

                {/* Primary Title */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white drop-shadow-md">
                  {lang === 'bn' && currentBanner.titleBn
                    ? currentBanner.titleBn
                    : currentBanner.title}
                </h2>

                {/* Subtitle / Value Proposition */}
                {(currentBanner.subtitle || currentBanner.subtitleBn) && (
                  <p className="text-xs sm:text-sm md:text-base text-slate-200 line-clamp-2 sm:line-clamp-3 leading-relaxed font-normal">
                    {lang === 'bn' && currentBanner.subtitleBn
                      ? currentBanner.subtitleBn
                      : currentBanner.subtitle}
                  </p>
                )}

                {/* Trust highlight chips */}
                <div className="hidden sm:flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white font-medium border border-white/10">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {lang === 'bn' ? '১০০% ক্যাশ অন ডেলিভারি' : '100% Cash On Delivery'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white font-medium border border-white/10">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    {lang === 'bn' ? 'অরিজিনাল প্রোডাক্ট গ্যারান্টি' : 'Genuine Warranty'}
                  </span>
                </div>

                {/* CTA Action Button */}
                <div className="pt-2 sm:pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBannerAction(currentBanner);
                    }}
                    className="h-10 sm:h-12 px-6 sm:px-8 rounded-xl bg-[#FF6B35] hover:bg-[#E85924] text-white text-xs sm:text-sm font-bold tracking-tight inline-flex items-center gap-2 shadow-lg hover:shadow-orange-500/25 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <span>
                      {lang === 'bn' && currentBanner.ctaTextBn
                        ? currentBanner.ctaTextBn
                        : currentBanner.ctaText || (lang === 'bn' ? 'অফার দেখুন' : 'Shop Now')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Featured Product Imagery Spotlight */}
              <div className="hidden md:flex md:col-span-5 lg:col-span-5 justify-center items-center">
                <div className="relative w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/20 group-hover:scale-105 transition-transform duration-500 bg-slate-900/50">
                  <img
                    src={currentBanner.imageUrl}
                    alt={currentBanner.title}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="font-semibold">{lang === 'bn' ? 'অফিসিয়াল গ্যাজেটস' : 'Authentic Collection'}</span>
                    <span className="text-[#FF8A50] font-bold">{lang === 'bn' ? 'দারুণ ছাড়' : 'Special Deals'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prev / Next Navigation Arrows (visible on hover or on larger screens) */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-md hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Slide"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 z-20 cursor-pointer shadow-md hover:scale-110 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Dots Pagination Indicator (Daraj / Shopingo style) */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all rounded-full cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 sm:w-7 h-2 bg-[#FF6B35]'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/90'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
