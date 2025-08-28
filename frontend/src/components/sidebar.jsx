import React from 'react';
import { FaHome, FaPlus, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

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

  return (
    <div className="sidebar">
      <div 
        className={`nav-item ${isActive('/home') ? 'active' : ''}`}
        onClick={() => navigate('/home')}
      >
        <FaHome className="icon" />
        <div className="label">Home</div>
      </div>
      <div 
        className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <FaUser className="icon" />
        <div className="label">Profile</div>
      </div>
      
      <div className="nav-item" onClick={handleLogout}>
        <FaSignOutAlt className="icon" />
        <div className="label">Logout</div>
      </div>
    </div>
  );
}

export default Sidebar;