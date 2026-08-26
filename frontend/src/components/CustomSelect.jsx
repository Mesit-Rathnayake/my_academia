import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

function CustomSelect({ value, onChange, options, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => 
    (typeof opt === 'object' ? opt.value : opt) === value
  ) || (options.length > 0 ? options[0] : null);

  let displayLabel = '';
  if (selectedOption) {
    displayLabel = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex min-h-11 w-full items-center justify-between text-left ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayLabel}</span>
        <FaChevronDown className={`transition-transform duration-200 text-slate-400 ml-2 ${isOpen ? 'rotate-180' : ''}`} size={12} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl custom-scrollbar"
          >
            {options.map((opt, idx) => {
              const optValue = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const isSelected = optValue === value;
              
              return (
                <button
                  type="button"
                  aria-pressed={isSelected}
                  key={idx}
                  className={`px-4 py-3 cursor-pointer transition-colors text-sm font-medium ${
                    isSelected 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    onChange(optValue);
                    setIsOpen(false);
                  }}
                >
                  {optLabel}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomSelect;
