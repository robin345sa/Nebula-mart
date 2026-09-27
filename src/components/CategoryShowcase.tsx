import React from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { Category, Language } from '../types';

interface CategoryShowcaseProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  lang: Language;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
  lang
}) => {
  if (!categories || !Array.isArray(categories) || categories.length === 0) return null;

  // Render categories marked as featured by admin (or all if isFeatured not set to false)
  const displayCategories = categories.filter(c => c && c.isFeatured !== false);
  if (!displayCategories || displayCategories.length === 0) return null;

  return (
    <section id="categories-showcase-section" className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 mb-3 sm:mb-6">
      {/* Pure White Container Box */}
      <div className="bg-white rounded-xl sm:rounded-2xl px-2.5 py-2.5 sm:p-4 border border-slate-200/85 shadow-2xs">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#F85606]" />
            <h3 className="text-sm min-[360px]:text-[15px] sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
              {lang === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories'}
            </h3>
          </div>
          <button
            onClick={() => onSelectCategory('All')}
            className="text-[11px] sm:text-xs font-bold text-[#F85606] hover:text-[#E04D05] flex items-center gap-1 cursor-pointer transition-colors py-0.5 px-1.5"
          >
            <span>{lang === 'bn' ? 'সব দেখুন' : 'View All'}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {/* Categories: Horizontally Scrollable on Mobile, Grid on Desktop */}
        <div className="flex md:grid md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 overflow-x-auto pb-1 pt-0.5 scrollbar-none no-scrollbar scroll-smooth">
          {displayCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const name = lang === 'bn' ? cat.nameBn || cat.name : cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`group shrink-0 min-w-[70px] min-[360px]:min-w-[76px] sm:min-w-[90px] md:min-w-0 flex flex-col items-center text-center p-1.5 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-[#F85606] bg-orange-50/60 shadow-2xs ring-1 ring-[#F85606]/30'
                    : 'border-slate-200/75 bg-white hover:border-slate-300 hover:bg-slate-50/60 active:bg-slate-100'
                }`}
              >
                <div className="w-11 h-11 min-[360px]:w-12 min-[360px]:h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-1 bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300'}
                    alt={name}
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                  />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 line-clamp-1 tracking-tight group-hover:text-[#F85606] transition-colors">
                  {name}
                </span>
                <span className="text-[9.5px] sm:text-[10px] text-slate-400 font-medium tracking-tight">
                  {cat.productCount > 0 ? `${cat.productCount} ${lang === 'bn' ? 'টি' : 'items'}` : (lang === 'bn' ? 'ব্রাউজ' : 'Explore')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
