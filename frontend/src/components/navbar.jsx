import React from 'react';
import { FaHome, FaUser, FaComments, FaSignOutAlt, FaGraduationCap, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

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
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-primary/20 text-primary shadow-sm shadow-primary/10' 
          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
      }`}
    >
      <Icon size={18} />
      <span className="text-sm font-bold tracking-wide hidden sm:block">{label}</span>
    </button>
  );

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-6 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-primary to-secondary p-2.5 rounded-xl shadow-lg shadow-primary/20 cursor-pointer" onClick={() => navigate('/home')}>
          <FaGraduationCap size={24} className="text-white" />
        </div>
        <h1 
          className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight hidden md:block cursor-pointer"
          onClick={() => navigate('/home')}
        >
          My Academia
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-2 md:gap-4">
        <NavItem icon={FaHome} label="Home" path="/home" active={isActive('/home')} />
        <NavItem icon={FaCalendarAlt} label="Schedule" path="/schedule" active={isActive('/schedule')} />
        <NavItem icon={FaChartLine} label="Performance" path="/academic-performance" active={isActive('/academic-performance')} />
        <NavItem icon={FaComments} label="AI Tutor" path="/chat" active={isActive('/chat')} />
        <NavItem icon={FaUser} label="Profile" path="/profile" active={isActive('/profile')} />
      </nav>

      {/* Logout */}
      <div className="flex items-center">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-bold text-sm"
        >
          <FaSignOutAlt size={18} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;