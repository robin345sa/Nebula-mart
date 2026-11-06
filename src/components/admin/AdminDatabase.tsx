import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Zap,
  Globe,
  Key,
  FileCode,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  Activity,
  Package,
  ShoppingBag,
  ExternalLink,
  Eye,
  EyeOff,
  CloudLightning,
  Sparkles
} from 'lucide-react';
import { Language, DatabaseConfig } from '../../types';
import { StorageService } from '../../lib/storage';
import { probeSupabaseConnection } from '../../lib/supabase';
import { testFirebaseConnection } from '../../lib/firebase';

interface AdminDatabaseProps {
  lang: Language;
  onRefreshAll: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDatabase: React.FC<AdminDatabaseProps> = ({
  lang,
  onRefreshAll,
  showToast
}) => {
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(() => StorageService.getDatabaseConfig());
  const [dbStats, setDbStats] = useState(() => StorageService.getDatabaseStats());
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState<'postgres' | 'mysql' | 'json' | null>(null);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'postgres' | 'mysql' | 'json'>('postgres');

  // Firebase Firestore State & Handlers
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseTestResult, setFirebaseTestResult] = useState<{ success: boolean; message: string; databaseId?: string } | null>(null);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);
  const [isFetchingFirebase, setIsFetchingFirebase] = useState(false);

  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    try {
      const res = await testFirebaseConnection();
      setFirebaseTestResult(res);
      showToast(res.message, res.success ? 'success' : 'error');
    } catch (err: any) {
      showToast(err?.message || 'Firebase connection test error', 'error');
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleSyncAllToFirebase = async () => {
    setIsSyncingFirebase(true);
    try {
      const res = await StorageService.syncAllToFirestore();
      refreshStats();
      showToast(res.message, res.success ? 'success' : 'error');
    } catch (err: any) {
      showToast(err?.message || 'Firebase sync failed', 'error');
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  const handleFetchAllFromFirebase = async () => {
    setIsFetchingFirebase(true);
    try {
      const res = await StorageService.fetchAllFromFirestore();
      refreshStats();
      onRefreshAll();
      showToast(res.message, res.success ? 'success' : 'error');
    } catch (err: any) {
      showToast(err?.message || 'Firebase fetch failed', 'error');
    } finally {
      setIsFetchingFirebase(false);
    }
  };

  const refreshStats = () => {
    setDbStats(StorageService.getDatabaseStats());
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveDatabaseConfig(dbConfig);
    refreshStats();
    showToast(
      lang === 'bn'
        ? 'ডাটাবেস ও স্টোরেজ কী কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে।'
        : 'Database and storage keys successfully saved.',
      'success'
    );
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await StorageService.testCloudConnection(dbConfig);
      setTestResult(result);
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'কানেকশন টেস্ট ব্যর্থ হয়েছে'
      });
      showToast('Connection test failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const result = await StorageService.syncToCloudDatabase(dbConfig);
      refreshStats();
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullData = async () => {
    setIsPulling(true);
    try {
      const result = await StorageService.fetchFromSupabaseAndHydrate();
      refreshStats();
      onRefreshAll();
      if (result.success) {
        showToast(result.message, 'success');
      } else {
        showToast(result.message, 'error');
      }
    } catch (e: any) {
      showToast(e?.message || 'Pull failed', 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const handleDownloadBackup = () => {
    try {
      StorageService.downloadDatabaseFile();
      refreshStats();
      showToast(
        lang === 'bn'
          ? 'সম্পূর্ণ ডাটাবেস ফাইল (.json) সফলভাবে ডাউনলোড হয়েছে। এই ফাইলটি আপনার লোকাল পিসিতে সেভ রাখুন।'
          : 'Database backup file (.json) downloaded successfully. Keep this file safe on your computer.',
        'success'
      );
    } catch {
      showToast('Failed to download database file', 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = StorageService.importDatabaseJson(content);
        if (res.success) {
          refreshStats();
          onRefreshAll();
          showToast(
            lang === 'bn'
              ? `ডাটাবেস সফলভাবে রিস্টোর হয়েছে! (${res.stats?.products || 0}টি প্রোডাক্ট, ${res.stats?.orders || 0}টি অর্ডার লোড করা হয়েছে)`
              : `Database successfully restored! Loaded ${res.stats?.products || 0} products and ${res.stats?.orders || 0} orders.`,
            'success'
          );
        } else {
          showToast(res.error || 'Invalid backup file', 'error');
        }
      } catch (err: any) {
        showToast(`Failed to parse file: ${err?.message}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyToClipboard = (text: string, type: 'postgres' | 'mysql' | 'json') => {
    navigator.clipboard.writeText(text);
    setCopiedSql(type);
    showToast(
      lang === 'bn' ? 'ক্লিপবোর্ডে কপি হয়েছে!' : 'Copied to clipboard!',
      'success'
    );
    setTimeout(() => setCopiedSql(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner: Status & Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#112A7E] via-[#0F1E4A] to-[#1E3A8A] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {dbConfig.storageMode === 'supabase'
                  ? (lang === 'bn' ? 'সুপাবেস PostgreSQL ক্লাউড ডাটাবেস মোড সক্রিয়' : 'Supabase PostgreSQL Cloud Mode Active')
                  : dbConfig.storageMode === 'hosting_cloud'
                  ? (lang === 'bn' ? 'কাস্টম হোস্টিং API মোড সক্রিয়' : 'Custom Hosting API Mode Active')
                  : (lang === 'bn' ? 'লোকাল পিসি হোস্ট ও IndexedDB ব্যাকআপ সক্রিয়' : 'Local PC Host & IndexedDB Backup Active')}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{lang === 'bn' ? 'মাঠ স্টোর • ডাটাবেস ও স্টোরেজ ইঞ্জিন' : 'Mart Store • Database & Storage Engine'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              {lang === 'bn'
                ? 'সুপাবেস PostgreSQL ডাটাবেস, অথেনটিকেশন ও স্টোরেজ সাপোর্ট। আপনি যেই ডোমেইন বা হোস্টিংয়েই সাইট হোস্ট করুন না কেন, সমস্ত প্রোডাক্ট, অর্ডার ও ইমেজ চিরস্থায়ীভাবে সংরক্ষিত থাকে।'
                : 'Supabase PostgreSQL database, Authentication, and Storage CDN support. Ensures zero data loss across any domain, hosting server, or local environment.'}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
            <button
              onClick={handleDownloadBackup}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#112A7E] font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-[#112A7E]" />
              <span>{lang === 'bn' ? 'ডাটাবেস ব্যাকআপ (.json)' : 'Download Backup (.json)'}</span>
            </button>

            <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 cursor-pointer border border-white/20 transition-all active:scale-95">
              <Upload className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ব্যাকআপ রিস্টোর' : 'Restore from File'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Firebase Firestore Realtime Cloud Sync Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-orange-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6B35] flex items-center justify-center shrink-0">
              <CloudLightning className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  {lang === 'bn' ? 'ফায়ারবেস ক্লাউড ডাটাবেস ও মাল্টি-ডিভাইস সিঙ্ক' : 'Firebase Firestore Cloud Database & Sync'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ● ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'bn'
                  ? 'গুগল এআই স্টুডিওতে হোস্ট করা অবস্থায় বা অন্য যেকোনো ফোনে/পিসিতে লাইভ ডাটা ও পিকচার স্বয়ংক্রিয়ভাবে সিঙ্ক থাকবে।'
                  : 'Automatic real-time cloud persistence for products, pictures, orders & coupons across all mobile & desktop devices.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isTestingFirebase}
              onClick={handleTestFirebase}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Activity className={`w-3.5 h-3.5 text-slate-600 ${isTestingFirebase ? 'animate-spin' : ''}`} />
              <span>{isTestingFirebase ? (lang === 'bn' ? 'টেস্ট চলছে...' : 'Testing...') : (lang === 'bn' ? 'কানেকশন টেস্ট' : 'Test Connection')}</span>
            </button>
          </div>
        </div>

        {firebaseTestResult && (
          <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            firebaseTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {firebaseTestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{firebaseTestResult.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Project ID</span>
            <span className="font-mono font-bold text-slate-800 text-xs">polynomial-battery-4smzh</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Firestore Database ID</span>
            <span className="font-mono font-bold text-slate-800 text-xs truncate block" title="ai-studio-nebulamart-de3bb993-9e5f-4f8c-8b45-5bccb0537fce">
              ai-studio-nebulamart-de3bb993
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sync Protocol</span>
            <span className="font-bold text-emerald-600 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time Multi-Device Sync
            </span>
          </div>
        </div>

        {/* Sync actions */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isSyncingFirebase}
            onClick={handleSyncAllToFirebase}
            className="px-4 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85924] text-white text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
          >
            <Cloud className={`w-4 h-4 ${isSyncingFirebase ? 'animate-bounce' : ''}`} />
            <span>{isSyncingFirebase ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (lang === 'bn' ? 'সবকিছু ক্লাউডে পুশ করুন (Push to Cloud)' : 'Push All Data to Cloud')}</span>
          </button>

          <button
            type="button"
            disabled={isFetchingFirebase}
            onClick={handleFetchAllFromFirebase}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingFirebase ? 'animate-spin' : ''}`} />
            <span>{isFetchingFirebase ? (lang === 'bn' ? 'লোড হচ্ছে...' : 'Fetching...') : (lang === 'bn' ? 'ক্লাউড থেকে ফ্রেশ ডেটা আনুন (Pull from Cloud)' : 'Fetch from Cloud')}</span>
          </button>
        </div>
      </div>

      {/* Live Database Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'মোট প্রোডাক্ট' : 'Total Products'}</span>
            <Package className="w-4 h-4 text-[#112A7E]" />
          </div>
          <div className="text-2xl font-black text-slate-900">{dbStats.totalProducts}</div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {dbStats.inStockProducts} {lang === 'bn' ? 'স্টকে আছে' : 'in stock'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{dbStats.totalOrders}</div>
          <span className="text-[11px] text-amber-600 font-medium">
            {dbStats.pendingOrders} {lang === 'bn' ? 'পেন্ডিং অর্ডার' : 'pending orders'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'মোট বিক্রয়' : 'Total Revenue'}</span>
            <Activity className="w-4 h-4 text-[#FF6B35]" />
          </div>
          <div className="text-2xl font-black text-[#FF6B35]">৳{dbStats.totalSales.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500 font-medium">
            {dbStats.totalCategories} {lang === 'bn' ? 'টি ক্যাটাগরি' : 'categories'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">{lang === 'bn' ? 'স্টোরেজ মোড' : 'Active Mode'}</span>
            <HardDrive className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm font-black text-slate-900 uppercase">
            {dbConfig.storageMode === 'supabase'
              ? 'Supabase Cloud'
              : dbConfig.storageMode === 'local_host'
              ? (lang === 'bn' ? 'লোকাল পিসি হোস্ট' : 'Local Host')
              : dbConfig.storageMode}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{lang === 'bn' ? 'অটো-সেভ সক্রিয়' : 'Auto-Save Protected'}</span>
          </span>
        </div>
      </div>

      {/* Database Mode & Storage Key Configuration */}
      <form onSubmit={handleSaveConfig} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-[#112A7E]" />
              <span>{lang === 'bn' ? 'ডাটাবেস ও স্টোরেজ কী কনফিগারেশন' : 'Database & Storage Key Configuration'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'bn'
                ? 'সুপাবেস (Supabase PostgreSQL + Storage) অথবা আপনার নিজস্ব হোস্টিং সার্ভার নির্বাচন করুন।'
                : 'Select Supabase PostgreSQL or your custom hosting server to configure connection keys.'}
            </p>
          </div>
        </div>

        {/* Storage Mode Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Supabase (Recommended) */}
          <label
            onClick={() => setDbConfig({ ...dbConfig, storageMode: 'supabase' })}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
              dbConfig.storageMode === 'supabase'
                ? 'border-[#112A7E] bg-blue-50/50 text-[#112A7E] ring-2 ring-[#112A7E]/10'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className={`w-5 h-5 ${dbConfig.storageMode === 'supabase' ? 'text-[#112A7E]' : 'text-slate-400'}`} />
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  {lang === 'bn' ? 'সুপারিশকৃত' : 'Recommended'}
                </span>
              </div>
              <input
                type="radio"
                name="storageMode"
                checked={dbConfig.storageMode === 'supabase'}
                onChange={() => setDbConfig({ ...dbConfig, storageMode: 'supabase' })}
                className="w-4 h-4 text-[#112A7E] accent-[#112A7E]"
              />
            </div>
            <div>
              <span className="font-bold text-xs block text-slate-900">
                {lang === 'bn' ? '১. সুপাবেস (Supabase Cloud)' : '1. Supabase PostgreSQL & Storage'}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                {lang === 'bn'
                  ? 'PostgreSQL ডাটাবেস, ইমেজ স্টোরেজ ও অটো-সিঙ্ক সাপোর্ট। চিরস্থায়ী ক্লাউড ব্যাকআপ।'
                  : 'PostgreSQL database, media storage bucket & real-time sync with zero data loss.'}
              </span>
            </div>
          </label>

          {/* 2. Local Host */}
          <label
            onClick={() => setDbConfig({ ...dbConfig, storageMode: 'local_host' })}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              dbConfig.storageMode === 'local_host'
                ? 'border-[#112A7E] bg-blue-50/40 text-[#112A7E]'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <HardDrive className={`w-5 h-5 ${dbConfig.storageMode === 'local_host' ? 'text-[#112A7E]' : 'text-slate-400'}`} />
              <input
                type="radio"
                name="storageMode"
                checked={dbConfig.storageMode === 'local_host'}
                onChange={() => setDbConfig({ ...dbConfig, storageMode: 'local_host' })}
                className="w-4 h-4 text-[#112A7E] accent-[#112A7E]"
              />
            </div>
            <div>
              <span className="font-bold text-xs block text-slate-900">
                {lang === 'bn' ? '২. লোকাল পিসি হোস্ট (Local Host)' : '2. Local PC Host'}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                {lang === 'bn'
                  ? 'লোকাল পিসির হোস্টে ডাটাবেস ও IndexedDB-তে সংরক্ষিত থাকে। কোনো এক্সটার্নাল কী লাগবে না।'
                  : 'Data persists automatically on local PC host and IndexedDB. Zero configuration required.'}
              </span>
            </div>
          </label>

          {/* 3. Custom Hosting */}
          <label
            onClick={() => setDbConfig({ ...dbConfig, storageMode: 'hosting_cloud' })}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
              dbConfig.storageMode === 'hosting_cloud'
                ? 'border-[#112A7E] bg-blue-50/40 text-[#112A7E]'
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Globe className={`w-5 h-5 ${dbConfig.storageMode === 'hosting_cloud' ? 'text-[#112A7E]' : 'text-slate-400'}`} />
              <input
                type="radio"
                name="storageMode"
                checked={dbConfig.storageMode === 'hosting_cloud'}
                onChange={() => setDbConfig({ ...dbConfig, storageMode: 'hosting_cloud' })}
                className="w-4 h-4 text-[#112A7E] accent-[#112A7E]"
              />
            </div>
            <div>
              <span className="font-bold text-xs block text-slate-900">
                {lang === 'bn' ? '৩. কাস্টম হোস্টিং / ডোমেইন API' : '3. Custom Hosting / Domain API'}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-1">
                {lang === 'bn'
                  ? 'যেকোনো cPanel হোস্টিং, VPS বা নিজস্ব ডোমেইনের ডাটাবেস API কী দিয়ে কানেক্ট করুন।'
                  : 'Connect to custom VPS or cPanel API endpoint for relational SQL backup.'}
              </span>
            </div>
          </label>
        </div>

        {/* Input fields for Supabase / Cloud Hosting Credentials */}
        {dbConfig.storageMode !== 'local_host' && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#112A7E]" />
                <span className="font-semibold text-slate-800">
                  {dbConfig.storageMode === 'supabase'
                    ? (lang === 'bn' ? 'সুপাবেস ড্যাশবোর্ড থেকে Project Settings > API এ গিয়ে কী সংগ্রহ করুন।' : 'Find your Project URL & anon key in Supabase Dashboard > Project Settings > API')
                    : (lang === 'bn' ? 'আপনার হোস্টিং কন্ট্রোল প্যানেল থেকে ডাটাবেস API কী সংগ্রহ করুন।' : 'Enter your hosting REST database URL and API key')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {dbConfig.storageMode === 'supabase'
                    ? (lang === 'bn' ? 'সুপাবেস Project URL' : 'Supabase Project URL')
                    : (lang === 'bn' ? 'হোস্টিং ডাটাবেস URL' : 'Hosting Database URL')} *
                </label>
                <input
                  type="url"
                  placeholder={
                    dbConfig.storageMode === 'supabase'
                      ? 'https://your-project-id.supabase.co'
                      : 'https://your-domain.com/api/database'
                  }
                  value={dbConfig.hostUrl || ''}
                  onChange={(e) => setDbConfig({ ...dbConfig, hostUrl: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-mono focus:border-[#112A7E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>
                    {dbConfig.storageMode === 'supabase'
                      ? (lang === 'bn' ? 'সুপাবেস Anon Public API Key' : 'Supabase Anon Public API Key')
                      : (lang === 'bn' ? 'স্টোরেজ API কী' : 'Storage API Key')} *
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showKey ? 'Hide' : 'Show'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder={
                      dbConfig.storageMode === 'supabase'
                        ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                        : 'your-storage-api-key'
                    }
                    value={dbConfig.apiKey || ''}
                    onChange={(e) => setDbConfig({ ...dbConfig, apiKey: e.target.value })}
                    className="w-full h-10 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 font-mono focus:border-[#112A7E] focus:outline-hidden"
                  />
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoSync"
                checked={dbConfig.autoSync}
                onChange={(e) => setDbConfig({ ...dbConfig, autoSync: e.target.checked })}
                className="w-4 h-4 rounded text-[#112A7E] accent-[#112A7E] cursor-pointer"
              />
              <label htmlFor="autoSync" className="text-xs text-slate-700 cursor-pointer font-medium">
                {lang === 'bn'
                  ? 'নতুন প্রোডাক্ট বা অর্ডার তৈরি হওয়ার সাথে সাথে ক্লাউড ডাটাবেসে রিয়েলটাইম সিঙ্ক করুন (Realtime Cloud Auto-Sync)'
                  : 'Automatically synchronize new products and orders to cloud database in real-time.'}
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#112A7E] hover:bg-[#0D2166] text-white font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95"
          >
            {lang === 'bn' ? 'কনফিগারেশন সেভ করুন' : 'Save Configuration'}
          </button>

          {dbConfig.storageMode !== 'local_host' && (
            <>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? (lang === 'bn' ? 'টেস্ট হচ্ছে...' : 'Testing...') : (lang === 'bn' ? 'কানেকশন টেস্ট করুন' : 'Test Connection')}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncData}
                disabled={isSyncing}
                className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                <CloudLightning className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isSyncing ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (lang === 'bn' ? 'ক্লাউডে সম্পূর্ণ ডাটা পুশ করুন' : 'Sync Local to Cloud')}</span>
              </button>

              <button
                type="button"
                onClick={handlePullData}
                disabled={isPulling}
                className="px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-blue-600" />
                <span>{isPulling ? (lang === 'bn' ? 'লোড হচ্ছে...' : 'Pulling...') : (lang === 'bn' ? 'ক্লাউড থেকে ডাটা পুল করুন' : 'Pull from Cloud')}</span>
              </button>
            </>
          )}

          {testResult && (
            <div className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
              <div>
                <span className="block font-bold">{testResult.message}</span>
                {testResult.details && (
                  <span className="text-[11px] opacity-80 block font-normal">{testResult.details}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </form>

      {/* SQL Migration Scripts Exporter */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#112A7E]" />
              <span>{lang === 'bn' ? 'পোস্টগ্রেস / সুপাবেস SQL টেবিল স্ক্রিপ্ট' : 'Supabase PostgreSQL Table Schema & DDL Script'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'bn'
                ? 'সুপাবেস SQL Editor-এ একবার চালিয়ে দিলে সমস্ত টেবিল, ইনডেক্স ও স্টোরেজ পলিসি স্বয়ংক্রিয়ভাবে তৈরি হবে।'
                : 'Execute this script in your Supabase SQL Editor to initialize all tables, indexes, and storage bucket policies.'}
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveSchemaTab('postgres')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSchemaTab === 'postgres' ? 'bg-white text-[#112A7E] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Supabase / PostgreSQL
            </button>
            <button
              onClick={() => setActiveSchemaTab('mysql')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSchemaTab === 'mysql' ? 'bg-white text-[#112A7E] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              cPanel MySQL (phpMyAdmin)
            </button>
            <button
              onClick={() => setActiveSchemaTab('json')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSchemaTab === 'json' ? 'bg-white text-[#112A7E] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live JSON Data
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute right-3 top-3 z-10">
            <button
              onClick={() => {
                if (activeSchemaTab === 'postgres') copyToClipboard(StorageService.getSupabaseSqlSchema(), 'postgres');
                else if (activeSchemaTab === 'mysql') copyToClipboard(StorageService.getMySQLSchema(), 'mysql');
                else copyToClipboard(StorageService.exportDatabaseJson(), 'json');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
            >
              {copiedSql === activeSchemaTab ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql === activeSchemaTab ? 'Copied!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono max-h-64 overflow-y-auto leading-relaxed border border-slate-800">
            {activeSchemaTab === 'postgres' && StorageService.getSupabaseSqlSchema()}
            {activeSchemaTab === 'mysql' && StorageService.getMySQLSchema()}
            {activeSchemaTab === 'json' && StorageService.exportDatabaseJson()}
          </pre>
        </div>
      </div>
    </div>
  );
};
