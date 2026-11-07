import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { AVATAR_PRESETS, getUserAvatar, getDeptMeta } from '../utils/theme';

function Profile() {
  const [user, setUser] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('ma_avatar_url') || AVATAR_PRESETS[0].url);
  const navigate = useNavigate();
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchUserData();
    fetchUserModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleSelectAvatar = (url) => {
    setSelectedAvatar(url);
    localStorage.setItem('ma_avatar_url', url);
    window.dispatchEvent(new Event('ma-avatar-changed'));
  };

  const groupModulesBySemester = (modulesList) => {
    const groups = {};
    modulesList.forEach(m => {
      const sem = m.semester ? `Semester 0${m.semester}` : 'Unassigned';
      if (!groups[sem]) groups[sem] = [];
      groups[sem].push(m);
    });
    const sortedKeys = Object.keys(groups).sort();
    const sortedGroups = {};
    sortedKeys.forEach(k => { sortedGroups[k] = groups[k]; });
    return sortedGroups;
  };

  const groupedModules = groupModulesBySemester(modules);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-transparent text-zinc-900 dark:text-zinc-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <span className="font-mono text-xs text-zinc-500">Loading student record...</span>
        </main>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="flex flex-col h-screen overflow-hidden bg-transparent text-zinc-900 dark:text-zinc-100 font-sans"
    >
      <Navbar />
      <main className="flex-1 pt-20 pb-10 px-4 sm:px-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Student ID Card Banner */}
          {user && (
            <div className="bg-white dark:bg-[#121215] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="h-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 relative" />
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-6">
                  <div className="flex items-end gap-4">
                    <img 
                      src={getUserAvatar(user)} 
                      alt="Student Avatar" 
                      className="w-20 h-20 rounded-2xl border-4 border-white dark:border-[#121215] bg-blue-50 object-cover shadow-md"
                    />
                    <div className="pb-1">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold block">
                        University of Ruhuna · Faculty of Engineering
                      </span>
                      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {user.firstName} {user.lastName}
                      </h1>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/70 self-start sm:self-auto">
                    {user.registrationNumber}
                  </span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">Student Name</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">{user.firstName} {user.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">Registration No</span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">{user.registrationNumber}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">Registered Modules</span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{modules.length} Courses</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">Record Created</span>
                    <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 mt-1 block">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Avatar Picker */}
                <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block mb-3">
                    Choose Profile Avatar
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {AVATAR_PRESETS.map((preset) => {
                      const active = selectedAvatar === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectAvatar(preset.url)}
                          className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition-all ${
                            active
                              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 ring-2 ring-blue-500/20'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover" />
                          <span className={`text-xs font-medium ${active ? 'text-blue-700 dark:text-blue-300 font-semibold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                            {preset.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modules Directory by Semester */}
          <div className="space-y-5">
            {Object.entries(groupedModules).map(([semester, sModules]) => (
              <div key={semester} className="bg-white dark:bg-[#121215] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{semester}</span>
                  <span className="text-xs font-mono text-zinc-400">{sModules.length} modules</span>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {sModules.map((mod) => {
                    const grade = mod.moduleResults?.[mod.moduleResults.length - 1]?.grade;
                    const dept = getDeptMeta(mod.moduleCode);
                    return (
                      <div 
                        key={mod._id}
                        onClick={() => navigate('/home')}
                        className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border shrink-0 ${dept.codeBadge}`}>
                            {mod.moduleCode}
                          </span>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{mod.moduleName}</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 font-mono">
                          <span className="text-zinc-400 text-[11px]">
                            Att: {mod.attendedLectures || 0}/{mod.conductedLectures || 0}
                          </span>
                          {grade && (
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded w-9 text-center">
                              {grade}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </motion.div>
  );
}

export default Profile;
