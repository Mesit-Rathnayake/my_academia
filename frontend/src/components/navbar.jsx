import React, { useState, useEffect } from 'react';
import { FaHome, FaComments, FaSignOutAlt, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { ThemeToggleButton, getUserAvatar } from '../utils/theme';
import { getCache } from '../utils/cache';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState(() => getUserAvatar(getCache('dashboard_user')));
  const user = getCache('dashboard_user');

  useEffect(() => {
    const syncAvatar = () => setAvatarUrl(getUserAvatar(getCache('dashboard_user')));
    window.addEventListener('ma-avatar-changed', syncAvatar);
    return () => window.removeEventListener('ma-avatar-changed', syncAvatar);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname.toLowerCase() === path.toLowerCase();
  };

  const NavItem = ({ icon: Icon, label, path, onClick, active }) => (
    <button 
      onClick={onClick ? onClick : () => navigate(path)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors duration-150 ${
        active 
          ? 'bg-blue-600 text-white font-semibold shadow-xs' 
          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium'
      }`}
    >
      <Icon size={12} className={active ? 'text-white' : 'text-zinc-500 dark:text-zinc-400'} />
      <span className="tracking-tight hidden sm:block">{label}</span>
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#fafaf9]/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/90 dark:border-zinc-800/90 flex items-center justify-between px-4 sm:px-8 z-50 transition-colors">
      {/* Brand - Left */}
      <div className="flex items-center gap-3">
        <div 
          onClick={() => navigate('/home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-mono text-xs font-bold tracking-tighter shadow-xs group-hover:bg-blue-700 transition-colors">
            MA
          </div>
          <div className="hidden md:flex items-baseline gap-2">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">My Academia</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 rounded px-1.5 py-0.5 bg-blue-50/80 dark:bg-blue-950/50 font-semibold">ENG</span>
          </div>
        </div>
      </div>

      {/* Navigation - Center */}
      <nav className="flex items-center justify-center gap-1 bg-zinc-100/90 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
        <NavItem icon={FaHome} label="Modules" path="/home" active={isActive('/home')} />
        <NavItem icon={FaChartLine} label="Transcript & GPA" path="/academic-performance" active={isActive('/academic-performance')} />
        <NavItem icon={FaCalendarAlt} label="Timetable" path="/schedule" active={isActive('/schedule')} />
        <NavItem icon={FaComments} label="Course AI" path="/chat" active={isActive('/chat')} />
      </nav>

      {/* Actions - Right */}
      <div className="flex items-center justify-end gap-2">
        <ThemeToggleButton />
        <NotificationDropdown />
        
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5 hidden sm:block"></div>
        
        <button 
          onClick={() => navigate('/profile')}
          className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border text-xs transition-colors ${
            isActive('/profile') 
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold' 
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 font-medium'
          }`}
        >
          <img 
            src={avatarUrl} 
            alt="Student Avatar" 
            className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 bg-blue-50 object-cover"
          />
          <span className="hidden sm:block max-w-[90px] truncate">{user?.firstName || 'Profile'}</span>
        </button>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center w-8 h-8 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
          title="Sign out"
        >
          <FaSignOutAlt size={13} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;
