import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { FaUserCircle, FaBookOpen, FaClipboardCheck, FaFlask, FaCalendarAlt, FaIdBadge } from 'react-icons/fa';
import { motion } from 'framer-motion';

function Profile() {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchUserData();
    fetchUserModules();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
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
      const response = await fetch(`${apiBaseUrl}/api/modules`, {
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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  if (loading) {
    return (
      <motion.div 
        initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
        className="flex flex-col h-screen bg-slate-900 text-slate-100"
      >
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
      className="flex flex-col h-screen overflow-hidden bg-slate-900 text-slate-100 font-sans selection:bg-rose-500/30"
    >
      <Navbar />
      <main className="flex-1 pt-28 pb-8 px-8 lg:pt-32 lg:pb-12 lg:px-12 overflow-y-auto custom-scrollbar z-0">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header>
            <h2 className="text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              Profile Details
            </h2>
            <p className="text-slate-400 mt-2">Manage your personal information and overview.</p>
          </header>

          <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-700/50 shadow-2xl relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
            
            {/* User Info Section */}
            <section className="mb-16">
              <h3 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-4">
                <FaUserCircle className="text-primary text-2xl" /> User Information
              </h3>
              
              {user ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-xl text-primary"><FaUserCircle size={24} /></div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Full Name</p>
                      <p className="text-lg font-semibold text-white">{user.fullName}</p>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                    <div className="p-3 bg-secondary/20 rounded-xl text-secondary"><FaIdBadge size={24} /></div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Registration Number</p>
                      <p className="text-lg font-semibold text-white">{user.registrationNumber}</p>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><FaBookOpen size={24} /></div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Modules</p>
                      <p className="text-lg font-semibold text-white">{modules.length}</p>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                    <div className="p-3 bg-accent/20 rounded-xl text-accent"><FaCalendarAlt size={24} /></div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Account Created</p>
                      <p className="text-lg font-semibold text-white">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 italic">No user information available.</p>
              )}
            </section>

            {/* Modules Section */}
            <section>
              <h3 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-3 border-b border-slate-700/50 pb-4">
                <FaBookOpen className="text-primary text-2xl" /> My Modules <span className="bg-slate-700 text-sm px-3 py-0.5 rounded-full text-slate-300">{modules.length}</span>
              </h3>

              {modules.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                  <p className="text-slate-400">No modules created yet. Start by adding your first module on the Home page!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {modules.map((module) => (
                    <div 
                      key={module._id} 
                      className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-700/50 hover:border-slate-600 transition-all cursor-pointer group shadow-lg"
                      onClick={() => handleModuleClick(module._id)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{module.moduleName}</h4>
                          <span className="inline-block mt-2 text-xs font-bold px-2 py-1 bg-slate-700 text-slate-300 rounded uppercase tracking-wider">
                            {module.moduleCode}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-700/50">
                        <div className="flex flex-col gap-1 text-center">
                          <span className="text-xs text-slate-400 font-bold uppercase"><FaClipboardCheck className="inline mr-1" /> Att</span>
                          <span className="text-sm font-semibold text-slate-200">
                            {module.attendedLectures || 0}/{module.conductedLectures || module.lectureHours || 0}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 text-center border-l border-r border-slate-700/50">
                          <span className="text-xs text-slate-400 font-bold uppercase"><FaBookOpen className="inline mr-1" /> Asgn</span>
                          <span className="text-sm font-semibold text-slate-200">{module.assignments?.length || 0}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-center">
                          <span className="text-xs text-slate-400 font-bold uppercase"><FaFlask className="inline mr-1" /> Labs</span>
                          <span className="text-sm font-semibold text-slate-200">{module.labs?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
        <Footer />
      </main>
    </motion.div>
  );
}

export default Profile;