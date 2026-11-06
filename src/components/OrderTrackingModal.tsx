import React, { useState } from 'react';
import { X, Search, Package, Truck, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Language, Order, StoreSettings } from '../types';
import { StorageService } from '../lib/storage';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  settings?: StoreSettings;
  initialPhone?: string;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  lang,
  settings,
  initialPhone
}) => {
  const [query, setQuery] = useState(initialPhone || '');
  const [searched, setSearched] = useState(false);
  const [matchedOrders, setMatchedOrders] = useState<Order[]>([]);

  React.useEffect(() => {
    if (isOpen && initialPhone) {
      setQuery(initialPhone);
      const clean = initialPhone.replace(/[^0-9]/g, '');
      const allOrders = StorageService.getOrders();
      const results = allOrders.filter((ord) =>
        ord.customerPhone.replace(/[^0-9]/g, '').includes(clean)
      );
      setMatchedOrders(results);
      setSearched(true);
    }
  }, [isOpen, initialPhone]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    const allOrders = StorageService.getOrders();
    const results = allOrders.filter((ord) => {
      const orderNumMatch = ord.orderNumber.toLowerCase().includes(cleanQuery);
      const phoneMatch = ord.customerPhone.replace(/[^0-9]/g, '').includes(cleanQuery.replace(/[^0-9]/g, ''));
      return orderNumMatch || phoneMatch;
    });

    setMatchedOrders(results);
    setSearched(true);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered'}</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'bn' ? 'ডেলিভারিতে চলমান' : 'In Transit / Shipped'}</span>
          </span>
        );
      case 'confirmed':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{lang === 'bn' ? 'অর্ডার প্রস্তুত হচ্ছে' : 'Processing'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{lang === 'bn' ? 'বাতিল' : 'Cancelled'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-[#F85606] border border-orange-200">
            <Clock className="w-3.5 h-3.5 text-[#F85606]" />
            <span>{lang === 'bn' ? 'অপেক্ষমান (Pending)' : 'Pending'}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 min-[360px]:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#F85606] flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                {lang === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Order Tracking'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {lang === 'bn' ? 'ফোন নাম্বার বা অর্ডার আইডি দিয়ে ট্র্যাক করুন' : 'Track with phone number or Order ID'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: 01700000000 বা #ORD-1234' : 'e.g. 01700000000 or #ORD-1234'}
                className="w-full h-11 pl-3.5 pr-9 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#F85606] focus:ring-1 focus:ring-[#F85606]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="min-h-[44px] h-[44px] px-4 rounded-xl bg-[#F85606] hover:bg-[#E04D05] active:scale-95 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সার্চ' : 'Track'}</span>
            </button>
          </form>
        </div>

        {/* Results Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {!searched ? (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs sm:text-sm">
                {lang === 'bn'
                  ? 'আপনার অর্ডার স্ট্যাটাস জানতে উপরের বক্সে ফোন নাম্বার দিন'
                  : 'Enter your phone number above to see current order status'}
              </p>
            </div>
          ) : matchedOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                {lang === 'bn' ? 'কোনো অর্ডার খুঁজে পাওয়া যায়নি' : 'No Orders Found'}
              </p>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'দয়া করে সঠিক ফোন নাম্বার বা অর্ডার নম্বর দিয়ে আবার চেষ্টা করুন'
                  : 'Please check your phone number or Order ID and try again'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matchedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-black text-slate-900 tracking-tight">
                        {ord.orderNumber}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    {getStatusBadge(ord.status)}
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-slate-100 text-xs text-slate-700">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <span className="truncate max-w-[220px]">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-semibold tabular-nums">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total & Courier */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {lang === 'bn' ? 'মোট মূল্য (ক্যাশ অন ডেলিভারি):' : 'Total (Cash On Delivery):'}
                    </span>
                    <span className="font-black text-[#F85606] text-sm tabular-nums">
                      ৳{ord.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Courier tracking dispatch link if available */}
                  {ord.courierDispatch?.consignmentId && (
                    <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-100 text-xs text-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#F85606]" />
                        <span>
                          {ord.courierDispatch.provider}: <strong>{ord.courierDispatch.consignmentId}</strong>
                        </span>
                      </div>
                      {ord.courierDispatch.trackingUrl && (
                        <a
                          href={ord.courierDispatch.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#F85606] hover:underline font-bold flex items-center gap-0.5 text-[11px]"
                        >
                          <span>{lang === 'bn' ? 'ট্র্যাক' : 'Track'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Support Hotline */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>{lang === 'bn' ? 'কোনো প্রয়োজনে কল করুন:' : 'Customer Care:'} </span>
          <a href={`tel:${settings?.phone || '01700000000'}`} className="font-bold text-[#F85606] hover:underline">
            {settings?.phone || '01700000000'}
          </a>
        </div>
      </div>
    </div>
  );
};
