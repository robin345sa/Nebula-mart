import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Sparkles, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { HeroBanner, Category, Language } from '../../types';
import { StorageService } from '../../lib/storage';
import { ImageDropZone } from './ImageDropZone';
import { processAndUploadImage } from '../../lib/imageUpload';

interface AdminBannersProps {
  lang: Language;
  categories?: Category[];
  onBannersUpdated: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminBanners: React.FC<AdminBannersProps> = ({
  lang,
  categories = [],
  onBannersUpdated,
  showToast = (_msg: string, _type?: 'success' | 'error' | 'info') => {}
}) => {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const [banners, setBanners] = useState<HeroBanner[]>(() => StorageService.getBanners());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [quickUploadingId, setQuickUploadingId] = useState<string | null>(null);
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const [quickTargetBanner, setQuickTargetBanner] = useState<HeroBanner | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subtitleBn, setSubtitleBn] = useState('');
  const [badge, setBadge] = useState('MEGA OFFERS');
  const [badgeBn, setBadgeBn] = useState('ধামাকা অফার');
  const [imageUrl, setImageUrl] = useState('');
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaTextBn, setCtaTextBn] = useState('এখনই কিনুন');
  const [linkType, setLinkType] = useState<'all' | 'category' | 'product' | 'custom'>('all');
  const [linkValue, setLinkValue] = useState('');
  const [bgColor, setBgColor] = useState('#112A7E');
  const [isActive, setIsActive] = useState(true);

  const refreshList = () => {
    const updated = StorageService.getBanners();
    setBanners(updated);
    onBannersUpdated();
  };

  const handleBannerImagesChange = (newImgs: string[]) => {
    const cleanList = Array.isArray(newImgs) ? newImgs.filter(Boolean) : [];
    if (cleanList.length > bannerImages.length) {
      // Promote newly uploaded photo(s) to primary cover index 0 automatically
      const newlyAdded = cleanList.slice(bannerImages.length);
      const existing = cleanList.slice(0, bannerImages.length);
      const prioritized = [...newlyAdded, ...existing];
      setBannerImages(prioritized);
      setImageUrl(prioritized[0] || '');
    } else {
      setBannerImages(cleanList);
      setImageUrl(cleanList[0] || '');
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setTitle('New Promotional Deal');
    setTitleBn('নতুন আকর্ষণীয় অফার');
    setSubtitle('Buy today and get genuine warranty with cash on delivery');
    setSubtitleBn('নিরাপদ ক্যাশ অন ডেলিভারি এবং আকর্ষণীয় ছাড়ের দারুণ সুযোগ');
    setBadge('FLASH PROMO');
    setBadgeBn('ফ্ল্যাশ অফার');
    setImageUrl('');
    setBannerImages([]);
    setCtaText('Shop Now');
    setCtaTextBn('এখনই কিনুন');
    setLinkType('all');
    setLinkValue('');
    setBgColor('#112A7E');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: HeroBanner) => {
    setEditingBanner(b);
    setTitle(b.title || '');
    setTitleBn(b.titleBn || '');
    setSubtitle(b.subtitle || '');
    setSubtitleBn(b.subtitleBn || '');
    setBadge(b.badge || '');
    setBadgeBn(b.badgeBn || '');
    const initialImg = b.imageUrl || '';
    setImageUrl(initialImg);
    setBannerImages(initialImg ? [initialImg] : []);
    setCtaText(b.ctaText || 'Shop Now');
    setCtaTextBn(b.ctaTextBn || 'এখনই কিনুন');
    setLinkType(b.linkType || 'all');
    setLinkValue(b.linkValue || '');
    setBgColor(b.bgColor || '#112A7E');
    setIsActive(b.isActive !== false);
    setIsModalOpen(true);
  };

  const handleQuickPhotoClick = (b: HeroBanner) => {
    setQuickTargetBanner(b);
    quickFileInputRef.current?.click();
  };

  const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = '';
    if (!file || !quickTargetBanner) return;

    setQuickUploadingId(quickTargetBanner.id);
    try {
      const uploadedUrl = await processAndUploadImage(file);
      if (uploadedUrl) {
        const updatedBanner: HeroBanner = {
          ...quickTargetBanner,
          imageUrl: uploadedUrl
        };
        StorageService.saveBanner(updatedBanner);
        refreshList();
        showToast(
          lang === 'bn'
            ? 'ব্যানারের ছবি সফলভাবে পরিবর্তন করা হয়েছে!'
            : 'Banner photo updated successfully!',
          'success'
        );
      }
    } catch (err) {
      console.error('Quick banner photo upload error:', err);
      showToast(
        lang === 'bn' ? 'ছবি আপলোড করতে সমস্যা হয়েছে' : 'Failed to upload banner photo',
        'error'
      );
    } finally {
      setQuickUploadingId(null);
      setQuickTargetBanner(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast(lang === 'bn' ? 'ব্যানারের শিরোনাম প্রয়োজন' : 'Banner title is required', 'error');
      return;
    }

    const finalImageUrl = (bannerImages[0] || imageUrl || '').trim();
    if (!finalImageUrl) {
      showToast(
        lang === 'bn'
          ? 'ব্যানারের ছবি কম্পিউটার/ফোন থেকে সিলেক্ট করুন অথবা লিঙ্ক দিন'
          : 'Please upload or select a banner image',
        'error'
      );
      return;
    }

    const bannerToSave: HeroBanner = {
      id: editingBanner ? editingBanner.id : `banner-${Date.now()}`,
      title: title.trim(),
      titleBn: titleBn.trim() || undefined,
      subtitle: subtitle.trim() || undefined,
      subtitleBn: subtitleBn.trim() || undefined,
      badge: badge.trim() || undefined,
      badgeBn: badgeBn.trim() || undefined,
      imageUrl: finalImageUrl,
      ctaText: ctaText.trim() || 'Shop Now',
      ctaTextBn: ctaTextBn.trim() || 'এখনই কিনুন',
      linkType,
      linkValue: linkValue.trim() || undefined,
      bgColor,
      textColor: 'light',
      isActive,
      order: editingBanner ? editingBanner.order : banners.length + 1,
      createdAt: editingBanner ? editingBanner.createdAt : new Date().toISOString()
    };

    StorageService.saveBanner(bannerToSave);
    setIsModalOpen(false);
    refreshList();
    showToast(
      lang === 'bn'
        ? (editingBanner ? 'ব্যানার সফলভাবে আপডেট করা হয়েছে' : 'নতুন ব্যানার সফলভাবে যুক্ত হয়েছে')
        : (editingBanner ? 'Banner updated successfully' : 'New banner added successfully'),
      'success'
    );
  };

  const handleDelete = (id: string) => {
    StorageService.deleteBanner(id);
    refreshList();
    showToast(lang === 'bn' ? 'ব্যানার মুছে ফেলা হয়েছে' : 'Banner deleted', 'info');
  };

  const handleToggle = (id: string) => {
    const newState = StorageService.toggleBannerStatus(id);
    refreshList();
    showToast(
      lang === 'bn'
        ? (newState ? 'ব্যানার সক্রিয় করা হয়েছে' : 'ব্যানার নিষ্ক্রিয় করা হয়েছে')
        : (newState ? 'Banner activated' : 'Banner deactivated'),
      'success'
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const reordered = [...banners];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    StorageService.reorderBanners(reordered);
    refreshList();
  };

  const previewImg = bannerImages[0] || imageUrl;

  return (
    <div className="space-y-6">
      {/* Hidden file input for 1-click direct banner photo replacement */}
      <input
        ref={quickFileInputRef}
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.webp,.svg,.avif,.jfif,.bmp"
        className="hidden"
        onChange={handleQuickPhotoUpload}
      />

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6B35]" />
            <span>{lang === 'bn' ? 'হোমপেজ হিরো ব্যানার স্লাইডার' : 'Homepage Hero Banners'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn'
              ? 'প্রোডাক্টের মতোই সরাসরি আপনার কম্পিউটার বা ফোন থেকে ব্যানারের ছবি আপলোড ও এডিট করুন।'
              : 'Upload and manage promotional hero banners directly from your computer or phone.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85924] text-white text-xs font-bold transition-all shadow-lg hover:shadow-orange-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন ব্যানার যোগ করুন' : 'Add New Banner'}</span>
        </button>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 gap-4">
        {banners.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold">{lang === 'bn' ? 'কোনো ব্যানার নেই' : 'No banners created yet'}</p>
            <p className="text-xs text-slate-500 mt-1">{lang === 'bn' ? 'হোমপেজে স্লাইডার দেখানোর জন্য ব্যানার যোগ করুন' : 'Add your first promotional hero banner'}</p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 cursor-pointer"
            >
              {lang === 'bn' ? 'প্রথম ব্যানার তৈরি করুন' : 'Create First Banner'}
            </button>
          </div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                banner.isActive
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/70 border-slate-900 opacity-60'
              }`}
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Order Indicator & Move buttons */}
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-slate-400">#{banner.order}</span>
                  <button
                    type="button"
                    disabled={index === banners.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Banner Thumbnail Preview (Click to quickly change photo) */}
                <div
                  onClick={() => handleQuickPhotoClick(banner)}
                  className="group relative w-28 sm:w-36 h-18 sm:h-20 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-slate-800 cursor-pointer"
                  title={lang === 'bn' ? 'ছবি পরিবর্তন করতে ক্লিক করুন' : 'Click to upload new banner photo'}
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-contain bg-white/95 p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  {banner.badge && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-sm bg-[#FF6B35] text-white text-[9px] font-bold">
                      {banner.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-1">
                    {quickUploadingId === banner.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'ছবি বদলান' : 'Change Photo'}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Title and Metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {lang === 'bn' && banner.titleBn ? banner.titleBn : banner.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        banner.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {banner.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {lang === 'bn' && banner.subtitleBn ? banner.subtitleBn : banner.subtitle || 'No subtitle'}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-mono">
                    <span>CTA: {banner.ctaText}</span>
                    <span>•</span>
                    <span>Target: {banner.linkType} {banner.linkValue ? `(${banner.linkValue})` : ''}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                <button
                  type="button"
                  onClick={() => handleQuickPhotoClick(banner)}
                  disabled={quickUploadingId === banner.id}
                  className="px-3 py-1.5 rounded-lg bg-[#112A7E] hover:bg-[#1E40AF] text-white text-xs font-bold border border-blue-700/50 flex items-center gap-1.5 cursor-pointer transition-colors"
                  title={lang === 'bn' ? 'সরাসরি নতুন ছবি আপলোড করুন' : 'Upload new banner photo directly'}
                >
                  {quickUploadingId === banner.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{lang === 'bn' ? 'ছবি আপলোড' : 'Upload Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggle(banner.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    banner.isActive
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                  }`}
                >
                  {banner.isActive ? (lang === 'bn' ? 'নিষ্ক্রিয় করুন' : 'Disable') : (lang === 'bn' ? 'সক্রিয় করুন' : 'Enable')}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(banner)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-bold"
                  title="Edit Banner"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer transition-colors"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Banner Modal (Matches Product Add/Edit Modal with full ImageDropZone) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                <span>
                  {editingBanner
                    ? (lang === 'bn' ? 'ব্যানার সম্পাদনা ও ছবি পরিবর্তন' : 'Edit Banner & Change Image')
                    : (lang === 'bn' ? 'নতুন ব্যানার তৈরি করুন' : 'Create New Banner')}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Banner Image Drag & Drop (Identical to Product Image Uploader) */}
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200">
                <ImageDropZone
                  images={bannerImages}
                  onChange={handleBannerImagesChange}
                  lang={lang}
                  singleMode={false}
                  label={lang === 'bn' ? 'ব্যানারের ছবি (প্রোডাক্টের মতো সরাসরি আপলোড করুন)' : 'Banner Image (Upload from PC/Phone or URL)'}
                  helperText={
                    lang === 'bn'
                      ? 'ব্যানারের ছবি ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা পিসি/ফোন থেকে সিলেক্ট করুন'
                      : 'Drag and drop banner photo from computer/phone or click to browse'
                  }
                />
              </div>

              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Anniversary Super Deals"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    placeholder="যেমন: অ্যানিভার্সারি সুপার ডিলস"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              {/* Subtitles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle (English)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Buy 3 Get Free Delivery"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={subtitleBn}
                    onChange={(e) => setSubtitleBn(e.target.value)}
                    placeholder="যেমন: ৩টি পণ্য কিনলে ফ্রি ডেলিভারি"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              {/* Badge & CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Badge / Tag (e.g. MEGA OFFERS)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. 50% OFF"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Shop Now"
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              {/* Action Link Type & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Target
                  </label>
                  <select
                    value={linkType}
                    onChange={(e: any) => setLinkType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                  >
                    <option value="all">All Products / Shop</option>
                    <option value="category">Category Filter</option>
                    <option value="custom">Custom Link / Query</option>
                  </select>
                </div>

                {linkType === 'category' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Target Category
                    </label>
                    <select
                      value={linkValue}
                      onChange={(e) => setLinkValue(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
                    >
                      <option value="">Select a category...</option>
                      {safeCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.nameBn})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Background Color Theme
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-slate-300 bg-white p-1 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 h-10 px-3 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-[#FF6B35] accent-[#FF6B35] cursor-pointer"
                />
                <label htmlFor="bannerIsActive" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  {lang === 'bn' ? 'হোমপেজ স্লাইডারে ব্যানারটি সক্রিয় থাকবে' : 'Enable and display banner on Homepage carousel'}
                </label>
              </div>

              {/* Live Preview Box */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  {lang === 'bn' ? 'হোমপেজ ব্যানার প্রিভিউ:' : 'Homepage Banner Live Preview:'}
                </span>
                <div className="relative rounded-xl overflow-hidden p-4 bg-[#FAF9F5] border border-slate-200 min-h-[120px] flex items-center justify-between gap-4 shadow-2xs">
                  <div className="relative z-10 flex-1 min-w-0">
                    {badge && (
                      <span className="inline-block px-2 py-0.5 rounded bg-[#112A7E] text-white text-[10px] font-bold mb-1">
                        {badge}
                      </span>
                    )}
                    <h4 className="text-sm sm:text-base font-black text-[#064E3B] truncate">
                      {lang === 'bn' ? titleBn || title || 'ব্যানার শিরোনাম' : title || 'Banner Title'}
                    </h4>
                    <p className="text-xs text-slate-600 truncate">
                      {lang === 'bn' ? subtitleBn || subtitle || 'ব্যানার সাবটাইটেল' : subtitle || 'Banner subtitle text'}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#F85606] text-white text-[10px] font-bold">
                      {lang === 'bn' ? ctaTextBn || ctaText || 'এখনই কিনুন' : ctaText || 'Shop Now'}
                    </span>
                  </div>
                  {previewImg && (
                    <div className="w-24 h-24 sm:w-28 sm:h-24 shrink-0 flex items-center justify-center">
                      <img
                        src={previewImg}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain drop-shadow-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit / Cancel buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#E85924] text-white text-xs font-bold cursor-pointer shadow-md"
                >
                  {editingBanner ? (lang === 'bn' ? 'ব্যানার আপডেট করুন' : 'Update Banner') : (lang === 'bn' ? 'ব্যানার সংরক্ষণ করুন' : 'Save Banner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
