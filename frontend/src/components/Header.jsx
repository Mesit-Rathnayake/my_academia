import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggleButton } from '../utils/theme';

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="w-full bg-[#fafaf9]/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/90 dark:border-zinc-800/90 h-14 px-6 md:px-12 flex justify-between items-center sticky top-0 z-40 transition-colors">
      <div 
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-mono text-xs font-bold tracking-tighter">
          MA
        </div>
        <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          My Academia
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <ThemeToggleButton />
        <button 
          className="px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
          onClick={() => navigate('/signup')}
        >
          Register
        </button>
        <button 
          className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          onClick={() => navigate('/login')}
        >
          Sign In
        </button>
      </div>
    </header>
  );
};

export default Header;
