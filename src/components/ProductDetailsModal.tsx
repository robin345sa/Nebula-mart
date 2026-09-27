import React, { useState, useEffect } from 'react';
import { X, Star, ShoppingCart, Zap, Truck, ShieldCheck, Check, Plus, Minus, Send, ThumbsUp } from 'lucide-react';
import { Product, Language, ProductReview, StoreSettings } from '../types';
import { t } from '../lib/translations';
import { StorageService } from '../lib/storage';

interface ProductDetailsModalProps {
  product: Product | null;
  lang: Language;
  settings: StoreSettings;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  lang,
  settings,
  onClose,
  onAddToCart,
  onBuyNow
}) => {
  const strings = t[lang];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [reviews, setReviews] = useState<ProductReview[]>(() => product ? StorageService.getReviews(product.id) : []);

  // Review submission state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (product) {
      setReviews(StorageService.getReviews(product.id));
      setSelectedImageIndex(0);
      setQuantity(1);
      setActiveTab('desc');
    }
  }, [product?.id]);

  if (!product) return null;

  const title = lang === 'bn' ? product.nameBn || product.name : product.name;
  const description = lang === 'bn' ? product.descriptionBn || product.description : product.description;
  const features = lang === 'bn' ? product.featuresBn || product.features : product.features;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) return;

    const newRev = {
      productId: product.id,
      userName: reviewerName.trim(),
      rating: reviewerRating,
      comment: reviewerComment.trim(),
      verified: true
    };
    StorageService.addReview(newRev);
    setReviews(StorageService.getReviews(product.id));
    setReviewerName('');
    setReviewerComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header with Close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
            {strings.productDetails} • SKU: {product.sku}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1">
          {/* Top Section: Gallery Left, Details Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gallery Area */}
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
                <img
                  src={(product.images && product.images[selectedImageIndex]) || (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800'}
                  alt={title}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.fallback) {
                      target.dataset.fallback = 'true';
                      target.src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800';
                    }
                  }}
                />
                {(product.discountPercentage || 0) > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#DC2626] text-white text-xs font-bold">
                    -{product.discountPercentage}%
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && Array.isArray(product.images) && product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-[#FF6B35] scale-105'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Conversion Panel */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    {lang === 'bn' ? product.categoryBn : product.category}
                  </span>
                  {product.brand && (
                    <span className="text-[#64748B] dark:text-slate-400 font-medium">
                      Brand: {product.brand}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white mt-2 leading-[1.15] tracking-[-0.03em]">
                  {title}
                </h2>

                {/* Rating Bar */}
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <div className="flex items-center text-[#F59E0B]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-[#F59E0B] text-[#F59E0B]'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    {(product.rating || 5).toFixed(1)}/5
                  </span>
                  <span className="text-[#64748B] dark:text-slate-400 font-medium tracking-tight">
                    ({reviews?.length || 0} {strings.reviews})
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#64748B] dark:text-slate-400 block font-medium tracking-tight">
                      {lang === 'bn' ? 'বর্তমান বিক্রয় মূল্য:' : 'Special Offer Price:'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-[34px] font-black text-[#0F172A] dark:text-white tracking-[-0.035em] tabular-nums leading-none">
                        ৳{product.price.toLocaleString()}
                      </span>
                      {product.compareAtPrice > product.price && (
                        <span className="text-base line-through text-[#64748B] dark:text-slate-400 font-medium tracking-tight">
                          ৳{product.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {product.discountPercentage > 0 && (
                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-950/60 text-[#DC2626] text-xs font-black tracking-[0.03em]">
                        {lang === 'bn' ? `সাশ্রয় ৳${(product.compareAtPrice - product.price).toLocaleString()}` : `Save ৳${(product.compareAtPrice - product.price).toLocaleString()}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Short Benefits Checklist */}
                {features && features.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.06em] block">
                      {strings.keyBenefits}
                    </span>
                    {features.slice(0, 3).map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium tracking-[-0.005em]">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchase Controls */}
              <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
                    {lang === 'bn' ? 'পরিমাণ:' : 'Quantity:'}
                  </span>
                  <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-black text-[#111827] dark:text-white tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onAddToCart(product, quantity)}
                    disabled={!product.inStock || product.stock <= 0}
                    className="h-12 rounded-lg border-2 border-[#0F172A] dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white font-bold text-sm tracking-[-0.015em] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <ShoppingCart className="w-4.5 h-4.5" />
                    <span>{strings.addToCart}</span>
                  </button>

                  <button
                    onClick={() => onBuyNow(product, quantity)}
                    disabled={!product.inStock || product.stock <= 0}
                    className="h-12 rounded-lg bg-[#FF6B35] hover:bg-[#E85924] text-white font-bold text-sm tracking-[-0.015em] flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Zap className="w-4.5 h-4.5 fill-white" />
                    <span>{strings.buyNow}</span>
                  </button>
                </div>

                {/* Delivery Information Box */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>{strings.deliveryDhaka}:</strong> ৳{settings.deliveryChargeInsideDhaka} ({strings.estimatedTimeDhaka})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>
                      <strong>{strings.deliveryOutsideDhaka}:</strong> ৳{settings.deliveryChargeOutsideDhaka} ({strings.estimatedTimeOutsideDhaka})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (হাতে পেয়ে টাকা দিন)' : '100% Cash on Delivery available'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Section: Tabs for Details, Specs, Reviews */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('desc')}
                className={`text-sm font-bold pb-2 transition-all cursor-pointer ${
                  activeTab === 'desc'
                    ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {strings.productDetails}
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-sm font-bold pb-2 transition-all cursor-pointer ${
                  activeTab === 'specs'
                    ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {strings.specifications}
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`text-sm font-bold pb-2 transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {strings.reviews} ({reviews?.length || 0})
              </button>
            </div>

            {/* Tab Content: Description */}
            {activeTab === 'desc' && (
              <div className="py-4 space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>{description}</p>
                {features && features.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                      {strings.keyBenefits}:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {features.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Specifications */}
            {activeTab === 'specs' && (
              <div className="py-4">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden divide-y divide-slate-200 dark:divide-slate-700 text-xs sm:text-sm">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="grid grid-cols-2 p-3 bg-white dark:bg-slate-800/40 odd:bg-slate-50 dark:odd:bg-slate-900/40">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">{key}</span>
                        <span className="text-slate-900 dark:text-white font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 py-4">
                    {lang === 'bn' ? 'কোনো অতিরিক্ত স্পেসিফিকেশন দেওয়া নেই।' : 'No additional specifications listed.'}
                  </p>
                )}
              </div>
            )}

            {/* Tab Content: Verified Reviews */}
            {activeTab === 'reviews' && (
              <div className="py-4 space-y-6">
                {/* Write Review Form */}
                <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {strings.writeReview}
                  </h4>
                  {reviewSubmitted && (
                    <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                      {lang === 'bn' ? 'ধন্যবাদ! আপনার রিভিউটি সফলভাবে গৃহীত হয়েছে।' : 'Thank you! Your verified review has been submitted.'}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder={strings.yourName}
                      className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-[#FF6B35]"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{strings.yourRating}:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewerRating(star)}
                            className="cursor-pointer"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= reviewerRating
                                  ? 'fill-[#F59E0B] text-[#F59E0B]'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={reviewerComment}
                    onChange={(e) => setReviewerComment(e.target.value)}
                    placeholder={strings.yourComment}
                    className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-[#FF6B35]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{strings.submitReview}</span>
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-3">
                  {(!reviews || reviews.length === 0) ? (
                    <p className="text-xs text-slate-500 py-4">{strings.noReviewsYet}</p>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {rev.userName}
                            </span>
                            {rev.verified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                <ThumbsUp className="w-2.5 h-2.5" />
                                {lang === 'bn' ? 'ভেরিফাইড ক্রেতা' : 'Verified Buyer'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center text-[#F59E0B]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? 'fill-[#F59E0B] text-[#F59E0B]'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
