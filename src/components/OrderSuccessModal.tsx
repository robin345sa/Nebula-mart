import React from 'react';
import { CheckCircle, Printer, ArrowRight, Truck, Phone, PackageCheck } from 'lucide-react';
import { Order, Language, StoreSettings } from '../types';
import { t } from '../lib/translations';

interface OrderSuccessModalProps {
  order: Order | null;
  lang: Language;
  settings: StoreSettings;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  lang,
  settings,
  onClose
}) => {
  if (!order) return null;

  const strings = t[lang];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white">
              {strings.orderSuccessTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-1 max-w-md mx-auto">
              {strings.orderSuccessSubtitle}
            </p>
          </div>

          {/* Key Order Highlight Badge */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {strings.orderNumber}
              </span>
              <span className="text-lg font-black text-[#0F172A] dark:text-white">
                {order.orderNumber}
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {lang === 'bn' ? 'মোট প্রদেয় বিল (COD)' : 'Total Payable (COD)'}
              </span>
              <span className="text-xl font-black text-[#FF6B35]">
                ৳{order.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Delivery & Customer Info Card */}
          <div className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block">{strings.fullName}:</span>
                <span className="font-bold text-slate-800 dark:text-white">{order.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{strings.phoneNumber}:</span>
                <span className="font-bold text-slate-800 dark:text-white">{order.customerPhone}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block">{strings.deliveryAddress}:</span>
              <p className="font-medium text-slate-800 dark:text-white mt-0.5">
                {order.address}, {order.thana ? `${order.thana}, ` : ''}{order.district}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">{lang === 'bn' ? 'পেমেন্ট পদ্ধতি:' : 'Payment Method:'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {strings.cashOnDelivery}
              </span>
            </div>
          </div>

          {/* Items Purchased List */}
          <div className="text-left space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'অর্ডারকৃত পণ্যসমূহ:' : 'Ordered Items:'}
            </span>
            <div className="space-y-1.5 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span className="truncate max-w-[280px]">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="font-semibold shrink-0">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                <span>{strings.deliveryCharge}:</span>
                <span>৳{order.deliveryCharge}</span>
              </div>
            </div>
          </div>

          {/* Notification Advisory */}
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5 text-left">
            <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>{strings.trackOrderInfo}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{strings.printReceipt}</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>{strings.backToHome}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
