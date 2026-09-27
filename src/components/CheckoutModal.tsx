import React, { useState } from 'react';
import { X, ShieldCheck, Truck, CheckCircle2, AlertCircle, ShoppingBag, Copy, Check, Smartphone, Banknote } from 'lucide-react';
import { CartItem, Language, StoreSettings, Order, PaymentMethodType } from '../types';
import { t } from '../lib/translations';
import { StorageService } from '../lib/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  lang: Language;
  settings: StoreSettings;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  lang,
  settings,
  onOrderSuccess
}) => {
  const strings = t[lang];

  // Customer form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [district, setDistrict] = useState<'Dhaka' | 'Outside Dhaka'>('Dhaka');
  const [thana, setThana] = useState('');
  const [address, setAddress] = useState('');
  const [orderNote, setOrderNote] = useState('');

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('Cash on Delivery');
  const [transactionId, setTransactionId] = useState('');
  const [trxError, setTrxError] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Errors & Loading state
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe Payment Settings with optional chaining & default fallbacks (prevents any undefined reading)
  const isCodEnabled = settings?.paymentSettings?.cod?.enabled ?? true;
  const isBkashEnabled = settings?.paymentSettings?.bkash?.enabled ?? true;
  const isNagadEnabled = settings?.paymentSettings?.nagad?.enabled ?? true;

  const bkashNumber = settings?.paymentSettings?.bkash?.accountNumber || settings?.phone || '';
  const bkashType = settings?.paymentSettings?.bkash?.accountType || 'Merchant';
  const bkashInstructions = lang === 'bn'
    ? (settings?.paymentSettings?.bkash?.instructionsBn || 'উক্ত বিকাশ নম্বরে পেমেন্ট করে TrxID দিন')
    : (settings?.paymentSettings?.bkash?.instructions || 'Make payment to this bKash number & provide TrxID below');

  const nagadNumber = settings?.paymentSettings?.nagad?.accountNumber || settings?.phone || '';
  const nagadType = settings?.paymentSettings?.nagad?.accountType || 'Merchant';
  const nagadInstructions = lang === 'bn'
    ? (settings?.paymentSettings?.nagad?.instructionsBn || 'উক্ত নগদ মার্চেন্ট নম্বরে পেমেন্ট করে TrxID দিন')
    : (settings?.paymentSettings?.nagad?.instructions || 'Make payment to this Nagad number & provide TrxID below');

  // Delivery charge based on district selection
  const deliveryCharge = district === 'Dhaka'
    ? (settings?.deliveryChargeInsideDhaka ?? 80)
    : (settings?.deliveryChargeOutsideDhaka ?? 130);

  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const total = subtotal + deliveryCharge;

  // Bangladeshi phone number validator (013 - 019, 11 digits)
  const validateBdPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s-]/g, '');
    const regex = /^(01[3-9]\d{8})$/;
    return regex.test(cleaned);
  };

  const handlePhoneChange = (val: string) => {
    setCustomerPhone(val);
    if (phoneError) setPhoneError('');
  };

  const handleCopy = (num: string) => {
    navigator.clipboard?.writeText(num);
    setCopiedAccount(num);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setTrxError('');

    if (!customerName.trim()) {
      setFormError(lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : 'Please enter your full name.');
      return;
    }

    if (!validateBdPhone(customerPhone)) {
      setPhoneError(strings.phoneError);
      return;
    }

    if (!address.trim()) {
      setFormError(lang === 'bn' ? 'অনুগ্রহ করে আপনার ডেলিভারি ঠিকানা লিখুন।' : 'Please enter your complete delivery address.');
      return;
    }

    if (items.length === 0) {
      setFormError(lang === 'bn' ? 'আপনার কার্ট খালি।' : 'Your cart is empty.');
      return;
    }

    if ((paymentMethod === 'bKash' || paymentMethod === 'Nagad') && !transactionId.trim()) {
      setTrxError(lang === 'bn' ? 'অনুগ্রহ করে ট্রানজেকশন আইডি (TrxID) প্রদান করুন।' : 'Please provide the transaction ID (TrxID).');
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim().replace(/[\s-]/g, ''),
      customerEmail: customerEmail.trim() || undefined,
      district,
      districtBn: district === 'Dhaka' ? 'ঢাকা সিটি' : 'ঢাকার বাইরে',
      thana: thana.trim() || undefined,
      address: address.trim(),
      orderNote: orderNote.trim() || undefined,
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productNameBn: item.product.nameBn,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images[0]
      })),
      subtotal,
      deliveryCharge,
      total,
      paymentMethod,
      transactionId: (paymentMethod === 'bKash' || paymentMethod === 'Nagad') ? transactionId.trim() : undefined
    };

    const result = StorageService.createOrder(orderPayload);
    setIsSubmitting(false);

    if (result.success && result.order) {
      onOrderSuccess(result.order);
    } else {
      setFormError(result.error || 'Failed to place order. Please check item stock.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-[-0.025em]">
              {strings.checkoutTitle}
            </h2>
            <p className="text-xs text-[#64748B] font-normal tracking-[-0.005em] mt-0.5">
              {strings.checkoutSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmitOrder} className="overflow-y-auto p-6 space-y-6 flex-1 bg-white">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-[0.06em] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[10px]">1</span>
              {strings.customerInfo}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.fullName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={lang === 'bn' ? 'আপনার নাম লিখুন' : 'e.g. Shakil Ahmed'}
                  className="w-full h-11 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] focus:outline-hidden focus:border-[#FF6B35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.phoneNumber} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={strings.phonePlaceholder}
                  className={`w-full h-11 px-3.5 rounded-lg border ${
                    phoneError ? 'border-red-500 bg-red-50/20' : 'border-[#E5E7EB]'
                  } bg-white text-sm text-[#111827] focus:outline-hidden focus:border-[#FF6B35]`}
                />
                {phoneError && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {phoneError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {strings.emailOptional}
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] focus:outline-hidden focus:border-[#FF6B35]"
              />
            </div>
          </div>

          {/* Section 2: Delivery Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[10px]">2</span>
              {strings.deliveryAddress}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.selectDistrict} <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as any)}
                  className="w-full h-11 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] focus:outline-hidden focus:border-[#FF6B35]"
                >
                  <option value="Dhaka">{strings.dhakaCity}</option>
                  <option value="Outside Dhaka">{strings.outsideDhaka}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {strings.thanaOrArea}
                </label>
                <input
                  type="text"
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: উত্তরা, মিরপুর, গুলশান' : 'e.g. Uttara / Dhanmondi'}
                  className="w-full h-11 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] focus:outline-hidden focus:border-[#FF6B35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {strings.fullAddress} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={strings.addressPlaceholder}
                className="w-full p-3 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] focus:outline-hidden focus:border-[#FF6B35]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {strings.orderNote}
              </label>
              <input
                type="text"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: বিকালে ডেলিভারি করবেন' : 'e.g. Call before delivery'}
                className="w-full h-10 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs text-[#111827] focus:outline-hidden focus:border-[#FF6B35]"
              />
            </div>
          </div>

          {/* Section 3: Payment Method (COD, bKash, Nagad) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[10px]">3</span>
              {strings.paymentMethod}
            </h3>

            {/* Payment Method Selector Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {isCodEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Banknote className="w-5 h-5 mb-1.5 text-emerald-600" />
                  <span className="text-xs font-bold block">{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">{lang === 'bn' ? 'পণ্য হাতে পেয়ে টাকা' : 'Pay on Delivery'}</span>
                </button>
              )}

              {isBkashEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bKash')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left ${
                    paymentMethod === 'bKash'
                      ? 'border-[#E2136E] bg-pink-50/70 text-pink-950 ring-2 ring-pink-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1.5 text-[#E2136E]" />
                  <span className="text-xs font-bold block">bKash (বিকাশ)</span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">{bkashType} Payment</span>
                </button>
              )}

              {isNagadEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Nagad')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center sm:items-start text-center sm:text-left ${
                    paymentMethod === 'Nagad'
                      ? 'border-[#F7941D] bg-orange-50/70 text-orange-950 ring-2 ring-orange-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1.5 text-[#F7941D]" />
                  <span className="text-xs font-bold block">Nagad (নগদ)</span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">{nagadType} Payment</span>
                </button>
              )}
            </div>

            {/* Cash on Delivery details box */}
            {paymentMethod === 'Cash on Delivery' && (
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900">
                  {strings.cashOnDeliveryDesc}
                </p>
              </div>
            )}

            {/* bKash instructions & TrxID box */}
            {paymentMethod === 'bKash' && (
              <div className="p-4 rounded-xl border border-pink-200 bg-pink-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-pink-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      bKash {bkashType} Account:
                    </span>
                    <span className="ml-2 font-mono font-bold text-sm text-[#E2136E]">
                      {bkashNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bkashNumber)}
                    className="self-start sm:self-auto px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedAccount === bkashNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">{lang === 'bn' ? 'কপি হয়েছে' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'নম্বর কপি করুন' : 'Copy Number'}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-700">
                  {bkashInstructions}
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    {lang === 'bn' ? 'বিকাশ ট্রানজেকশন আইডি (TrxID)' : 'bKash Transaction ID (TrxID)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      if (trxError) setTrxError('');
                    }}
                    placeholder="e.g. 9J4K2L7M1Q"
                    className="w-full h-11 px-3.5 rounded-lg border border-pink-300 bg-white text-sm uppercase tracking-wider font-mono text-[#111827] focus:outline-hidden focus:border-[#E2136E]"
                  />
                  {trxError && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{trxError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Nagad instructions & TrxID box */}
            {paymentMethod === 'Nagad' && (
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-orange-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      Nagad {nagadType} Account:
                    </span>
                    <span className="ml-2 font-mono font-bold text-sm text-[#F7941D]">
                      {nagadNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(nagadNumber)}
                    className="self-start sm:self-auto px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedAccount === nagadNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">{lang === 'bn' ? 'কপি হয়েছে' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'নম্বর কপি করুন' : 'Copy Number'}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-700">
                  {nagadInstructions}
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    {lang === 'bn' ? 'নগদ ট্রানজেকশন আইডি (TrxID)' : 'Nagad Transaction ID (TrxID)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      if (trxError) setTrxError('');
                    }}
                    placeholder="e.g. 7N8B3V2C1X"
                    className="w-full h-11 px-3.5 rounded-lg border border-orange-300 bg-white text-sm uppercase tracking-wider font-mono text-[#111827] focus:outline-hidden focus:border-[#F7941D]"
                  />
                  {trxError && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">{trxError}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Order Items & Price Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase">
                {strings.orderSummary} ({items.length} {items.length > 1 ? 'items' : 'item'})
              </span>
              <span className="text-xs text-slate-500">
                {district === 'Dhaka' ? strings.deliveryDhaka : strings.deliveryOutsideDhaka}
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-xs text-slate-700">
                  <span className="truncate max-w-[240px]">
                    {lang === 'bn' ? item.product.nameBn : item.product.name} × {item.quantity}
                  </span>
                  <span className="font-semibold shrink-0 text-slate-900">
                    ৳{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{strings.subtotal}:</span>
                <span className="font-bold text-slate-800">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{strings.deliveryCharge}:</span>
                <span className="font-bold text-slate-800">৳{deliveryCharge}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-black text-[#0F172A] pt-1.5 border-t border-slate-200">
                <span className="tracking-[-0.01em]">{strings.total}:</span>
                <span className="text-[#FF6B35] tracking-[-0.03em] tabular-nums">৳{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit Action: PLACE ORDER (#FF6B35 dominant button) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-13 rounded-lg bg-[#FF6B35] hover:bg-[#E85924] disabled:bg-slate-400 text-white font-bold text-base tracking-[-0.015em] flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>{strings.placingOrder}</span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>{strings.placeOrder} (৳{total.toLocaleString()})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
