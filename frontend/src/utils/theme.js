import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ma_theme');
    if (saved) return saved === 'dark';
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('ma_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('ma_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggleButton() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-amber-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? <FaSun size={13} className="text-amber-400" /> : <FaMoon size={12} />}
    </button>
  );
}

export const AVATAR_PRESETS = [
  { id: 'mesith', label: 'Engineer', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Mesith&backgroundColor=dbeafe' },
  { id: 'felix', label: 'Scholar', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=d1fae5' },
  { id: 'aneka', label: 'Researcher', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka&backgroundColor=fef3c7' },
  { id: 'leo', label: 'Architect', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Leo&backgroundColor=e0e7ff' },
  { id: 'maya', label: 'Analyst', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Maya&backgroundColor=fce7f3' },
  { id: 'orion', label: 'Builder', url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Orion&backgroundColor=f3e8ff' },
];

export function getUserAvatar(user) {
  const savedPreset = localStorage.getItem('ma_avatar_url');
  if (savedPreset) return savedPreset;
  const seed = user?.firstName || user?.registrationNumber || 'Mesith';
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=dbeafe`;
}

export function getDeptMeta(moduleCode = '') {
  const prefix = (moduleCode.match(/^[A-Za-z]+/) || [''])[0].toUpperCase();
  switch (prefix) {
    case 'EC':
      return {
        dept: 'Electrical & Information',
        borderTop: 'border-t-blue-600 dark:border-t-blue-500',
        codeBadge: 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/70',
        dot: 'bg-blue-500',
      };
    case 'EE':
      return {
        dept: 'Electrical Engineering',
        borderTop: 'border-t-amber-500 dark:border-t-amber-400',
        codeBadge: 'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
        dot: 'bg-amber-500',
      };
    case 'CE':
      return {
        dept: 'Civil & Environmental',
        borderTop: 'border-t-emerald-600 dark:border-t-emerald-500',
        codeBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
        dot: 'bg-emerald-500',
      };
    case 'ME':
      return {
        dept: 'Mechanical & Manufacturing',
        borderTop: 'border-t-rose-600 dark:border-t-rose-500',
        codeBadge: 'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70',
        dot: 'bg-rose-500',
      };
    case 'IS':
      return {
        dept: 'Interdisciplinary Studies',
        borderTop: 'border-t-violet-600 dark:border-t-violet-500',
        codeBadge: 'bg-violet-50 text-violet-800 border-violet-200/80 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/70',
        dot: 'bg-violet-500',
      };
    default:
      return {
        dept: 'General Engineering',
        borderTop: 'border-t-teal-600 dark:border-t-teal-500',
        codeBadge: 'bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/70',
        dot: 'bg-teal-500',
      };
  }
}

