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

  const groupModulesBySemester = (modulesList) => {
    const groups = {};
    modulesList.forEach(m => {
      const code = m.moduleCode || '';
      const match = code.match(/^[A-Za-z]+(\d)/);
      const sem = match ? `Semester ${match[1]}` : 'Other Modules';
      if (!groups[sem]) groups[sem] = [];
      groups[sem].push(m);
    });
    const sortedKeys = Object.keys(groups).sort();
    const sortedGroups = {};
    sortedKeys.forEach(k => { sortedGroups[k] = groups[k]; });
    return sortedGroups;
  };

  const groupedModules = groupModulesBySemester(modules);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  if (loading) {
    return (
      <motion.div 
        initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
        className="flex flex-col h-screen bg-slate-50 text-slate-800"
      >
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
      className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-primary/30"
    >
      <Navbar />
      <main className="flex-1 pt-28 pb-8 px-8 lg:pt-32 lg:pb-12 lg:px-12 overflow-y-auto custom-scrollbar z-0">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <header>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
              Profile Details
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Manage your personal information and overview.</p>
          </header>

          <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
            
            {/* User Info Section */}
            <section className="mb-16">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
                <FaUserCircle className="text-primary text-2xl" /> User Information
              </h3>
              
              {user ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><FaUserCircle size={24} /></div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Full Name</p>
                      <p className="text-lg font-semibold text-slate-900">{user.fullName}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-600"><FaIdBadge size={24} /></div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Registration Number</p>
                      <p className="text-lg font-semibold text-slate-900">{user.registrationNumber}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600"><FaBookOpen size={24} /></div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Modules</p>
                      <p className="text-lg font-semibold text-slate-900">{modules.length}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600"><FaCalendarAlt size={24} /></div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Account Created</p>
                      <p className="text-lg font-semibold text-slate-900">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic font-medium">No user information available.</p>
              )}
            </section>

            {/* Modules Section */}
            <section>
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
                <FaBookOpen className="text-primary text-2xl" /> My Modules <span className="bg-slate-100 text-sm px-3 py-0.5 rounded-full text-slate-600 font-medium">{modules.length}</span>
              </h3>

              {modules.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 font-medium">No modules created yet. Start by adding your first module on the Home page!</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {Object.entries(groupedModules).map(([semester, sModules]) => (
                    <div key={semester} className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-6 rounded-full bg-primary inline-block"></span>
                        {semester} 
                        <span className="text-sm font-medium text-slate-500 ml-2">({sModules.length} module{sModules.length !== 1 ? 's' : ''})</span>
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {sModules.map((module) => (
                          <div 
                            key={module._id} 
                            className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-1"
                            onClick={() => handleModuleClick(module._id)}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{module.moduleName}</h4>
                                <span className="inline-block mt-2 text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase tracking-wider border border-slate-200">
                                  {module.moduleCode}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100">
                              <div className="flex flex-col gap-1 text-center">
                                <span className="text-xs text-slate-500 font-bold uppercase"><FaClipboardCheck className="inline mr-1" /> Att</span>
                                <span className="text-sm font-semibold text-slate-700">
                                  {module.attendedLectures || 0}/{module.conductedLectures || module.lectureHours || 0}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1 text-center border-l border-r border-slate-100">
                                <span className="text-xs text-slate-500 font-bold uppercase"><FaBookOpen className="inline mr-1" /> Asgn</span>
                                <span className="text-sm font-semibold text-slate-700">{module.assignments?.length || 0}</span>
                              </div>
                              <div className="flex flex-col gap-1 text-center">
                                <span className="text-xs text-slate-500 font-bold uppercase"><FaFlask className="inline mr-1" /> Labs</span>
                                <span className="text-sm font-semibold text-slate-700">{module.labs?.length || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
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