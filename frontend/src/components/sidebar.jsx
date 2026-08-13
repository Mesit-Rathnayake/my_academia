import React from 'react';
import { FaHome, FaUser, FaComments, FaSignOutAlt, FaGraduationCap } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
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
      className={`w-full flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 ${
        active 
          ? 'bg-primary/20 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
    >
      <Icon size={24} className="mb-2" />
      <span className="text-xs font-semibold tracking-wide">{label}</span>
    </button>
  );

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900/60 backdrop-blur-xl border-r border-slate-700/50 flex flex-col items-center py-8 z-40 shadow-2xl">
      <div className="flex flex-col items-center mb-12">
        <div className="bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl shadow-lg shadow-primary/20 mb-4">
          <FaGraduationCap size={32} className="text-white" />
        </div>
        <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
          My Academia
        </h1>
      </div>

      <nav className="flex-1 w-full px-6 flex flex-col gap-4">
        <NavItem icon={FaHome} label="Home" path="/home" active={isActive('/home')} />
        <NavItem icon={FaComments} label="AI Tutor" path="/chat" active={isActive('/chat')} />
        <NavItem icon={FaUser} label="Profile" path="/profile" active={isActive('/profile')} />
      </nav>

      <div className="w-full px-6 mt-auto">
        <NavItem icon={FaSignOutAlt} label="Logout" onClick={handleLogout} />
      </div>
    </aside>
  );
}

export default Sidebar;