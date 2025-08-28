import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import '../styles/Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchUserModules();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserModules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/modules', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const modulesData = await response.json();
        setModules(modulesData);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (moduleId) => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div className="profile">
        <Sidebar />
        <div className="profile-content">
          <div className="loading">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <Sidebar />
      <div className="profile-content">
        <div className="profile-header">
          <h1>Profile Details</h1>
        </div>

        <div className="profile-card fade-in">
          <div className="user-info">
            <h2>User Information</h2>
            {user ? (
              <div className="user-details">
                <p><strong>Name:</strong> {user.fullName}</p>
                <p><strong>Registration Number:</strong> {user.registrationNumber}</p>
                <p><strong>Total Modules:</strong> {modules.length}</p>
                <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            ) : (
              <p className="no-modules">No user information available</p>
            )}
          </div>

          <div className="modules-section">
            <h2>My Modules ({modules.length})</h2>
            {modules.length === 0 ? (
              <p className="no-modules">No modules created yet. Start by adding your first module!</p>
            ) : (
              <div className="modules-list">
                {modules.map((module) => (
                  <div 
                    key={module._id} 
                    className="module-item fade-in"
                    onClick={() => handleModuleClick(module._id)}
                  >
                    <h3>{module.moduleName}</h3>
                    <p className="module-code">{module.moduleCode}</p>
                    <div className="module-stats">
                      <span>Attendance: {module.attendedHours}/{module.lectureHours}</span>
                      <span>Assignments: {module.assignments?.length || 0}</span>
                      <span>Labs: {module.labs?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;