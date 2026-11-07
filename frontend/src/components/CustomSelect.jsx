import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

function CustomSelect({ value, onChange, options, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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
        className={`flex min-h-9 w-full items-center justify-between text-left ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayLabel}</span>
        <FaChevronDown className={`transition-transform duration-150 text-zinc-400 ml-2 shrink-0 ${isOpen ? 'rotate-180' : ''}`} size={10} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full overflow-hidden overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#16161a] shadow-lg py-1"
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
                  className={`w-full text-left px-3 py-2 cursor-pointer transition-colors text-xs block ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-semibold' 
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white font-medium'
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
