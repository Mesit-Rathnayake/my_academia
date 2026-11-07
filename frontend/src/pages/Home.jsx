import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import ModuleCard from '../components/ModuleCard';
import ModuleFormModal from '../components/ModuleFormModal';
import DashboardWidgets from '../components/DashboardWidgets';
import Footer from '../components/Footer';
import { FaPlus, FaBookReader } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { fetchWithCache, getCache } from '../utils/cache';
import { ModuleCardSkeleton, DashboardWidgetsSkeleton } from '../components/Skeleton';
import { getUserAvatar } from '../utils/theme';

function Home() {
  const [modules, setModules] = useState(() => getCache('dashboard_modules') || []);
  const [timetable, setTimetable] = useState(() => getCache('dashboard_timetable') || []);
  const [examSeries, setExamSeries] = useState(() => getCache('dashboard_exam_series') || []);
  const [gpaData, setGpaData] = useState(() => getCache('dashboard_gpa') || null);
  const [user, setUser] = useState(() => getCache('dashboard_user') || null);
  const [activeTab, setActiveTab] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModule, setEditModule] = useState(null);
  const [loading, setLoading] = useState(() => !getCache('dashboard_modules'));
  const [error, setError] = useState(null);
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      const [modulesData, timeData, seriesData, gpaResult, userData] = await Promise.all([
        fetchWithCache(`${apiBaseUrl}/api/modules`, { headers }, { cacheKey: 'dashboard_modules' }),
        fetchWithCache(`${apiBaseUrl}/api/timetable`, { headers }, { cacheKey: 'dashboard_timetable' }).catch(() => []),
        fetchWithCache(`${apiBaseUrl}/api/exam-series`, { headers }, { cacheKey: 'dashboard_exam_series' }).catch(() => []),
        fetchWithCache(`${apiBaseUrl}/api/gpa`, { headers }, { cacheKey: 'dashboard_gpa' }).catch(() => null),
        fetchWithCache(`${apiBaseUrl}/api/auth/me`, { headers }, { cacheKey: 'dashboard_user' }).catch(() => null),
      ]);

      if (modulesData) setModules(modulesData);
      if (timeData) setTimetable(timeData);
      if (seriesData) setExamSeries(seriesData);
      if (gpaResult) setGpaData(gpaResult);
      if (userData) setUser(userData);

    } catch (err) {
      if (modules.length === 0) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditModule(null);
    setIsModalOpen(true);
  };

  const openEditModal = (module) => {
    setEditModule(module);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveModule = async (moduleData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      const url = editModule 
        ? `${apiBaseUrl}/api/modules/${editModule._id}`
        : `${apiBaseUrl}/api/modules`;
      
      const method = editModule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(moduleData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save module');
      }

      fetchDashboardData();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      setError(null);
      if (!moduleId) throw new Error('Module ID is undefined');

      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/modules/${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete module');
      }

      setModules(prev => prev.filter(module => module._id !== moduleId));
      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInlineUpdate = async (moduleId, field, value) => {
    if (field === 'refresh') {
      fetchDashboardData();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const moduleToUpdate = modules.find(m => (m._id || m.id) === moduleId);
      
      if (!moduleToUpdate) {
        throw new Error('Module not found');
      }

      const updatedModule = { ...moduleToUpdate };

      if (field.startsWith('assignment:')) {
        const [, index, prop] = field.split(':');
        const assignmentIndex = parseInt(index, 10);
        if (!updatedModule.assignments) updatedModule.assignments = [];
        if (!updatedModule.assignments[assignmentIndex]) updatedModule.assignments[assignmentIndex] = {};
        updatedModule.assignments[assignmentIndex][prop] = 
          prop === 'marks' || prop === 'totalMarks' ? (value === '' ? null : Number(value)) : value;
      } else if (field.startsWith('lab:')) {
        const [, index, prop] = field.split(':');
        const labIndex = parseInt(index, 10);
        if (!updatedModule.labs) updatedModule.labs = [];
        if (!updatedModule.labs[labIndex]) updatedModule.labs[labIndex] = {};
        updatedModule.labs[labIndex][prop] = value;
      } else if (field === 'attendedLectures' || field === 'conductedLectures') {
        updatedModule[field] = value;
      }

      const response = await fetch(`${apiBaseUrl}/api/modules/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedModule)
      });

      if (!response.ok) {
        throw new Error('Failed to update module');
      }

      fetchDashboardData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && modules.length === 0) {
    return (
      <div className="flex flex-col h-screen overflow-hidden text-zinc-900 dark:text-zinc-100 bg-transparent">
        <Navbar />
        <main className="flex-1 pt-20 p-6 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <DashboardWidgetsSkeleton />
            <div className="skeleton-module-grid mt-6">
              <ModuleCardSkeleton />
              <ModuleCardSkeleton />
              <ModuleCardSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const groupedModules = modules.reduce((acc, module) => {
    const sem = module.semester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(module);
    return acc;
  }, {});

  const allSemesters = [1, 2, 3, 4, 5, 6, 7, 8];
  
  const currentTab = activeTab && allSemesters.includes(Number(activeTab)) 
    ? Number(activeTab) 
    : 1;

  const currentSemSgpa = gpaData?.sgpas?.[currentTab];

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="flex flex-col h-screen overflow-hidden text-zinc-900 dark:text-zinc-100 bg-transparent"
    >
      <Navbar />
      
      <main className="flex-1 pt-20 pb-10 px-4 sm:px-8 overflow-y-auto relative z-0">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Workspace Header with Student Avatar */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200/90 dark:border-zinc-800/90">
            <div className="flex items-center gap-4">
              <img 
                src={getUserAvatar(user)} 
                alt="Student Avatar" 
                className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-blue-50 object-cover shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Faculty of Engineering</span>
                  <span>·</span>
                  <span>{user?.registrationNumber || 'Student Record'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {user ? `${user.firstName} ${user.lastName}` : 'Academic Overview'}
                </h1>
              </div>
            </div>
            <button 
              onClick={openAddModal} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto shadow-xs"
            >
              <FaPlus size={11} /> New Module
            </button>
          </header>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-xs font-medium flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 hover:underline font-semibold ml-4">Dismiss</button>
            </div>
          )}

          {/* Summary KPI Row */}
          <DashboardWidgets timetable={timetable} examSeries={examSeries} gpaData={gpaData} />

          {/* Modules Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Segmented Semester Bar */}
              <div className="flex items-center gap-1 bg-zinc-100/90 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/80 dark:border-zinc-800 overflow-x-auto">
                {allSemesters.map(sem => {
                  const isActive = currentTab === sem;
                  const count = groupedModules[sem]?.length || 0;
                  return (
                    <button
                      key={sem}
                      onClick={() => setActiveTab(sem)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 ${
                        isActive 
                          ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs border border-zinc-200/60 dark:border-zinc-700' 
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      <span>Sem {sem}</span>
                      {count > 0 && (
                        <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Semester Quick Stats */}
              {currentSemSgpa && currentSemSgpa.credits > 0 && (
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 dark:text-zinc-300 bg-white dark:bg-[#121215] px-3.5 py-2 rounded-lg border border-zinc-200/90 dark:border-zinc-800/90 self-start md:self-auto">
                  <span>
                    Semester {currentTab} SGPA: <strong className="text-blue-600 dark:text-blue-400 font-bold">{currentSemSgpa.sgpa !== null ? currentSemSgpa.sgpa.toFixed(2) : '—'}</strong>
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <span>
                    Credits: <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{currentSemSgpa.credits}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Modules Grid */}
            <div>
              {!groupedModules[currentTab] || groupedModules[currentTab].length === 0 ? (
                <div className="bg-white dark:bg-[#121215] border border-dashed border-zinc-300 dark:border-zinc-800 p-12 rounded-xl flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-200 dark:border-blue-800/60">
                    <FaBookReader size={16} />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No modules registered for Semester {currentTab}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-xs mb-5">
                    Add a course module to track attendance, coursework, grades, and lecture PDFs.
                  </p>
                  <button 
                    onClick={openAddModal} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
                  >
                    <FaPlus size={10} /> Add Semester {currentTab} Module
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedModules[currentTab].map((module, index) => (
                    <ModuleCard
                      key={module._id}
                      module={module}
                      index={index}
                      onOpenEdit={() => openEditModal(module)}
                      onInlineUpdate={(field, value) => handleInlineUpdate(module._id, field, value)}
                      onDelete={(moduleId) => handleDeleteModule(moduleId)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </main>

      {isModalOpen && (
        <ModuleFormModal
          onClose={closeModal}
          onSubmit={handleSaveModule}
          initialData={editModule}
        />
      )}
    </motion.div>
  );
}

export default Home;
