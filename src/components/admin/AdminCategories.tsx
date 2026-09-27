import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, FolderTree, Check } from 'lucide-react';
import { Category, Product, Language } from '../../types';
import { t } from '../../lib/translations';
import { StorageService } from '../../lib/storage';
import { ImageDropZone } from './ImageDropZone';

interface AdminCategoriesProps {
  categories: Category[];
  products: Product[];
  lang: Language;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  onRequestDelete: (cat: Category) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  products,
  lang,
  onRefresh,
  onShowToast,
  onRequestDelete
}) => {
  const strings = t[lang];
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [slug, setSlug] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(true);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setNameBn('');
    setSlug('');
    setImages([]);
    setBannerImages([]);
    setIsFeatured(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setNameBn(cat.nameBn);
    setSlug(cat.slug);
    setImages(cat.image ? [cat.image] : []);
    setBannerImages(cat.bannerImage ? [cat.bannerImage] : []);
    setIsFeatured(cat.isFeatured ?? true);
    setIsModalOpen(true);
  };

  const handleToggleFeatured = (cat: Category) => {
    const updated: Category = {
      ...cat,
      isFeatured: !(cat.isFeatured ?? true)
    };
    StorageService.saveCategory(updated);
    onRefresh();
    onShowToast(
      updated.isFeatured
        ? (lang === 'bn' ? `"${cat.name}" হোমপেজে যোগ করা হয়েছে` : `"${cat.name}" featured on homepage`)
        : (lang === 'bn' ? `"${cat.name}" হোমপেজ থেকে বাদ দেওয়া হয়েছে` : `"${cat.name}" unfeatured from homepage`),
      'success'
    );
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existingCount = products.filter(
      p => p.category.toLowerCase() === name.toLowerCase() || p.category.toLowerCase() === (editingCategory?.name.toLowerCase() || '')
    ).length;

    const newCategory: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: name.trim(),
      nameBn: nameBn.trim() || name.trim(),
      slug: finalSlug,
      iconName: editingCategory ? editingCategory.iconName : 'Folder',
      productCount: editingCategory ? existingCount : 0,
      image: images.length > 0 ? images[0] : (editingCategory?.image || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500'),
      bannerImage: bannerImages.length > 0 ? bannerImages[0] : editingCategory?.bannerImage,
      isFeatured: isFeatured
    };

    StorageService.saveCategory(newCategory);
    onRefresh();
    setIsModalOpen(false);
    onShowToast(strings.categorySavedSuccess, 'success');
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.nameBn.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'ক্যাটাগরি অনুসন্ধান করুন...' : 'Search categories...'}
            className="w-full h-9 pl-8 pr-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 font-medium focus:outline-hidden focus:border-[#FF6B35]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto h-9 px-4 rounded-lg bg-[#FF6B35] hover:bg-[#E85924] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{strings.addCategory}</span>
        </button>
      </div>

      {/* Categories Grid Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-900 font-black uppercase text-[11px]">
              <tr>
                <th className="p-3.5">{lang === 'bn' ? 'ক্যাটাগরি ছবি' : 'Category Picture'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'ইংরেজি নাম' : 'Category Name (EN)'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'বাংলা নাম' : 'Category Name (BN)'}</th>
                <th className="p-3.5">Slug (URL)</th>
                <th className="p-3.5">{lang === 'bn' ? 'হোমপেজে শো' : 'Featured'}</th>
                <th className="p-3.5">{lang === 'bn' ? 'মোট প্রোডাক্ট' : 'Products'}</th>
                <th className="p-3.5 text-right">{lang === 'bn' ? 'একশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    {lang === 'bn' ? 'কোনো ক্যাটাগরি পাওয়া যায়নি।' : 'No categories found.'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const productCount = products.filter(
                    p => p.category.toLowerCase() === cat.name.toLowerCase() || p.categoryBn === cat.nameBn
                  ).length;
                  const isCatFeatured = cat.isFeatured ?? true;

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <FolderTree className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {cat.name}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        {cat.nameBn}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-500">
                        /{cat.slug}
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(cat)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            isCatFeatured
                              ? 'bg-emerald-100 text-emerald-800  border border-emerald-300'
                              : 'bg-slate-100 text-slate-500  border border-slate-300'
                          }`}
                        >
                          {isCatFeatured ? (lang === 'bn' ? '✓ শো হচ্ছে' : '✓ Featured') : (lang === 'bn' ? '✕ লুকানো' : '✕ Hidden')}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                          {productCount} {lang === 'bn' ? 'টি পণ্য' : 'products'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded text-blue-600 hover:bg-blue-50 hover:bg-slate-100 cursor-pointer transition-colors"
                          title={strings.editCategory}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRequestDelete(cat)}
                          className="p-1.5 rounded text-red-600 hover:bg-red-50 hover:bg-slate-100 cursor-pointer transition-colors"
                          title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingCategory ? strings.editCategory : strings.addCategory}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:text-slate-900 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  {strings.categoryName} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Smart Watches & Bands"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  {strings.categoryNameBn} *
                </label>
                <input
                  type="text"
                  required
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  placeholder="যেমন: স্মার্ট ওয়াচ ও ব্যান্ড"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Category URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. smart-watches"
                  className="w-full h-10 px-3.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                />
              </div>

              {/* Featured on Homepage toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {lang === 'bn' ? 'হোমপেজে শো করুন' : 'Show on Homepage Category Showcase'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'bn' ? 'গ্রাহকরা হোমপেজের ক্যাটাগরি সেকশনে এটি দেখতে পাবেন' : 'Display this category prominently on the main storefront'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF6B35] accent-[#FF6B35] cursor-pointer"
                />
              </div>

              {/* Drag and drop Category image from hard drive */}
              <div className="pt-2 border-t border-slate-100">
                <ImageDropZone
                  images={images}
                  onChange={setImages}
                  lang={lang}
                  singleMode={true}
                  label={lang === 'bn' ? 'ক্যাটাগরি ছবি (স্কয়ার / থাম্বনেইল)' : 'Category Thumbnail (Square)'}
                  helperText={
                    lang === 'bn'
                      ? 'কম্পিউটার থেকে ক্যাটাগরির ছবি ড্র্যাগ অ্যান্ড ড্রপ করুন (অটোমেটিক Base64/সার্ভার স্টোর হবে)'
                      : 'Drag & drop category picture from computer (automatically stored)'
                  }
                />
              </div>

              {/* Optional Category Banner */}
              <div className="pt-2 border-t border-slate-100">
                <ImageDropZone
                  images={bannerImages}
                  onChange={setBannerImages}
                  lang={lang}
                  singleMode={true}
                  label={lang === 'bn' ? 'ক্যাটাগরি ব্যানার ইমেজ (ঐচ্ছিক)' : 'Category Banner Image (Optional)'}
                  helperText={
                    lang === 'bn'
                      ? 'ব্যানার ইমেজ ড্র্যাগ অ্যান্ড ড্রপ করুন'
                      : 'Drag & drop banner image for promotions'
                  }
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  {strings.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#FF6B35] hover:bg-[#E85924] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  {editingCategory ? strings.saveChanges : strings.addCategory}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
