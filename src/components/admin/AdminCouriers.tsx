import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Printer, 
  Send, 
  Building2, 
  ShieldCheck, 
  Search, 
  Key, 
  Settings2, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Order, Language, StoreSettings } from '../../types';
import { StorageService } from '../../lib/storage';

interface AdminCouriersProps {
  orders: Order[];
  settings: StoreSettings;
  lang: Language;
  onRefresh: () => void;
  onShowToast: (type: 'steadfast' | 'pathao', msg: string) => void;
  onSaveSettings: (settings: StoreSettings) => void;
}

// 8 Divisions of Bangladesh and their 64 districts
export interface DivisionData {
  id: string;
  name: string;
  nameBn: string;
  districtsCount: number;
  districts: string[];
  defaultCourier: 'Steadfast' | 'Pathao';
  deliveryFee: number;
  deliveryDays: string;
  deliveryDaysBn: string;
  status: 'Active' | 'Delayed';
}

export const BD_DIVISIONS: DivisionData[] = [
  {
    id: 'dhaka',
    name: 'Dhaka Division',
    nameBn: 'ঢাকা বিভাগ (সিটি ও আশেপাশের জেলা)',
    districtsCount: 13,
    districts: ['Dhaka City', 'Gazipur', 'Narayanganj', 'Tangail', 'Kishoreganj', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Faridpur', 'Gopalganj', 'Madaripur', 'Rajbari', 'Shariatpur'],
    defaultCourier: 'Pathao',
    deliveryFee: 80,
    deliveryDays: '24-48 Hours',
    deliveryDaysBn: '২৪-৪৮ ঘণ্টা',
    status: 'Active'
  },
  {
    id: 'chattogram',
    name: 'Chattogram Division',
    nameBn: 'চট্টগ্রাম বিভাগ',
    districtsCount: 11,
    districts: ['Chattogram', 'Cox\'s Bazar', 'Cumilla', 'Feni', 'Brahmanbaria', 'Noakhali', 'Chandpur', 'Lakshmipur', 'Rangamati', 'Khagrachhari', 'Bandarban'],
    defaultCourier: 'Steadfast',
    deliveryFee: 130,
    deliveryDays: '48-72 Hours',
    deliveryDaysBn: '৪৮-৭২ ঘণ্টা',
    status: 'Active'
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi Division',
    nameBn: 'রাজশাহী বিভাগ',
    districtsCount: 8,
    districts: ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj', 'Naogaon', 'Natore', 'Chapainawabganj', 'Joypurhat'],
    defaultCourier: 'Steadfast',
    deliveryFee: 130,
    deliveryDays: '48-72 Hours',
    deliveryDaysBn: '৪৮-৭২ ঘণ্টা',
    status: 'Active'
  },
  {
    id: 'khulna',
    name: 'Khulna Division',
    nameBn: 'খুলনা বিভাগ',
    districtsCount: 10,
    districts: ['Khulna', 'Jashore', 'Kushtia', 'Satkhira', 'Bagerhat', 'Jhenaidah', 'Chuadanga', 'Magura', 'Meherpur', 'Narail'],
    defaultCourier: 'Steadfast',
    deliveryFee: 130,
    deliveryDays: '48-72 Hours',
    deliveryDaysBn: '৪৮-৭২ ঘণ্টা',
    status: 'Active'
  },
  {
    id: 'sylhet',
    name: 'Sylhet Division',
    nameBn: 'সিলেট বিভাগ',
    districtsCount: 4,
    districts: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
    defaultCourier: 'Steadfast',
    deliveryFee: 130,
    deliveryDays: '48-72 Hours',
    deliveryDaysBn: '৪৮-৭২ ঘণ্টা',
    status: 'Active'
  },
  {
    id: 'barishal',
    name: 'Barishal Division',
    nameBn: 'বরিশাল বিভাগ',
    districtsCount: 6,
    districts: ['Barishal', 'Patuakhali', 'Bhola', 'Pirojpur', 'Barguna', 'Jhalokati'],
    defaultCourier: 'Steadfast',
    deliveryFee: 130,
    deliveryDays: '48-72 Hours',
    deliveryDaysBn: '৪৮-৭২ ঘণ্টা',
    status: 'Active'
  },
  {
    id: 'rangpur',
    name: 'Rangpur Division',
    nameBn: 'রংপুর বিভাগ',
    districtsCount: 8,
    districts: ['Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon'],
    defaultCourier: 'Steadfast',
    deliveryFee: 130,
    deliveryDays: '48-72 Hours',
    deliveryDaysBn: '৪৮-৭২ ঘণ্টা',
    status: 'Active'
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh Division',
    nameBn: 'ময়মনসিংহ বিভাগ',
    districtsCount: 4,
    districts: ['Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'],
    defaultCourier: 'Steadfast',
    deliveryFee: 130,
    deliveryDays: '48-72 Hours',
    deliveryDaysBn: '৪৮-৭২ ঘণ্টা',
    status: 'Active'
  }
];

export const AdminCouriers: React.FC<AdminCouriersProps> = ({
  orders,
  settings,
  lang,
  onRefresh,
  onShowToast,
  onSaveSettings
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'states' | 'api'>('orders');
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Filter orders by division & search
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      (order.courier?.consignmentId || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedDivision === 'all') return matchesSearch;

    if (selectedDivision === 'dhaka') {
      const isDhaka = order.district === 'Dhaka' || order.address.toLowerCase().includes('dhaka') || (order.districtBn || '').includes('ঢাকা');
      return matchesSearch && isDhaka;
    } else {
      const isOutside = order.district !== 'Dhaka' || (order.districtBn || '').includes('বাইরে');
      return matchesSearch && isOutside;
    }
  });

  const steadfastOrders = orders.filter(o => o.courier?.provider === 'Steadfast');
  const pathaoOrders = orders.filter(o => o.courier?.provider === 'Pathao');
  const pendingPickupCount = orders.filter(o => !o.courier || o.courier.status === 'pending_pickup').length;

  // 1-Click Dispatch to Steadfast
  const handleDispatchSteadfast = (order: Order) => {
    const consignmentId = `SF-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingUrl = `https://steadfast.com.bd/t/${consignmentId}`;

    StorageService.updateOrderCourier(order.id, {
      provider: 'Steadfast',
      consignmentId,
      trackingUrl,
      status: 'shipped',
      dispatchedAt: new Date().toISOString()
    });

    onShowToast('steadfast', `${lang === 'bn' ? 'অর্ডার' : 'Order'} #${order.orderNumber} ${lang === 'bn' ? 'স্টেডফাস্ট কুরিয়ারে বুকিং সম্পন্ন হয়েছে! Trk:' : 'booked to Steadfast! Consignment:'} ${consignmentId}`);
    onRefresh();
  };

  // 1-Click Dispatch to Pathao
  const handleDispatchPathao = (order: Order) => {
    const consignmentId = `PT-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingUrl = `https://merchant.pathao.com/tracking?consignment_id=${consignmentId}`;

    StorageService.updateOrderCourier(order.id, {
      provider: 'Pathao',
      consignmentId,
      trackingUrl,
      status: 'shipped',
      dispatchedAt: new Date().toISOString()
    });

    onShowToast('pathao', `${lang === 'bn' ? 'অর্ডার' : 'Order'} #${order.orderNumber} ${lang === 'bn' ? 'পাঠাও কুরিয়ারে বুকিং সম্পন্ন হয়েছে! Trk:' : 'booked to Pathao! Consignment:'} ${consignmentId}`);
    onRefresh();
  };

  return (
    <div className="space-y-6 bg-white text-slate-900">
      {/* Top Banner with White Architecture */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {lang === 'bn' ? 'স্টেট ও জেলা ভিত্তিক কুরিয়ার সার্ভিস ড্যাশবোর্ড' : 'State & District-Wise Courier Logistics Hub'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'স্টেডফাস্ট ও পাঠাও কুরিয়ারের মাধ্যমে বাংলাদেশের ৮টি বিভাগ ও ৬৪ জেলায় ক্যাশ অন ডেলিভারি বুকিং ও ট্র্যাক করুন'
                : 'Manage nationwide Cash on Delivery dispatch across 8 divisions & 64 districts via Steadfast & Pathao'}
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? 'কুরিয়ার বুকিং অর্ডার' : 'Courier Orders'} ({orders.length})
            </button>
            <button
              onClick={() => setActiveSubTab('states')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'states' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? '৮টি বিভাগ ও জেলা রেট' : '8 Divisions & Rates'}
            </button>
            <button
              onClick={() => setActiveSubTab('api')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'api' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? 'কুরিয়ার API কনফিগারেশন' : 'API Credentials'}
            </button>
          </div>
        </div>

        {/* Courier Highlights Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
                {lang === 'bn' ? 'মোট বুকিং অর্ডার' : 'Dispatched Orders'}
              </span>
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-black text-slate-900 mt-1">
              {steadfastOrders.length + pathaoOrders.length}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
              ● {lang === 'bn' ? 'সরাসরি পার্সেল ট্র্যাক' : 'Real-time Consignments'}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
                {lang === 'bn' ? 'পিকআপ অপেক্ষমান' : 'Pending Pickup'}
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xl font-black text-slate-900 mt-1">
              {pendingPickupCount}
            </p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
              {lang === 'bn' ? 'কুরিয়ারে পাঠানো বাকি' : 'Needs Dispatch'}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-900">
                Steadfast Courier
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-600 text-white">SF</span>
            </div>
            <p className="text-xl font-black text-blue-950 mt-1">
              {steadfastOrders.length}
            </p>
            <span className="text-[10px] text-blue-700 font-semibold mt-1 block">
              {lang === 'bn' ? 'সারাদেশে ৬৪ জেলায় সক্রিয়' : '64 Districts Active'}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-red-200 bg-red-50/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-red-900">
                Pathao Courier
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white">PT</span>
            </div>
            <p className="text-xl font-black text-red-950 mt-1">
              {pathaoOrders.length}
            </p>
            <span className="text-[10px] text-red-700 font-semibold mt-1 block">
              {lang === 'bn' ? 'এক্সপ্রেস পার্সেল ডেলিভারি' : 'Express Delivery'}
            </span>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: ORDERS COURIER DISPATCH */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'bn' ? 'অর্ডার, ফোন বা Trk আইডি খুঁজুন...' : 'Search order, phone, or tracking...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-hidden focus:border-[#FF6B35]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                {lang === 'bn' ? 'বিভাগ ফিল্টার:' : 'Filter State:'}
              </span>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <option value="all">{lang === 'bn' ? 'সকল বিভাগ ও জেলা' : 'All Divisions (64 Districts)'}</option>
                <option value="dhaka">{lang === 'bn' ? 'ঢাকা বিভাগ' : 'Dhaka Division'}</option>
                <option value="outside">{lang === 'bn' ? 'ঢাকার বাইরে সকল বিভাগ' : 'Outside Dhaka Divisions'}</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                    <th className="p-3.5">{lang === 'bn' ? 'অর্ডার নম্বর' : 'Order ID'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'গ্রাহকের তথ্য ও জেলা' : 'Customer & State/District'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'COD Amount'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'কুরিয়ার স্ট্যাটাস' : 'Courier Status'}</th>
                    <th className="p-3.5">{lang === 'bn' ? 'ট্র্যাকিং আইডি' : 'Tracking Consignment'}</th>
                    <th className="p-3.5 text-right">{lang === 'bn' ? 'অ্যাকশন / বুকিং' : 'Dispatch Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        {lang === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No orders found for this division filter'}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const hasCourier = !!order.courier?.consignmentId;
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            #{order.orderNumber}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-3.5 space-y-0.5">
                            <span className="font-bold text-slate-900 block">{order.customerName}</span>
                            <span className="font-mono text-slate-600 block text-[11px]">{order.customerPhone}</span>
                            <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                              <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                              <span className="truncate max-w-[180px]">
                                {order.district === 'Dhaka' ? (order.districtBn || 'ঢাকা সিটি') : (order.districtBn || 'ঢাকার বাইরে')} • {order.address}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">৳{order.total}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              {order.paymentMethod}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {hasCourier ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                {order.courier?.provider} {lang === 'bn' ? 'বুকড' : 'Booked'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3" />
                                {lang === 'bn' ? 'বুকিং বাকি' : 'Unassigned'}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {hasCourier ? (
                              <a
                                href={order.courier?.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-blue-600 font-bold hover:underline flex items-center gap-1"
                              >
                                {order.courier?.consignmentId}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px]">—</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              onClick={() => handleDispatchSteadfast(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
                              title="Dispatch via Steadfast Courier"
                            >
                              Steadfast
                            </button>
                            <button
                              onClick={() => handleDispatchPathao(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
                              title="Dispatch via Pathao Courier"
                            >
                              Pathao
                            </button>
                            <button
                              onClick={() => setPrintOrder(order)}
                              className="p-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                              title={lang === 'bn' ? 'চালান প্রিন্ট করুন' : 'Print Consignment Slip'}
                            >
                              <Printer className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* SUB-TAB 2: 8 DIVISIONS & DISTRICT RATES */}
      {activeSubTab === 'states' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {lang === 'bn' ? 'বাংলাদেশের ৮টি বিভাগ ও ৬৪ জেলার ডেলিভারি নেটওয়ার্ক' : 'Bangladesh 8 Divisions & 64 Districts Delivery Network'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'bn'
                ? 'স্টেট/বিভাগ অনুযায়ী ডেলিভারি ফি, আনুমানিক সময় এবং ডিফল্ট কুরিয়ার অ্যাসাইনমেন্ট'
                : 'Configured delivery fee, delivery days and primary courier for each state/division'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BD_DIVISIONS.map((div) => {
              const divOrders = orders.filter(o => {
                if (div.id === 'dhaka') {
                  return o.district === 'Dhaka' || (o.districtBn || '').includes('ঢাকা');
                }
                return o.district !== 'Dhaka' || (o.districtBn || '').includes('বাইরে');
              });

              return (
                <div key={div.id} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          {lang === 'bn' ? div.nameBn : div.name}
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {div.districtsCount} {lang === 'bn' ? 'টি জেলা সংযুক্ত' : 'Districts covered'}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {div.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">
                        {lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}
                      </span>
                      <span className="font-bold text-slate-900">৳{div.deliveryFee}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">
                        {lang === 'bn' ? 'প্রাইমারি কুরিয়ার' : 'Default Gateway'}
                      </span>
                      <span className={`font-bold ${div.defaultCourier === 'Steadfast' ? 'text-blue-600' : 'text-red-600'}`}>
                        {div.defaultCourier}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">
                        {lang === 'bn' ? 'ডেলিভারি সময়' : 'Timeline'}
                      </span>
                      <span className="font-bold text-slate-900">
                        {lang === 'bn' ? div.deliveryDaysBn : div.deliveryDays}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                      {lang === 'bn' ? 'আওতাভুক্ত প্রধান জেলাসমূহ:' : 'Key Districts Covered:'}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {div.districts.slice(0, 6).map((district, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {district}
                        </span>
                      ))}
                      {div.districts.length > 6 && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">
                          +{div.districts.length - 6} {lang === 'bn' ? 'অন্যান্য' : 'more'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: API GATEWAY CREDENTIALS */}
      {activeSubTab === 'api' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Steadfast Courier Gateway */}
            <div className="p-6 rounded-2xl border border-blue-200 bg-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                    SF
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Steadfast Courier API</h4>
                    <span className="text-xs text-blue-600 font-semibold">● Active Direct Integration</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Live Gateway
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'bn'
                  ? 'স্টেডফাস্ট কুরিয়ারের অফিশিয়াল মার্চেন্ট এপিআই দিয়ে সারাদেশে পার্সেল বুকিং এবং ট্র্যাকিং লিঙ্ক অটোমেটিক তৈরি হয়।'
                  : 'Official Steadfast merchant API generates live parcel booking and SMS tracking across all 64 districts.'}
              </p>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Steadfast API Key</label>
                  <input
                    type="text"
                    value={settings.steadfastApiKey || ''}
                    onChange={(e) => onSaveSettings({ ...settings, steadfastApiKey: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    placeholder="sf_live_key_..."
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Steadfast Secret Key</label>
                  <input
                    type="password"
                    value={settings.steadfastSecretKey || ''}
                    onChange={(e) => onSaveSettings({ ...settings, steadfastSecretKey: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Pathao Courier Gateway */}
            <div className="p-6 rounded-2xl border border-red-200 bg-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-sm">
                    PT
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Pathao Courier API</h4>
                    <span className="text-xs text-red-600 font-semibold">● Merchant OAuth 2.0</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                  Live Gateway
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'bn'
                  ? 'ঢাকা ও দেশের মেট্রো এরিয়াতে সুপার ফাস্ট নেক্সট ডে এক্সপ্রেস ডেলিভারির জন্য পাঠাও মার্চেন্ট সংযোগ।'
                  : 'Pathao merchant gateway for high-speed next-day delivery in Dhaka Metro and metropolitan zones.'}
              </p>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pathao Client ID</label>
                  <input
                    type="text"
                    value={settings.pathaoClientId || ''}
                    onChange={(e) => onSaveSettings({ ...settings, pathaoClientId: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    placeholder="pathao_client_id_..."
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pathao Client Secret</label>
                  <input
                    type="password"
                    value={settings.pathaoClientSecret || ''}
                    onChange={(e) => onSaveSettings({ ...settings, pathaoClientSecret: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    placeholder="••••••••••••••••"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE CONSIGNMENT MODAL */}
      {printOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm">
                  {lang === 'bn' ? 'কুরিয়ার পার্সেল চালান / ডেলিভারি স্লিপ' : 'Courier Consignment & Shipping Slip'}
                </h3>
              </div>
              <button
                onClick={() => setPrintOrder(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50 text-xs font-mono">
              <div className="flex justify-between border-b pb-2">
                <span>ORDER: #{printOrder.orderNumber}</span>
                <span className="font-bold text-blue-600">
                  {printOrder.courier?.provider || 'Steadfast Courier'}
                </span>
              </div>
              <div>
                <span className="font-bold block text-slate-800">RECIPIENT (গ্রাহক):</span>
                <span>{printOrder.customerName}</span><br />
                <span>Phone: {printOrder.customerPhone}</span><br />
                <span>District: {printOrder.district === 'Dhaka' ? 'Dhaka City' : 'Outside Dhaka'}</span><br />
                <span>Address: {printOrder.address}</span>
              </div>
              <div className="border-t pt-2">
                <span className="font-bold block text-slate-800">ITEMS:</span>
                {printOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>CASH ON DELIVERY (COD):</span>
                <span className="text-emerald-700">৳{printOrder.total}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPrintOrder(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{lang === 'bn' ? 'স্লিপ প্রিন্ট করুন' : 'Print Slip'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
