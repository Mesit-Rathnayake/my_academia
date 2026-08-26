import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="w-full bg-white/70 backdrop-blur-xl border-b border-white/60 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <h1 
        className="text-2xl font-black tracking-tight text-slate-900 cursor-pointer"
        onClick={() => navigate('/')}
      >
        My <span className="text-primary">Academia</span>
      </h1>
      <div className="flex items-center gap-4">
        <button 
          className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
        <button 
          className="px-6 py-2 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-md transition-transform hover:-translate-y-0.5"
          onClick={() => navigate('/login')}
        >
          Log In
        </button>
      </div>
    </header>
  );
};

export default Header;