import React from 'react';
import { X, User, Phone, MessageSquare, ShieldCheck, RefreshCw, Truck, Heart } from 'lucide-react';
import { Language, StoreSettings } from '../types';

interface AccountSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  settings?: StoreSettings;
  onOpenOrders: () => void;
}

export const AccountSupportModal: React.FC<AccountSupportModalProps> = ({
  isOpen,
  onClose,
  lang,
  settings,
  onOpenOrders
}) => {
  if (!isOpen) return null;

  const phone = settings?.phone || '01700000000';
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 min-[360px]:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F85606] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {lang === 'bn' ? 'অ্যাকাউন্ট ও হেল্পলাইন' : 'Account & Help Desk'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {lang === 'bn' ? 'নেবুলা মার্ট সাপোর্ট সেন্টার' : 'Nebula Mart Support'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 space-y-3">
          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenOrders();
              }}
              className="w-full min-h-[46px] p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 flex items-center justify-between transition-all cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#F85606]" />
                <span className="text-xs font-bold text-slate-800">
                  {lang === 'bn' ? 'আমার অর্ডার ট্র্যাক করুন' : 'Track My Orders'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">→</span>
            </button>

            {/* Direct Phone Call */}
            <a
              href={`tel:${phone}`}
              className="w-full min-h-[46px] p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 flex items-center justify-between transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {lang === 'bn' ? 'কাস্টমার কেয়ার হটলাইন' : 'Customer Care Hotline'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{phone}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                {lang === 'bn' ? 'কল করুন' : 'Call'}
              </span>
            </a>

            {/* WhatsApp Support */}
            <a
              href={`https://wa.me/88${cleanPhone}?text=Hello%20Nebula%20Mart`}
              target="_blank"
              rel="noreferrer"
              className="w-full min-h-[46px] p-3 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50/50 flex items-center justify-between transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {lang === 'bn' ? 'হোয়াটসঅ্যাপে চ্যাট' : 'WhatsApp Support'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {lang === 'bn' ? '২৪ ঘণ্টা দ্রুত রেসপন্স' : 'Fast 24/7 Response'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-800">
                {lang === 'bn' ? 'মেসেজ' : 'Chat'}
              </span>
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{lang === 'bn' ? '১০০% ক্যাশ অন ডেলিভারি (পণ্য দেখে পেমেন্ট)' : '100% Cash On Delivery (Inspect First)'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
              <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{lang === 'bn' ? '৭ দিনের সহজ রিটার্ন ও পরিবর্তন পলিসি' : '7 Days Easy Return & Replacement'}</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
          Nebula Mart • {lang === 'bn' ? 'স্বাচ্ছন্দ্যময় অনলাইন কেনাকাটা' : 'Convenient Online Shopping'}
        </div>
      </div>
    </div>
  );
};
