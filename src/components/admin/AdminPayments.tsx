import React, { useState } from 'react';
import { CreditCard, Smartphone, Banknote, Save, CheckCircle2 } from 'lucide-react';
import { PaymentSettings, PaymentMethodConfig, Language } from '../../types';
import { StorageService } from '../../lib/storage';

interface AdminPaymentsProps {
  lang: Language;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminPayments: React.FC<AdminPaymentsProps> = ({
  lang,
  showToast
}) => {
  const currentSettings = StorageService.getPaymentSettings();

  const [codEnabled, setCodEnabled] = useState(currentSettings.cod?.enabled ?? true);
  const [codInstructions, setCodInstructions] = useState(currentSettings.cod?.instructions || 'Pay with cash upon delivery.');
  const [codInstructionsBn, setCodInstructionsBn] = useState(currentSettings.cod?.instructionsBn || 'পণ্য হাতে পেয়ে ক্যাশ টাকা পরিশোধ করুন।');

  const [bkashEnabled, setBkashEnabled] = useState(currentSettings.bkash?.enabled ?? true);
  const [bkashNumber, setBkashNumber] = useState(currentSettings.bkash?.accountNumber || '018XXXXXXXX');
  const [bkashType, setBkashType] = useState<'Merchant' | 'Personal' | 'Agent'>(currentSettings.bkash?.accountType || 'Merchant');
  const [bkashInstructions, setBkashInstructions] = useState(currentSettings.bkash?.instructions || 'Make Payment to this number and enter TrxID.');
  const [bkashInstructionsBn, setBkashInstructionsBn] = useState(currentSettings.bkash?.instructionsBn || 'উক্ত নম্বরে পেমেন্ট করে TrxID প্রদান করুন।');

  const [nagadEnabled, setNagadEnabled] = useState(currentSettings.nagad?.enabled ?? true);
  const [nagadNumber, setNagadNumber] = useState(currentSettings.nagad?.accountNumber || '017XXXXXXXX');
  const [nagadType, setNagadType] = useState<'Merchant' | 'Personal' | 'Agent'>(currentSettings.nagad?.accountType || 'Merchant');
  const [nagadInstructions, setNagadInstructions] = useState(currentSettings.nagad?.instructions || 'Make payment to this number and enter TrxID.');
  const [nagadInstructionsBn, setNagadInstructionsBn] = useState(currentSettings.nagad?.instructionsBn || 'উক্ত নগদ নম্বরে পেমেন্ট করে TrxID প্রদান করুন।');

  const [rocketEnabled, setRocketEnabled] = useState(currentSettings.rocket?.enabled ?? true);
  const [rocketNumber, setRocketNumber] = useState(currentSettings.rocket?.accountNumber || '019XXXXXXXX');
  const [rocketType, setRocketType] = useState<'Merchant' | 'Personal' | 'Agent'>(currentSettings.rocket?.accountType || 'Merchant');
  const [rocketInstructions, setRocketInstructions] = useState(currentSettings.rocket?.instructions || 'Send money to this Rocket number.');
  const [rocketInstructionsBn, setRocketInstructionsBn] = useState(currentSettings.rocket?.instructionsBn || 'উক্ত রকেট নম্বরে পেমেন্ট করে TrxID প্রদান করুন।');

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedPaymentSettings: PaymentSettings = {
      cod: {
        enabled: codEnabled,
        instructions: codInstructions,
        instructionsBn: codInstructionsBn
      },
      bkash: {
        enabled: bkashEnabled,
        accountNumber: bkashNumber.trim(),
        accountType: bkashType,
        instructions: bkashInstructions,
        instructionsBn: bkashInstructionsBn
      },
      nagad: {
        enabled: nagadEnabled,
        accountNumber: nagadNumber.trim(),
        accountType: nagadType,
        instructions: nagadInstructions,
        instructionsBn: nagadInstructionsBn
      },
      rocket: {
        enabled: rocketEnabled,
        accountNumber: rocketNumber.trim(),
        accountType: rocketType,
        instructions: rocketInstructions,
        instructionsBn: rocketInstructionsBn
      }
    };

    StorageService.savePaymentSettings(updatedPaymentSettings);
    showToast(lang === 'bn' ? 'পেমেন্ট সেটিংস সফলভাবে সংরক্ষিত হয়েছে' : 'Payment settings saved successfully', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <span>{lang === 'bn' ? 'পেমেন্ট গেটওয়ে সেটিংস' : 'Payment Methods & Gateways'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn'
              ? 'ক্যাশ অন ডেলিভারি, বিকাশ, নগদ ও রকেট পেমেন্ট মেথড সক্রিয় বা নিষ্ক্রিয় করুন এবং মার্চেন্ট নাম্বার আপডেট করুন।'
              : 'Configure Cash on Delivery, bKash, Nagad, and Rocket merchant numbers and checkout instructions.'}
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{lang === 'bn' ? 'সব পরিবর্তন সংরক্ষণ করুন' : 'Save All Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cash on Delivery */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cash on Delivery (ক্যাশ অন ডেলিভারি)</h3>
                <p className="text-[11px] text-slate-400">Pay cash upon package arrival</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Instructions (বাংলা)</label>
            <input
              type="text"
              value={codInstructionsBn}
              onChange={(e) => setCodInstructionsBn(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>
        </div>

        {/* bKash */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E2136E]/20 border border-[#E2136E]/40 flex items-center justify-center text-[#E2136E] font-black text-sm">
                bK
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">bKash (বিকাশ)</h3>
                <p className="text-[11px] text-slate-400">Direct mobile financial payment</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={bkashEnabled}
                onChange={(e) => setBkashEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E2136E]"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">bKash Number</label>
              <input
                type="text"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Type</label>
              <select
                value={bkashType}
                onChange={(e: any) => setBkashType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="Merchant">Merchant (মার্চেন্ট)</option>
                <option value="Personal">Personal (পার্সোনাল)</option>
                <option value="Agent">Agent (এজেন্ট)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Instructions (বাংলা)</label>
            <input
              type="text"
              value={bkashInstructionsBn}
              onChange={(e) => setBkashInstructionsBn(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>
        </div>

        {/* Nagad */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F7941D]/20 border border-[#F7941D]/40 flex items-center justify-center text-[#F7941D] font-black text-sm">
                ন
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Nagad (নগদ)</h3>
                <p className="text-[11px] text-slate-400">Postal financial service</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={nagadEnabled}
                onChange={(e) => setNagadEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F7941D]"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nagad Number</label>
              <input
                type="text"
                value={nagadNumber}
                onChange={(e) => setNagadNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Type</label>
              <select
                value={nagadType}
                onChange={(e: any) => setNagadType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="Merchant">Merchant (মার্চেন্ট)</option>
                <option value="Personal">Personal (পার্সোনাল)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Instructions (বাংলা)</label>
            <input
              type="text"
              value={nagadInstructionsBn}
              onChange={(e) => setNagadInstructionsBn(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>
        </div>

        {/* Rocket */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black text-sm">
                Rk
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Rocket (রকেট - DBBL)</h3>
                <p className="text-[11px] text-slate-400">Dutch-Bangla Mobile Banking</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rocketEnabled}
                onChange={(e) => setRocketEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rocket Number</label>
              <input
                type="text"
                value={rocketNumber}
                onChange={(e) => setRocketNumber(e.target.value)}
                placeholder="01XXXXXXXXX-X"
                className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Type</label>
              <select
                value={rocketType}
                onChange={(e: any) => setRocketType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="Merchant">Merchant (মার্চেন্ট)</option>
                <option value="Personal">Personal (পার্সোনাল)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Instructions (বাংলা)</label>
            <input
              type="text"
              value={rocketInstructionsBn}
              onChange={(e) => setRocketInstructionsBn(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
