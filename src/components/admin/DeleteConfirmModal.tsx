import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Language } from '../../types';
import { t } from '../../lib/translations';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  itemType: 'product' | 'category';
  lang: Language;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  itemName,
  itemType,
  lang,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const strings = t[lang];

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white [#131B2E] rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 border border-red-200 flex items-center justify-center mx-auto text-red-600">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-base font-extrabold text-slate-900">
            {strings.deleteConfirmTitle}
          </h3>
          <p className="text-xs text-slate-600">
            {strings.deleteConfirmMessage}
          </p>
          <div className="p-2.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-800 truncate">
            {itemType === 'product' ? (lang === 'bn' ? 'পণ্য: ' : 'Product: ') : (lang === 'bn' ? 'ক্যাটাগরি: ' : 'Category: ')}
            <span className="text-red-600 font-semibold">{itemName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 :bg-slate-700 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {strings.cancelBtn}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>{strings.confirmDeleteBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
