import React, { useState, useEffect } from 'react';
import { 
  X, User, Phone, MessageSquare, ShieldCheck, RefreshCw, Truck, Heart, LogOut, 
  CheckCircle, Lock, ArrowRight, UserCheck, Sparkles, HelpCircle, Package, 
  Clock, Calendar, ExternalLink, Search, ChevronDown, ChevronUp, RotateCcw, 
  ShoppingBag, MapPin, CreditCard, AlertCircle 
} from 'lucide-react';
import { Language, StoreSettings, CustomerAccount, Order, OrderItem, Product } from '../types';
import { StorageService } from '../lib/storage';

interface AccountSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  settings?: StoreSettings;
  onOpenOrders: (phone?: string) => void;
  onOpenWishlist?: () => void;
  onOpenCart?: () => void;
  defaultTab?: 'profile' | 'orders' | 'support';
}

export const AccountSupportModal: React.FC<AccountSupportModalProps> = ({
  isOpen,
  onClose,
  lang,
  settings,
  onOpenOrders,
  onOpenWishlist,
  onOpenCart,
  defaultTab = 'profile'
}) => {
  const [activeCustomer, setActiveCustomer] = useState<CustomerAccount | null>(() => StorageService.getActiveCustomer());
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'support'>(defaultTab);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Orders History State
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Status & Validation
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Keep activeCustomer & orders in sync with storage changes
  useEffect(() => {
    if (isOpen) {
      const cust = StorageService.getActiveCustomer();
      setActiveCustomer(cust);
      setErrorMsg('');
      setSuccessMsg('');
      setReorderSuccessMsg(null);
      if (defaultTab) {
        setActiveTab(defaultTab);
      }

      if (cust?.phone) {
        const clean = cust.phone.replace(/[^0-9]/g, '');
        const cleanLast10 = clean.slice(-10);
        const allOrders = StorageService.getOrders();
        const userOrders = allOrders.filter(o => {
          const orderPhoneClean = (o.customerPhone || '').replace(/[^0-9]/g, '');
          return orderPhoneClean.includes(cleanLast10) || clean.includes(orderPhoneClean.slice(-10));
        });
        // Sort descending by date
        userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCustomerOrders(userOrders);
        if (userOrders.length > 0) {
          setExpandedOrderId(userOrders[0].id);
        }
      } else {
        setCustomerOrders([]);
        setExpandedOrderId(null);
      }
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const helplinePhone = settings?.phone || '01700000000';
  const cleanHelplinePhone = helplinePhone.replace(/[^0-9]/g, '');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন' : 'Please enter your full name');
      return;
    }

    const cleanInputPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanInputPhone || cleanInputPhone.length < 11) {
      setErrorMsg(
        lang === 'bn'
          ? 'অনুগ্রহ করে সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
          : 'Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX)'
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = StorageService.registerCustomer(name, cleanInputPhone, password);
      setIsLoading(false);
      if (res.success && res.customer) {
        setActiveCustomer(res.customer);
        setSuccessMsg(
          lang === 'bn'
            ? 'অভিনন্দন! আপনার Nebula Mart অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।'
            : 'Congratulations! Your Nebula Mart account has been created successfully.'
        );
        setName('');
        setPhone('');
        setPassword('');

        // Refresh orders for newly registered user
        const allOrders = StorageService.getOrders();
        const cleanLast10 = cleanInputPhone.slice(-10);
        const userOrders = allOrders.filter(o => {
          const op = (o.customerPhone || '').replace(/[^0-9]/g, '');
          return op.includes(cleanLast10) || cleanInputPhone.includes(op.slice(-10));
        });
        userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCustomerOrders(userOrders);
        if (userOrders.length > 0) {
          setExpandedOrderId(userOrders[0].id);
        }
      } else {
        setErrorMsg(res.message);
      }
    }, 300);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanInputPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanInputPhone || cleanInputPhone.length < 11) {
      setErrorMsg(
        lang === 'bn'
          ? 'অনুগ্রহ করে সঠিক ১১-ডিজিটের মোবাইল নম্বর দিন'
          : 'Please enter a valid 11-digit mobile number'
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = StorageService.loginCustomer(cleanInputPhone, password);
      setIsLoading(false);
      if (res.success && res.customer) {
        setActiveCustomer(res.customer);
        setSuccessMsg(
          lang === 'bn'
            ? 'সফলভাবে লগইন হয়েছে! Nebula Mart-এ স্বাগতম।'
            : 'Successfully signed in! Welcome to Nebula Mart.'
        );
        setPhone('');
        setPassword('');

        // Refresh orders for logged in user
        const allOrders = StorageService.getOrders();
        const cleanLast10 = cleanInputPhone.slice(-10);
        const userOrders = allOrders.filter(o => {
          const op = (o.customerPhone || '').replace(/[^0-9]/g, '');
          return op.includes(cleanLast10) || cleanInputPhone.includes(op.slice(-10));
        });
        userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCustomerOrders(userOrders);
        if (userOrders.length > 0) {
          setExpandedOrderId(userOrders[0].id);
        }
      } else {
        setErrorMsg(res.message);
      }
    }, 300);
  };

  const handleLogout = () => {
    StorageService.logoutCustomer();
    setActiveCustomer(null);
    setCustomerOrders([]);
    setExpandedOrderId(null);
    setSuccessMsg(
      lang === 'bn'
        ? 'আপনার অ্যাকাউন্ট থেকে সফলভাবে লগআউট করা হয়েছে।'
        : 'You have been logged out successfully.'
    );
  };

  // Reorder all items from a past order into current cart
  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    const allProducts = StorageService.getProducts();
    let readdedCount = 0;

    for (const item of order.items) {
      const prod = allProducts.find(p => p.id === item.productId);
      if (prod && prod.inStock && prod.stock > 0) {
        const qty = Math.min(item.quantity, prod.stock);
        StorageService.addToCart(prod, qty);
        readdedCount += qty;
      }
    }

    window.dispatchEvent(new CustomEvent('mart_cart_updated'));

    if (readdedCount > 0) {
      setReorderSuccessMsg(
        lang === 'bn'
          ? `${readdedCount}টি পণ্য সফলভাবে আপনার কার্টে যোগ করা হয়েছে!`
          : `${readdedCount} items successfully added to your shopping cart!`
      );
      setTimeout(() => {
        setReorderSuccessMsg(null);
        if (onOpenCart) {
          onClose();
          onOpenCart();
        }
      }, 1200);
    } else {
      setErrorMsg(
        lang === 'bn'
          ? 'দুঃখিত, এই অর্ডারের পণ্যগুলো বর্তমানে স্টকে নেই।'
          : 'Sorry, the products in this order are currently out of stock.'
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return {
          label: lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'shipped':
        return {
          label: lang === 'bn' ? 'কুরিয়ারে চলমান' : 'Shipped',
          classes: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'confirmed':
        return {
          label: lang === 'bn' ? 'কনফার্মড' : 'Confirmed',
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'processing':
        return {
          label: lang === 'bn' ? 'প্রসেসিং' : 'Processing',
          classes: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'cancelled':
        return {
          label: lang === 'bn' ? 'বাতিল' : 'Cancelled',
          classes: 'bg-red-50 text-red-700 border-red-200'
        };
      default:
        return {
          label: lang === 'bn' ? 'পেন্ডিং' : 'Pending',
          classes: 'bg-amber-50 text-amber-700 border-amber-200'
        };
    }
  };

  // Lifetime metrics for logged in user
  const totalLifetimeSpend = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeOrdersCount = customerOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#112A7E]/10 text-[#112A7E] flex items-center justify-center font-bold">
              {activeCustomer ? (
                <UserCheck className="w-5 h-5 text-[#112A7E]" />
              ) : (
                <User className="w-5 h-5 text-[#112A7E]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight flex items-center gap-1.5">
                <span>
                  {activeCustomer 
                    ? (lang === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account') 
                    : (lang === 'bn' ? 'কাস্টমার অ্যাকাউন্ট' : 'Customer Account')}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#112A7E] text-white">
                  Nebula Mart
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeCustomer
                  ? (lang === 'bn' ? 'নেবুলা মার্ট রেজিস্টার্ড মেম্বার' : 'Nebula Mart Verified Member')
                  : (lang === 'bn' ? 'অ্যাকাউন্ট ও অর্ডার হিস্ট্রি পোর্টাল' : 'Account & Order History Portal')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200/80 bg-white shrink-0">
          <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('profile');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-white text-[#112A7E] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>{activeCustomer ? (lang === 'bn' ? 'প্রোফাইল' : 'Profile') : (lang === 'bn' ? 'লগইন / সাইন আপ' : 'Login / Sign Up')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('orders');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'orders'
                  ? 'bg-white text-[#112A7E] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'bn' ? 'অর্ডার হিস্ট্রি' : 'Order History'}</span>
              {activeCustomer && customerOrders.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === 'orders' ? 'bg-[#112A7E] text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {customerOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('support');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'support'
                  ? 'bg-white text-[#112A7E] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'bn' ? 'সহায়তা' : 'Support'}</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}
        {reorderSuccessMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#112A7E] text-xs font-semibold flex items-center gap-2 shrink-0 animate-in fade-in">
            <ShoppingBag className="w-4 h-4 text-[#112A7E] shrink-0" />
            <span className="flex-1">{reorderSuccessMsg}</span>
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* ========================================================= */}
          {/* TAB 1: ORDER HISTORY TAB                                  */}
          {/* ========================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in">
              {!activeCustomer ? (
                /* Non-logged in Gate */
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#112A7E]/10 text-[#112A7E] flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-slate-900">
                      {lang === 'bn' ? 'অর্ডার হিস্ট্রি দেখতে লগইন করুন' : 'Sign in to View Order History'}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      {lang === 'bn' 
                        ? 'আপনার অতীতের অর্ডারসমূহ এবং ডেলিভারি ট্র্যাকিং আপনার নিবন্ধিত মোবাইল নম্বরের সাথে নিরাপদে সংরক্ষিত থাকে।' 
                        : 'Your past orders and delivery records are securely linked to your registered mobile number.'}
                    </p>
                  </div>

                  <div className="pt-2 space-y-2 max-w-xs mx-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('profile');
                        setMode('login');
                      }}
                      className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#112A7E] hover:bg-[#0D2166] text-white text-xs font-black shadow-md shadow-[#112A7E]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'অ্যাকাউন্টে লগইন করুন' : 'Sign In with Mobile Number'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('profile');
                        setMode('signup');
                      }}
                      className="w-full min-h-[40px] py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      {lang === 'bn' ? 'নতুন অ্যাকাউন্ট খুলুন (সাইন আপ)' : 'Create New Account (Sign Up)'}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenOrders();
                      }}
                      className="text-xs font-bold text-[#112A7E] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'লগইন ছাড়াই নির্দিষ্ট একটি অর্ডার ট্র্যাক করুন' : 'Track an order without login using phone number'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Logged-In Customer Order History */
                <div className="space-y-4">
                  {/* KPI Summary Card */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-2xs">
                      <span className="block text-[10px] text-slate-500 font-medium">
                        {lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
                      </span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {customerOrders.length}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-2xs">
                      <span className="block text-[10px] text-slate-500 font-medium">
                        {lang === 'bn' ? 'চলমান অর্ডার' : 'Active Orders'}
                      </span>
                      <span className="text-sm font-black text-blue-600 font-mono">
                        {activeOrdersCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-2xs">
                      <span className="block text-[10px] text-slate-500 font-medium">
                        {lang === 'bn' ? 'মোট কেনাকাটা' : 'Total Spent'}
                      </span>
                      <span className="text-sm font-black text-[#112A7E] font-mono tabular-nums">
                        ৳{totalLifetimeSpend.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Orders List / Empty State */}
                  {customerOrders.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
                      <Package className="w-12 h-12 text-slate-300 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          {lang === 'bn' ? 'আপনার কোনো পূর্ববর্তী অর্ডার নেই' : 'No Order History Found'}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                          {lang === 'bn' 
                            ? 'আপনি নেবুলা মার্ট থেকে যেকোনো পণ্য অর্ডার করলেই তার বিস্তারিত তথ্য ও ডেলিভারি স্ট্যাটাস এখানে দেখতে পাবেন।' 
                            : 'When you place orders on Nebula Mart, your full purchase breakdown and tracking will appear here.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onClose}
                        className="min-h-[40px] px-5 py-2 rounded-xl bg-[#112A7E] text-white text-xs font-black hover:bg-[#0D2166] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'কেনাকাটা শুরু করুন' : 'Start Shopping'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                        <span className="font-semibold">
                          {lang === 'bn' ? 'আপনার সম্পূর্ণ অর্ডার তালিকা:' : 'Your complete order records:'}
                        </span>
                        <span className="font-mono text-[11px]">
                          📱 {activeCustomer.phone}
                        </span>
                      </div>

                      {customerOrders.map((ord) => {
                        const isExpanded = expandedOrderId === ord.id;
                        const status = getStatusBadge(ord.status);
                        const orderDate = new Date(ord.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        });

                        return (
                          <div
                            key={ord.id}
                            className={`rounded-2xl border transition-all overflow-hidden ${
                              isExpanded 
                                ? 'border-[#112A7E]/40 shadow-sm bg-white ring-1 ring-[#112A7E]/10' 
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            {/* Card Header (Always Visible - Click to toggle) */}
                            <button
                              type="button"
                              onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                              className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
                            >
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-black text-slate-900">
                                    #{ord.orderNumber}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${status.classes}`}>
                                    {status.label}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{orderDate}</span>
                                  </span>
                                  <span>·</span>
                                  <span>
                                    {ord.items?.length || 0} {lang === 'bn' ? 'টি আইটেম' : 'items'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 text-right">
                                <div>
                                  <span className="block text-xs font-black text-[#112A7E] font-mono tabular-nums">
                                    ৳{ord.total.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium block">
                                    {ord.paymentMethod}
                                  </span>
                                </div>
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </button>

                            {/* Expanded Accordion Body */}
                            {isExpanded && (
                              <div className="p-4 border-t border-slate-100 space-y-4 animate-in fade-in">
                                
                                {/* Items List with Photos */}
                                <div className="space-y-2.5">
                                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    {lang === 'bn' ? 'অর্ডারের পণ্যসমূহ:' : 'Ordered Items:'}
                                  </h5>
                                  <div className="space-y-2">
                                    {ord.items && ord.items.map((item, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100"
                                      >
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center">
                                          {item.image ? (
                                            <img
                                              src={item.image}
                                              alt={item.productName}
                                              referrerPolicy="no-referrer"
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                (e.currentTarget as HTMLElement).style.display = 'none';
                                              }}
                                            />
                                          ) : (
                                            <Package className="w-6 h-6 text-slate-300" />
                                          )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <h6 className="text-xs font-bold text-slate-900 truncate">
                                            {lang === 'bn' ? item.productNameBn || item.productName : item.productName}
                                          </h6>
                                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                                            <span>৳{item.price.toLocaleString()} × {item.quantity}</span>
                                          </div>
                                        </div>

                                        <div className="text-right shrink-0 font-mono text-xs font-bold text-slate-900 tabular-nums">
                                          ৳{(item.price * item.quantity).toLocaleString()}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Cost Breakdown & Address Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                                  
                                  {/* Delivery & Payment Details */}
                                  <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
                                    <div className="flex items-start gap-2">
                                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                      <div className="min-w-0 text-[11px]">
                                        <span className="font-bold text-slate-700 block">
                                          {lang === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
                                        </span>
                                        <p className="text-slate-600 line-clamp-2 mt-0.5">
                                          {ord.address}, {ord.district}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                                      <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span className="text-slate-600">
                                        {lang === 'bn' ? 'পেমেন্ট:' : 'Payment:'} <strong className="text-slate-800">{ord.paymentMethod}</strong>
                                      </span>
                                    </div>

                                    {ord.courier && typeof ord.courier === 'object' && ord.courier.consignmentId && (
                                      <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-mono pt-1">
                                        <Truck className="w-3 h-3 text-blue-600 shrink-0" />
                                        <span>{ord.courier.provider}: {ord.courier.consignmentId}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Price Sums */}
                                  <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5 text-[11px]">
                                    <div className="flex items-center justify-between text-slate-600">
                                      <span>{lang === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                                      <span className="font-mono tabular-nums">৳{ord.subtotal.toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-slate-600">
                                      <span>{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}</span>
                                      <span className="font-mono tabular-nums">৳{ord.deliveryCharge.toLocaleString()}</span>
                                    </div>

                                    {ord.discountAmount && ord.discountAmount > 0 && (
                                      <div className="flex items-center justify-between text-emerald-600 font-medium">
                                        <span>{lang === 'bn' ? 'ডিসকাউন্ট ছাড়' : 'Discount'}</span>
                                        <span className="font-mono tabular-nums">-৳{ord.discountAmount.toLocaleString()}</span>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-xs font-black text-slate-900">
                                      <span>{lang === 'bn' ? 'সর্বমোট' : 'Grand Total'}</span>
                                      <span className="font-mono text-[#112A7E] tabular-nums">৳{ord.total.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Action Buttons */}
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      onOpenOrders(ord.customerPhone);
                                    }}
                                    className="flex-1 min-h-[40px] py-2 px-3 rounded-xl border border-slate-200 hover:border-[#112A7E]/40 hover:bg-blue-50/50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Truck className="w-3.5 h-3.5 text-[#112A7E]" />
                                    <span>{lang === 'bn' ? 'ডেলিভারি ট্র্যাক করুন' : 'Track Delivery'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleReorder(ord)}
                                    className="flex-1 min-h-[40px] py-2 px-3 rounded-xl bg-[#112A7E] hover:bg-[#0D2166] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>{lang === 'bn' ? 'পুনরায় অর্ডার করুন' : 'Reorder Items'}</span>
                                  </button>
                                </div>

                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PROFILE & AUTH TAB                                 */}
          {/* ========================================================= */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in">
              {activeCustomer ? (
                /* Profile View */
                <div className="space-y-4">
                  {/* Profile Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#112A7E]/5 via-[#112A7E]/10 to-blue-50 border border-[#112A7E]/20 relative overflow-hidden">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#112A7E] text-white font-black text-lg flex items-center justify-center shadow-md ring-2 ring-white">
                        {activeCustomer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 truncate">
                            {activeCustomer.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {lang === 'bn' ? 'মেম্বার' : 'Member'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5 font-mono">
                          📱 {activeCustomer.phone}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#112A7E]/15 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{lang === 'bn' ? 'স্বয়ংক্রিয় দ্রুত চেকআউট সক্রিয়' : 'Fast Auto-Checkout Active'}</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        {lang === 'bn' ? 'কানেক্টেড' : 'Connected'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Navigation */}
                  <div className="space-y-2">
                    {/* Switch to Order History Tab */}
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="w-full min-h-[48px] p-3 rounded-xl border border-slate-200 hover:border-[#112A7E]/40 hover:bg-blue-50/40 flex items-center justify-between transition-all cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#F85606] flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">
                              {lang === 'bn' ? 'আমার অর্ডার হিস্ট্রি দেখুন' : 'View My Order History'}
                            </span>
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-[#112A7E] text-white">
                              {customerOrders.length}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {lang === 'bn' ? 'পূর্ববর্তী অর্ডারের বিস্তারিত তথ্য ও রিক্যাপ' : 'View past purchase breakdown & status'}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#112A7E] group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* View Saved Wishlist */}
                    {onOpenWishlist && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenWishlist();
                        }}
                        className="w-full min-h-[48px] p-3 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/40 flex items-center justify-between transition-all cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Heart className="w-4 h-4 fill-red-500" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {lang === 'bn' ? 'পছন্দের তালিকা (উইশলিস্ট)' : 'My Saved Wishlist'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {lang === 'bn' ? 'সংরক্ষিত পণ্যসমূহ দেখুন' : 'View all your saved products'}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'অ্যাকাউন্ট থেকে লগআউট' : 'Sign Out of Account'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration / Sign In View */
                <div className="space-y-4">
                  {/* Optional Notice */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100/90 text-[11px] text-[#112A7E] flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#112A7E] shrink-0 mt-0.5" />
                    <p className="leading-snug">
                      {lang === 'bn'
                        ? 'অ্যাকাউন্ট খোলা সম্পূর্ণ ঐচ্ছিক। আপনি চাইলে অ্যাকাউন্ট ছাড়াও সাধারণ ক্রেতা হিসেবে সরাসরি অর্ডার করতে পারবেন।'
                        : 'Account creation is completely optional. You can also order directly as a guest.'}
                    </p>
                  </div>

                  {/* Tabs: Sign Up vs Login */}
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        mode === 'signup'
                          ? 'bg-white text-[#112A7E] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lang === 'bn' ? 'সাইন আপ (নতুন অ্যাকাউন্ট)' : 'Sign Up (Register)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        mode === 'login'
                          ? 'bg-white text-[#112A7E] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lang === 'bn' ? 'লগইন' : 'Log In'}
                    </button>
                  </div>

                  {mode === 'signup' ? (
                    <form onSubmit={handleRegister} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          {lang === 'bn' ? 'আপনার নাম' : 'Full Name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.includes('তানভীর') || val.toLowerCase().includes('tanvir')) {
                              const sanitized = val
                                .replace(/মোহাম্মদ\s*তানভীর\s*আহমেদ/gi, 'মোহাম্মদ অ্যালেক্স')
                                .replace(/তানভীর\s*আহমেদ/gi, 'মোহাম্মদ অ্যালেক্স')
                                .replace(/তানভীর/gi, 'অ্যালেক্স')
                                .replace(/Mohammad\s*Tanvir\s*Ahmed/gi, 'Mohammad Alex')
                                .replace(/Tanvir\s*Ahmed/gi, 'Mohammad Alex')
                                .replace(/Tanvir/gi, 'Alex');
                              setName(sanitized);
                            } else {
                              setName(val);
                            }
                          }}
                          placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ অ্যালেক্স' : 'e.g. Mohammad Alex'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112A7E] focus:ring-2 focus:ring-[#112A7E]/10 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          {lang === 'bn' ? 'ফোন নম্বর' : 'Phone Number'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={lang === 'bn' ? '০১XXXXXXXXX (১১ ডিজিট)' : '01XXXXXXXXX (11 digits)'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112A7E] focus:ring-2 focus:ring-[#112A7E]/10 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all font-mono"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          {lang === 'bn' ? 'এই নম্বরে আপনার অর্ডার হিস্ট্রি ও ট্র্যাকিং সংযুক্ত থাকবে।' : 'This phone number links your order history & tracking.'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-800">
                            {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                          </label>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {lang === 'bn' ? 'ঐচ্ছিক' : 'Optional'}
                          </span>
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={lang === 'bn' ? 'পাসওয়ার্ড দিতে পারেন (ঐচ্ছিক)' : 'Set a password (Optional)'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112A7E] focus:ring-2 focus:ring-[#112A7E]/10 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full min-h-[44px] mt-2 py-2.5 px-4 rounded-xl bg-[#112A7E] hover:bg-[#0D2166] active:scale-98 text-white text-xs font-black shadow-md shadow-[#112A7E]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <span className="animate-pulse">{lang === 'bn' ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}</span>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>{lang === 'bn' ? 'অ্যাকাউন্ট খুলুন' : 'Create Account'}</span>
                          </>
                        )}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="text-xs font-bold text-[#112A7E] hover:underline cursor-pointer"
                        >
                          {lang === 'bn' ? 'ইতোমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Sign In'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          {lang === 'bn' ? 'নিবন্ধিত ফোন নম্বর' : 'Registered Phone Number'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={lang === 'bn' ? '০১XXXXXXXXX' : '01XXXXXXXXX'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112A7E] focus:ring-2 focus:ring-[#112A7E]/10 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          {lang === 'bn' ? 'পাসওয়ার্ড (যদি দিয়ে থাকেন)' : 'Password (if set)'}
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={lang === 'bn' ? 'আপনার পাসওয়ার্ড দিন' : 'Enter password'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#112A7E] focus:ring-2 focus:ring-[#112A7E]/10 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full min-h-[44px] mt-2 py-2.5 px-4 rounded-xl bg-[#112A7E] hover:bg-[#0D2166] active:scale-98 text-white text-xs font-black shadow-md shadow-[#112A7E]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <span className="animate-pulse">{lang === 'bn' ? 'লগইন হচ্ছে...' : 'Signing In...'}</span>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>{lang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                          </>
                        )}
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setMode('signup')}
                          className="text-xs font-bold text-[#112A7E] hover:underline cursor-pointer"
                        >
                          {lang === 'bn' ? 'নতুন ইউজার? এখানে ক্লিক করে সাইন আপ করুন' : 'New here? Click here to Sign Up'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenOrders();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#112A7E]/30 bg-blue-50/50 hover:bg-blue-50 text-[#112A7E] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Truck className="w-4 h-4 text-[#112A7E]" />
                      <span>{lang === 'bn' ? 'অ্যাকাউন্ট ছাড়াই ফোন নম্বর দিয়ে অর্ডার ট্র্যাক করুন' : 'Track Order with Phone Number (No Login)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: HELP & SUPPORT TAB                                 */}
          {/* ========================================================= */}
          {activeTab === 'support' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-2.5">
                <h4 className="text-xs font-black text-slate-900">
                  {lang === 'bn' ? 'কাস্টমার সাপোর্ট ও হেল্পলাইন' : 'Customer Support & Helpline'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {lang === 'bn'
                    ? 'অর্ডার ট্র্যাকিং, ডেলিভারি আপডেট বা যেকোনো প্রশ্নের জন্য আমাদের ডেডিকেটেড টিম প্রস্তুত রয়েছে।'
                    : 'Our dedicated customer service team is ready to assist you with orders, returns, and delivery inquiries.'}
                </p>
              </div>

              {/* Direct Phone Call */}
              <a
                href={`tel:${helplinePhone}`}
                className="w-full min-h-[50px] p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 flex items-center justify-between transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {lang === 'bn' ? 'অফিসিয়াল কাস্টমার কেয়ার' : 'Official Customer Care Hotline'}
                    </span>
                    <span className="text-xs text-slate-600 font-mono font-semibold">{helplinePhone}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                  {lang === 'bn' ? 'কল করুন' : 'Call'}
                </span>
              </a>

              {/* WhatsApp Support */}
              <a
                href={`https://wa.me/88${cleanHelplinePhone}?text=Hello%20Nebula%20Mart`}
                target="_blank"
                rel="noreferrer"
                className="w-full min-h-[50px] p-3 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50/50 flex items-center justify-between transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {lang === 'bn' ? 'হোয়াটসঅ্যাপ লাইভ চ্যাট' : 'WhatsApp Live Chat Support'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {lang === 'bn' ? '২৪ ঘণ্টা দ্রুত রেসপন্স' : '24/7 Fast Live Support'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-green-100 text-green-800">
                  {lang === 'bn' ? 'চ্যাট করুন' : 'Chat'}
                </span>
              </a>

              {/* Trust Guarantees */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {lang === 'bn' ? 'নেবুলা মার্ট শপিং নিশ্চয়তা' : 'Nebula Mart Shopping Guarantees'}
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{lang === 'bn' ? '৭ দিনের রিপ্লেসমেন্ট' : '7 Days Return'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>{lang === 'bn' ? 'সারা বাংলাদেশে ডেলিভারি' : 'Nationwide Delivery'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{lang === 'bn' ? '১০০% আসল পণ্য' : '100% Genuine Items'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500 font-medium shrink-0">
          Nebula Mart • {lang === 'bn' ? 'স্বাচ্ছন্দ্যময় ও ১০০% নিরাপদ শপিং' : 'Safe & Convenient Online Shopping'}
        </div>
      </div>
    </div>
  );
};
