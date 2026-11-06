import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Check,
  Copy,
  Percent,
  DollarSign,
  Calendar,
  Layers,
  Search,
  Sparkles,
  AlertCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Coupon, Language } from '../../types';
import { StorageService } from '../../lib/storage';

interface AdminCouponsProps {
  lang: Language;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({ lang, showToast }) => {
  const [coupons, setCoupons] = useState<Coupon[]>(() => StorageService.getCoupons());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<string>('500');
  const [maxDiscount, setMaxDiscount] = useState<string>('500');
  const [usageLimit, setUsageLimit] = useState<string>('100');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [description, setDescription] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');

  const reloadCoupons = () => {
    setCoupons(StorageService.getCoupons());
  };

  useEffect(() => {
    const handleUpdate = () => reloadCoupons();
    window.addEventListener('nebula_coupons_updated', handleUpdate);
    return () => window.removeEventListener('nebula_coupons_updated', handleUpdate);
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinOrderAmount('500');
    setMaxDiscount('500');
    setUsageLimit('100');
    setExpiresAt('');
    setStatus('active');
    setDescription('');
    setDescriptionBn('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderAmount(c.minOrderAmount ? String(c.minOrderAmount) : '');
    setMaxDiscount(c.maxDiscount ? String(c.maxDiscount) : '');
    setUsageLimit(c.usageLimit ? String(c.usageLimit) : '');
    setExpiresAt(c.expiresAt ? c.expiresAt.split('T')[0] : '');
    setStatus(c.status);
    setDescription(c.description || '');
    setDescriptionBn(c.descriptionBn || '');
    setIsModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) {
      showToast(lang === 'bn' ? 'সঠিক কুপন কোড লিখুন' : 'Please enter a valid coupon code', 'error');
      return;
    }
    if (discountValue <= 0) {
      showToast(lang === 'bn' ? 'ডিসকাউন্টের পরিমাণ সঠিক দিন' : 'Discount value must be greater than zero', 'error');
      return;
    }

    const minAmount = minOrderAmount ? parseFloat(minOrderAmount) : undefined;
    const maxDisc = discountType === 'percentage' && maxDiscount ? parseFloat(maxDiscount) : undefined;
    const limit = usageLimit ? parseInt(usageLimit, 10) : undefined;

    const newCoupon: Coupon = {
      id: editingCoupon ? editingCoupon.id : `cpn-${Date.now()}`,
      code: cleanCode,
      discountType,
      discountValue,
      minOrderAmount: minAmount && !isNaN(minAmount) ? minAmount : undefined,
      maxDiscount: maxDisc && !isNaN(maxDisc) ? maxDisc : undefined,
      usageLimit: limit && !isNaN(limit) ? limit : undefined,
      timesUsed: editingCoupon ? editingCoupon.timesUsed : 0,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      status,
      description: description.trim() || undefined,
      descriptionBn: descriptionBn.trim() || undefined,
      createdAt: editingCoupon ? editingCoupon.createdAt : new Date().toISOString()
    };

    StorageService.saveCoupon(newCoupon);
    reloadCoupons();
    setIsModalOpen(false);
    showToast(
      lang === 'bn'
        ? `কুপন "${cleanCode}" সফলভাবে সংরক্ষণ হয়েছে!`
        : `Coupon "${cleanCode}" saved successfully!`,
      'success'
    );
  };

  const handleDeleteCoupon = (c: Coupon) => {
    if (window.confirm(lang === 'bn' ? `আপনি কি "${c.code}" কুপনটি ডিলিট করতে চান?` : `Delete coupon "${c.code}"?`)) {
      StorageService.deleteCoupon(c.id);
      reloadCoupons();
      showToast(lang === 'bn' ? 'কুপন মুছে ফেলা হয়েছে' : 'Coupon deleted', 'info');
    }
  };

  const handleToggleStatus = (c: Coupon) => {
    const isNowActive = StorageService.toggleCouponStatus(c.id);
    reloadCoupons();
    showToast(
      lang === 'bn'
        ? (isNowActive ? `কুপন "${c.code}" সক্রিয় করা হয়েছে` : `কুপন "${c.code}" নিষ্ক্রিয় করা হয়েছে`)
        : (isNowActive ? `Coupon "${c.code}" is now active` : `Coupon "${c.code}" is now inactive`),
      'success'
    );
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(text);
    showToast(lang === 'bn' ? `"${text}" কোড কপি করা হয়েছে!` : `Copied "${text}" to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredCoupons = coupons.filter(c => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.code.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.descriptionBn && c.descriptionBn.includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-500 via-[#FF6B35] to-amber-500 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-xs">
            <Tag className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'প্রমোশন ও ডিসকাউন্ট কন্ট্রোল' : 'Promotions & Discounts'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {lang === 'bn' ? 'কুপন কোড ম্যানেজমেন্ট' : 'Discount Coupon Codes'}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl">
            {lang === 'bn'
              ? 'শপিং কার্ট ও চেকআউট মোডালে শতকরা বা ফিক্সড টাকার ডিসকাউন্ট দিতে কুপন তৈরি ও নিয়ন্ত্রণ করুন।'
              : 'Create percentage or fixed cash discount codes for customers to apply in the checkout modal.'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white text-[#FF6B35] font-black text-xs sm:text-sm shadow-md hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{lang === 'bn' ? 'নতুন কুপন যোগ করুন' : 'Create New Coupon'}</span>
        </button>
      </div>

      {/* Controls: Search and Stats */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'কুপন কোড খুঁজুন...' : 'Search coupon codes...'}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
            {lang === 'bn' ? `মোট কুপন: ${coupons.length}` : `Total: ${coupons.length}`}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            {lang === 'bn'
              ? `সক্রিয়: ${coupons.filter(c => c.status === 'active').length}`
              : `Active: ${coupons.filter(c => c.status === 'active').length}`}
          </span>
        </div>
      </div>

      {/* Coupons Grid / Cards */}
      {filteredCoupons.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">
            {lang === 'bn' ? 'কোনো কুপন কোড পাওয়া যায়নি' : 'No discount coupons found'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' ? 'নতুন কুপন কোড তৈরি করতে ওপরের বাটনে ক্লিক করুন।' : 'Click the button above to create a coupon code.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((c) => {
            const isPercentage = c.discountType === 'percentage';
            const isActive = c.status === 'active';
            const isExpired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
            const isLimitReached = c.usageLimit && (c.timesUsed || 0) >= c.usageLimit;

            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden bg-white shadow-2xs flex flex-col justify-between ${
                  !isActive || isExpired || isLimitReached
                    ? 'border-slate-200 opacity-75'
                    : 'border-orange-200 hover:border-orange-400 hover:shadow-md'
                }`}
              >
                {/* Top Badge & Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${
                        isPercentage ? 'bg-orange-50 text-[#FF6B35] border border-orange-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isPercentage ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                        <span>{isPercentage ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}</span>
                      </span>

                      {isExpired && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">
                          {lang === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'Expired'}
                        </span>
                      )}
                      {isLimitReached && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                          {lang === 'bn' ? 'লিমিট শেষ' : 'Limit Reached'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(c)}
                      className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                        isActive ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                      title={isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                    >
                      {isActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6 text-slate-300" />}
                    </button>
                  </div>

                  {/* Code Card Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {lang === 'bn' ? 'কুপন কোড' : 'PROMO CODE'}
                      </span>
                      <span className="text-base sm:text-lg font-black tracking-wider text-slate-900 font-mono">
                        {c.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(c.code)}
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shadow-2xs"
                      title="Copy Code"
                    >
                      {copiedCode === c.code ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 font-medium mb-3 line-clamp-2">
                    {lang === 'bn' ? (c.descriptionBn || c.description || 'ডিসকাউন্ট কুপন') : (c.description || c.descriptionBn || 'Discount coupon')}
                  </p>

                  {/* Rules Pill List */}
                  <div className="space-y-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    {c.minOrderAmount ? (
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'সর্বনিম্ন অর্ডার:' : 'Min Order:'}</span>
                        <span className="font-bold text-slate-800">৳{c.minOrderAmount}</span>
                      </div>
                    ) : null}

                    {c.maxDiscount ? (
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'সর্বোচ্চ ছাড়:' : 'Max Discount:'}</span>
                        <span className="font-bold text-slate-800">৳{c.maxDiscount}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between">
                      <span>{lang === 'bn' ? 'ব্যবহার সংখ্যা:' : 'Times Used:'}</span>
                      <span className="font-bold text-slate-800">
                        {c.timesUsed || 0} {c.usageLimit ? `/ ${c.usageLimit}` : ''}
                      </span>
                    </div>

                    {c.expiresAt ? (
                      <div className="flex justify-between">
                        <span>{lang === 'bn' ? 'মেয়াদ শেষ:' : 'Expires:'}</span>
                        <span className="font-semibold text-slate-700">
                          {new Date(c.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(c)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(c)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'মুছুন' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FF6B35]" />
                <span>
                  {editingCoupon
                    ? (lang === 'bn' ? 'কুপন সম্পাদনা করুন' : 'Edit Coupon')
                    : (lang === 'bn' ? 'নতুন কুপন কোড তৈরি করুন' : 'Create New Coupon')}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'কুপন কোড (যেমন: NEBULA20)' : 'Coupon Code (e.g., NEBULA20)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DISCOUNT10"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-300 font-mono font-bold tracking-wider text-sm uppercase text-slate-900"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'ডিসকাউন্টের ধরন' : 'Discount Type'}
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900 font-semibold bg-white"
                  >
                    <option value="percentage">{lang === 'bn' ? 'শতকরা ছাড় (%)' : 'Percentage (%)'}</option>
                    <option value="fixed">{lang === 'bn' ? 'ফিক্সড টাকা (৳)' : 'Fixed Cash (৳)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {discountType === 'percentage'
                      ? (lang === 'bn' ? 'ছাড়ের শতকরা হার (%)' : 'Discount Percentage (%)')
                      : (lang === 'bn' ? 'ছাড়ের পরিমাণ (৳)' : 'Discount Amount (৳)')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === 'percentage' ? 100 : 50000}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'সর্বনিম্ন অর্ডার (৳)' : 'Minimum Order Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="e.g. 500 (Optional)"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900 font-medium"
                  />
                </div>

                {discountType === 'percentage' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {lang === 'bn' ? 'সর্বোচ্চ ছাড়ের সীমা (৳)' : 'Max Discount Cap (৳)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      placeholder="e.g. 500 (Optional)"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {lang === 'bn' ? 'ব্যবহারের সর্বোচ্চ সীমা' : 'Usage Limit'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Usage Limit & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {discountType === 'percentage' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {lang === 'bn' ? 'ব্যবহারের সর্বোচ্চ সীমা' : 'Usage Limit'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      placeholder="e.g. 100 (Optional)"
                      className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-slate-900 font-medium"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'মেয়াদ শেষের তারিখ' : 'Expiry Date'}
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900 font-medium bg-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {lang === 'bn' ? 'অবস্থা (Status)' : 'Status'}
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="coupon_status"
                      value="active"
                      checked={status === 'active'}
                      onChange={() => setStatus('active')}
                    />
                    <span>{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="radio"
                      name="coupon_status"
                      value="inactive"
                      checked={status === 'inactive'}
                      onChange={() => setStatus('inactive')}
                    />
                    <span>{lang === 'bn' ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive'}</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'বিবরণ (English)' : 'Description (English)'}
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. 10% off for new users"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {lang === 'bn' ? 'বিবরণ (বাংলা)' : 'Description (Bengali)'}
                  </label>
                  <input
                    type="text"
                    value={descriptionBn}
                    onChange={(e) => setDescriptionBn(e.target.value)}
                    placeholder="যেমন: নতুন কাস্টমারদের জন্য ১০% ছাড়"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#E85924] text-white font-black shadow-xs cursor-pointer"
                >
                  {editingCoupon
                    ? (lang === 'bn' ? 'আপডেট করুন' : 'Update Coupon')
                    : (lang === 'bn' ? 'কুপন তৈরি করুন' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
