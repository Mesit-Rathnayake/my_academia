import React from 'react';
import { FaHome, FaUser, FaComments, FaSignOutAlt, FaGraduationCap, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavItem = ({ icon: Icon, label, path, onClick, active }) => (
    <button 
      onClick={onClick ? onClick : () => navigate(path)}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-primary/10 text-primary font-bold' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm tracking-wide hidden lg:block">{label}</span>
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white/75 backdrop-blur-xl border-b border-white/60 flex items-center justify-between px-6 z-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      {/* Brand - Left */}
      <div className="flex items-center gap-3 w-1/4">
        <div className="bg-gradient-to-br from-primary to-secondary p-2.5 rounded-xl shadow-md shadow-primary/20 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/home')}>
          <FaGraduationCap size={24} className="text-white" />
        </div>
        <h1 
          className="text-2xl font-extrabold text-slate-800 tracking-tight hidden md:block cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate('/home')}
        >
          My Academia
        </h1>
      </div>

      {/* Navigation - Center */}
      <nav className="flex items-center justify-center gap-2 md:gap-4 flex-1">
        <NavItem icon={FaHome} label="Home" path="/home" active={isActive('/home')} />
        <NavItem icon={FaCalendarAlt} label="Schedule" path="/schedule" active={isActive('/schedule')} />
        <NavItem icon={FaChartLine} label="Performance" path="/academic-performance" active={isActive('/academic-performance')} />
        <NavItem icon={FaComments} label="AI Tutor" path="/chat" active={isActive('/chat')} />
      </nav>

      {/* Actions - Right */}
      <div className="flex items-center justify-end gap-4 w-1/4">
        
        <NotificationDropdown />
        
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        
        <button 
          onClick={() => navigate('/profile')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${isActive('/profile') ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium'}`}
        >
          <div className="bg-slate-100 p-1.5 rounded-full">
            <FaUser size={14} />
          </div>
          <span className="hidden sm:block text-sm">Profile</span>
        </button>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center w-10 h-10 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Logout"
        >
          <FaSignOutAlt size={18} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;