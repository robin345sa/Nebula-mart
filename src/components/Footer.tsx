import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Lock, ArrowUp, CheckCircle, Clock } from 'lucide-react';
import { Language, StoreSettings, Category } from '../types';
import { t } from '../lib/translations';
import { INITIAL_SETTINGS } from '../data/initialData';

interface FooterProps {
  lang: Language;
  settings?: StoreSettings;
  categories?: Category[];
  onSelectCategory?: (cat: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  settings,
  categories = [],
  onSelectCategory = (_cat: string) => {},
  onOpenAdmin = () => {}
}) => {
  const strings = t[lang];
  const safeSettings = { ...INITIAL_SETTINGS, ...(settings || {}) };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B173D] text-slate-300 border-t border-[#112A7E]/50">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-7 sm:gap-8">
          {/* Brand Col */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              {/* Footer Logo Container (CSS selector 7) */}
              <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-md overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-white/20">
                <img
                  src="/logo/nebula-mart.svg?v=3"
                  alt="Nebula Mart"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo/nebula-mart.svg';
                  }}
                />
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-[-0.02em]">
                  Nebula <span className="text-[#93C5FD]">Mart</span>
                </span>
                <span className="block text-[10px] text-blue-200/80 uppercase tracking-[0.14em] font-bold">
                  {lang === 'bn' ? 'বিশ্বস্ত ই-কমার্স শপ' : 'Premium E-Commerce'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300/90 leading-[1.6] font-normal tracking-[-0.005em]">
              {lang === 'bn'
                ? 'নেবুলা মার্ট - বাংলাদেশের অন্যতম সেরা ও নির্ভরযোগ্য অনলাইন শপ। অরিজিনাল গ্যাজেট, লাইফস্টাইল ও ইলেকট্রনিক্স সামগ্রী এখন ক্যাশ অন ডেলিভারিতে।'
                : 'Nebula Mart - Bangladesh’s premier online shopping destination. Delivering authentic electronics, lifestyle and smart accessories nationwide with Cash on Delivery.'}
            </p>
          </div>

          {/* Categories Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.08em]">
              {strings.categories}
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.name)}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? cat.nameBn : cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.08em]">
              {lang === 'bn' ? 'গ্রাহক সেবা ও ডেলিভারি' : 'Customer Care & Delivery'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400 font-normal">
              <li>
                <span className="block">{strings.deliveryDhaka}: ৳{safeSettings.deliveryChargeInsideDhaka} ({strings.estimatedTimeDhaka})</span>
              </li>
              <li>
                <span className="block">{strings.deliveryOutsideDhaka}: ৳{safeSettings.deliveryChargeOutsideDhaka} ({strings.estimatedTimeOutsideDhaka})</span>
              </li>
              <li>
                <span>{lang === 'bn' ? 'কুরিয়ার পার্টনার: স্টেডফাস্ট ও পাঠাও' : 'Courier Partners: Steadfast & Pathao'}</span>
              </li>
              <li>
                <span className="text-emerald-400 font-medium">
                  {lang === 'bn' ? '১০০% ক্যাশ অন ডেলিভারি (অগ্রিম পেমেন্ট নেই)' : '100% Cash On Delivery Available'}
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-[0.08em]">
              {strings.contactUs}
            </h3>
            <div className="space-y-2.5 text-xs text-slate-400 font-normal">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                <span>{safeSettings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${safeSettings.phone}`} className="hover:text-white font-mono tabular-nums">
                  {safeSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${safeSettings.email}`} className="hover:text-white">
                  {safeSettings.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHTED AT THE VERY BOTTOM: ৭ দিন সহজ নিরাপত্তা ও সার্ভিস গ্যারান্টি (7 Days Easy Security Guarantee) */}
      <div className="border-t border-slate-800 bg-[#0B1120] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-md">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Left headline */}
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-white tracking-[-0.02em] flex items-center gap-2 justify-center sm:justify-start">
                    <span>{lang === 'bn' ? '৭ দিন সহজ নিরাপত্তা ও ওয়ারেন্টি সুবিধা' : '7 Days Easy Security & Warranty'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                      {lang === 'bn' ? '১০০% নিশ্চিত' : 'Verified'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {lang === 'bn'
                      ? 'পণ্য পাওয়ার পর কোনো সমস্যা থাকলে ৭ দিনের মধ্যে সহজ এক্সচেঞ্জ বা সম্পূর্ণ রিফান্ড সুবিধা।'
                      : 'Zero-hassle replacement or full refund within 7 days if you encounter any defect or issue.'}
                  </p>
                </div>
              </div>

              {/* Security Points Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">
                    {lang === 'bn' ? 'সহজ রিটার্ন পলিসি' : 'Easy Returns'}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <Truck className="w-4 h-4 text-[#FF6B35] shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">
                    {lang === 'bn' ? 'চেক করে পেমেন্ট' : 'Inspect on Delivery'}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 col-span-2 sm:col-span-1">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200">
                    {lang === 'bn' ? '২৪/৭ গ্রাহক সাপোর্ট' : '24/7 Support'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-slate-800/80 py-4 bg-[#070A14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Nebula Mart. All rights reserved. Made for Bangladesh.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>{lang === 'bn' ? 'উপরে যান' : 'Back to top'}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
