import React, { useState } from 'react';
import { Users, UserPlus, Shield, ShieldAlert, Key, Edit, Trash2, Check, X, Lock } from 'lucide-react';
import { AdminUser, AdminPermissions, Language } from '../../types';
import { StorageService } from '../../lib/storage';

interface AdminStaffProps {
  lang: Language;
  currentUser: AdminUser | null;
  onStaffUpdated: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminStaff: React.FC<AdminStaffProps> = ({
  lang,
  currentUser,
  onStaffUpdated,
  showToast
}) => {
  const [staffList, setStaffList] = useState<AdminUser[]>(() => StorageService.getAdminUsers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminUser | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'moderator'>('moderator');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [permissions, setPermissions] = useState<AdminPermissions>({
    dashboard: true,
    orders: true,
    products: true,
    categories: true,
    banners: true,
    couriers: false,
    payments: false,
    staff: false,
    settings: false
  });

  const refreshList = () => {
    const updated = StorageService.getAdminUsers();
    setStaffList(updated);
    onStaffUpdated();
  };

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setEmail('');
    setPassword('mod123');
    setRole('moderator');
    setStatus('active');
    setPermissions({
      dashboard: true,
      orders: true,
      products: true,
      categories: true,
      banners: true,
      couriers: false,
      payments: false,
      staff: false,
      settings: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingStaff(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password);
    setRole(user.role);
    setStatus(user.status);
    setPermissions(user.permissions || {
      dashboard: true,
      orders: true,
      products: true,
      categories: true,
      banners: true,
      couriers: false,
      payments: false,
      staff: false,
      settings: false
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (key: keyof AdminPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast(lang === 'bn' ? 'সকল প্রয়োজনীয় তথ্য পূরণ করুন' : 'Please fill all required fields', 'error');
      return;
    }

    // If role is admin, ensure full permissions
    const finalPermissions: AdminPermissions = role === 'admin' ? {
      dashboard: true,
      orders: true,
      products: true,
      categories: true,
      banners: true,
      couriers: true,
      payments: true,
      staff: true,
      settings: true
    } : permissions;

    const userToSave: AdminUser = {
      id: editingStaff ? editingStaff.id : `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role,
      status,
      permissions: finalPermissions,
      createdAt: editingStaff ? editingStaff.createdAt : new Date().toISOString().split('T')[0],
      lastLogin: editingStaff?.lastLogin
    };

    StorageService.saveAdminUser(userToSave);
    setIsModalOpen(false);
    refreshList();
    showToast(
      lang === 'bn'
        ? (editingStaff ? 'অ্যাকাউন্ট তথ্য আপডেট হয়েছে' : 'নতুন মডারেটর যুক্ত হয়েছে')
        : (editingStaff ? 'Account updated successfully' : 'New moderator account added'),
      'success'
    );
  };

  const handleDelete = (userId: string) => {
    const success = StorageService.deleteAdminUser(userId);
    if (success) {
      refreshList();
      showToast(lang === 'bn' ? 'অ্যাকাউন্ট মুছে ফেলা হয়েছে' : 'Account deleted', 'info');
    } else {
      showToast(lang === 'bn' ? 'প্রধান অ্যাডমিন অ্যাকাউন্ট ডিলিট করা যাবে না' : 'Cannot delete the master admin account', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span>{lang === 'bn' ? 'অ্যাডমিন ও মডারেটর ম্যানেজমেন্ট' : 'Admin & Staff Management'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn'
              ? 'মডারেটরদের অ্যাকাউন্ট তৈরি করুন এবং কার কী অনুমতি থাকবে (পণ্য, অর্ডার, ব্যানার) তা নিয়ন্ত্রণ করুন।'
              : 'Create moderator accounts and control role-based permissions (products, orders, banners, couriers).'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন মডারেটর যোগ করুন' : 'Add New Moderator'}</span>
        </button>
      </div>

      {/* Staff Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffList.map((user) => (
          <div
            key={user.id}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/90 flex flex-col justify-between gap-4 hover:border-slate-700 transition-all shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      user.role === 'admin'
                        ? 'bg-[#FF6B35]/20 text-[#FF8A50] border border-[#FF6B35]/40'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                    }`}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{user.name}</span>
                      {user.id === currentUser?.id && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-sm">You</span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      user.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ● {user.status}
                  </span>
                </div>
              </div>

              {/* Permissions Pills */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  {lang === 'bn' ? 'অনুমোদিত এক্সেস:' : 'Assigned Permissions:'}
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {Object.entries(user.permissions || {}).map(([key, val]) => (
                    <span
                      key={key}
                      className={`px-2 py-0.5 rounded-md font-medium capitalize ${
                        val
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-slate-950 text-slate-600 line-through'
                      }`}
                    >
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                {lang === 'bn' ? 'পাসওয়ার্ড:' : 'Pass:'} ••••
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(user)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'সম্পাদনা' : 'Edit'}</span>
                </button>

                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                    title="Delete user"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Moderator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>
                  {editingStaff
                    ? (lang === 'bn' ? 'মডারেটর অ্যাকাউন্ট সম্পাদনা' : 'Edit Staff Account')
                    : (lang === 'bn' ? 'নতুন মডারেটর যুক্ত করুন' : 'Add New Moderator')}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name / নাম *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arif Hossain"
                  className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Login Email or Username / লগইন ইমেইল *
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="moderator@nebulamart.com"
                  className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Login Password / লগইন পাসওয়ার্ড *
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="moderator">Moderator (Role-based)</option>
                    <option value="admin">Full Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="active">Active (সক্রিয়)</option>
                    <option value="inactive">Inactive (নিষ্ক্রিয়)</option>
                  </select>
                </div>
              </div>

              {/* Role Permissions Checkboxes (Only when role is moderator) */}
              {role === 'moderator' && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    {lang === 'bn' ? 'মডারেটরের কাজের অনুমতি (Permissions):' : 'Select Moderator Permissions:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(
                      [
                        ['products', 'Products Management (পণ্য)'],
                        ['orders', 'Orders Management (অর্ডার)'],
                        ['banners', 'Hero Banners (ব্যানার)'],
                        ['categories', 'Categories (ক্যাটাগরি)'],
                        ['couriers', 'Couriers & Dispatch (কুরিয়ার)'],
                        ['payments', 'Payment Settings (পেমেন্ট)']
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={permissions[key]}
                          onChange={() => handleTogglePermission(key)}
                          className="w-4 h-4 rounded-sm text-indigo-500 bg-slate-900 border-slate-700"
                        />
                        <span className="text-slate-200">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-lg hover:shadow-indigo-500/20"
                >
                  {editingStaff ? (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes') : (lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
