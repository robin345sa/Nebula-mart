import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AdminUser, Language } from '../../types';
import { StorageService } from '../../lib/storage';

interface AdminSecuritySettingsProps {
  lang: Language;
  currentUser: AdminUser | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onPasswordChanged?: () => void;
}

export const AdminSecuritySettings: React.FC<AdminSecuritySettingsProps> = ({
  lang,
  currentUser,
  showToast,
  onPasswordChanged
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg(lang === 'bn' ? 'বর্তমান পাসওয়ার্ড প্রদান করুন' : 'Current password is required');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg(lang === 'bn' ? 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' : 'New password must be at least 4 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(lang === 'bn' ? 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না' : 'New password and confirm password do not match');
      return;
    }

    if (!currentUser) {
      setErrorMsg('No authenticated admin session found');
      return;
    }

    setIsSubmitting(true);

    const result = StorageService.changeAdminPassword(currentUser.id, currentPassword, newPassword);

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(
        lang === 'bn'
          ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।'
          : 'Password changed successfully! Please use your new password for subsequent logins.'
      );
      showToast(lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড পরিবর্তিত হয়েছে' : 'Admin password successfully updated', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onPasswordChanged) onPasswordChanged();
    } else {
      setErrorMsg(result.error || (lang === 'bn' ? 'বর্তমান পাসওয়ার্ড সঠিক নয়' : 'Current password is incorrect'));
      showToast(result.error || 'Failed to update password', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন' : 'Admin Password & Security'}
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'আপনার বর্তমান অ্যাডমিন লগইন পাসওয়ার্ড পরিবর্তন করুন। নতুন পাসওয়ার্ড সিস্টেমে স্থায়ীভাবে সেভ থাকবে।'
                : 'Change your active admin password securely. The new password will persist for all future logins.'}
            </p>
          </div>
        </div>

        {/* Current Account Profile Strip */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{currentUser?.name || 'Administrator'}</p>
              <p className="text-[11px] font-mono text-slate-400">{currentUser?.email || 'admin@nebulamart.com'}</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF6B35]/20 text-[#FF8A50] border border-[#FF6B35]/30">
            {currentUser?.role || 'admin'}
          </span>
        </div>

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === 'bn' ? 'বর্তমান পাসওয়ার্ড *' : 'Current Password *'}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={lang === 'bn' ? 'বর্তমান পাসওয়ার্ড দিন' : 'Enter current password'}
                className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-[#FF6B35] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'bn' ? 'ডিফল্ট পাসওয়ার্ড: admin123' : 'Initial default: admin123'}
            </p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === 'bn' ? 'নতুন পাসওয়ার্ড *' : 'New Password *'}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={lang === 'bn' ? 'নতুন পাসওয়ার্ড দিন (কমপক্ষে ৪ অক্ষর)' : 'Enter new strong password'}
                className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-[#FF6B35] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm New Password *'}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={lang === 'bn' ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Re-enter new password'}
                className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-[#FF6B35] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-8 rounded-xl bg-[#FF6B35] hover:bg-[#E85924] text-white text-xs font-bold transition-all shadow-lg hover:shadow-orange-500/20 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{isSubmitting ? (lang === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...') : (lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change Password')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security Best Practices Notice */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'bn' ? 'নিরাপত্তা বিষয়ক তথ্য' : 'Security Notice'}</span>
        </div>
        <p>
          {lang === 'bn'
            ? 'পাসওয়ার্ড পরিবর্তনের পর তা অবিলম্বে ব্রাউজারের স্টোরেজে আপডেট হয়। যেকোনো সময় /about রাউটে গিয়ে আপনি নতুন পাসওয়ার্ড দিয়ে প্রবেশ করতে পারবেন।'
            : 'Upon updating, the credential is immediately recorded in application storage. You can access the portal anytime via the secure /about route using this new password.'}
        </p>
      </div>
    </div>
  );
};
