import React from 'react';
import { motion } from 'framer-motion';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/50 backdrop-blur-xs p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.12 }}
        className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl w-full max-w-sm shadow-xl"
      >
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">{title}</h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
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
