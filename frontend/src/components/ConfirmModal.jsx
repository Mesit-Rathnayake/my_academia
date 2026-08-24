import React from 'react';
import { motion } from 'framer-motion';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 p-6 rounded-3xl w-full max-w-md shadow-2xl"
      >
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20' 
                : 'bg-primary hover:bg-indigo-700 text-white shadow-primary/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ConfirmModal;
