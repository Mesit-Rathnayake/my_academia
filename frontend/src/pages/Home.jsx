import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import ModuleCard from '../components/ModuleCard';
import ModuleFormModal from '../components/ModuleFormModal';
import DashboardWidgets from '../components/DashboardWidgets';
import Footer from '../components/Footer';
import { FaPlus, FaBookReader } from 'react-icons/fa';
import { motion } from 'framer-motion';

function Home() {
  const [modules, setModules] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [examSeries, setExamSeries] = useState([]);
  const [gpaData, setGpaData] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModule, setEditModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [modulesRes, timeRes, seriesRes, gpaRes, userRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/modules`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiBaseUrl}/api/timetable`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiBaseUrl}/api/exam-series`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiBaseUrl}/api/gpa`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiBaseUrl}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (!modulesRes.ok) throw new Error('Failed to fetch modules');
      
      setModules(await modulesRes.json());
      
      if (timeRes.ok) setTimetable(await timeRes.json());
      if (seriesRes.ok) setExamSeries(await seriesRes.json());
      if (gpaRes.ok) setGpaData(await gpaRes.json());
      if (userRes.ok) setUser(await userRes.json());
      
    } catch (err) {
      setError(err.message);
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

      fetchModules();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      setError(null);
      
      if (!moduleId) {
        throw new Error('Module ID is undefined');
      }

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
      
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInlineUpdate = async (moduleId, field, value) => {
    try {
      const token = localStorage.getItem('token');
      const moduleToUpdate = modules.find(m => m._id === moduleId);
      
      if (!moduleToUpdate) {
        throw new Error('Module not found');
      }

      const updatedModule = { ...moduleToUpdate };

      if (field.startsWith('assignment:')) {
        const [_, index, prop] = field.split(':');
        const assignmentIndex = parseInt(index);
        
        if (!updatedModule.assignments) updatedModule.assignments = [];
        if (!updatedModule.assignments[assignmentIndex]) updatedModule.assignments[assignmentIndex] = {};
        
        updatedModule.assignments[assignmentIndex][prop] = 
          prop === 'marks' || prop === 'totalMarks' ? (value === '' ? null : Number(value)) : value;
      } else if (field.startsWith('lab:')) {
        const [_, index, prop] = field.split(':');
        const labIndex = parseInt(index);
        
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

      fetchModules();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="flex flex-col h-screen overflow-hidden text-slate-800 bg-slate-50"
      >
        <Navbar />
        <main className="flex-1 pt-20 p-8 overflow-y-auto custom-scrollbar flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </motion.div>
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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
      className="flex flex-col h-screen overflow-hidden text-slate-800 bg-slate-50"
    >
      <Navbar />
      
      <main className="flex-1 pt-28 pb-8 px-8 lg:pt-32 lg:pb-12 lg:px-12 overflow-y-auto custom-scrollbar relative z-0">
        
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">
                {getGreeting()}, {user?.firstName || 'Student'}!
              </h2>
              <p className="text-slate-500 mt-3 font-semibold text-lg">Here is your academic overview.</p>
            </div>
            <button onClick={openAddModal} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-md shadow-primary/20 hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <FaPlus size={18} /> Add Module
            </button>
          </header>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl flex justify-between items-center shadow-sm z-10 relative">
              <p className="font-bold">{error}</p>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold bg-red-100 px-4 py-2 rounded-xl transition-colors">Dismiss</button>
            </div>
          )}

          {/* Dashboard Summary Widgets */}
          <div className="relative z-10 w-full">
            <DashboardWidgets timetable={timetable} examSeries={examSeries} gpaData={gpaData} />
          </div>

          <div className="w-full">
            {/* Folder Tabs */}
            <div className="flex w-full px-2 sm:px-6 relative z-10 gap-2">
              {allSemesters.map(sem => {
                const isActive = currentTab === sem;
                return (
                  <button
                    key={sem}
                    onClick={() => setActiveTab(sem)}
                    className={`flex-1 py-3 sm:py-4 font-bold text-xs sm:text-sm md:text-base transition-all duration-300 rounded-t-xl ${
                      isActive 
                        ? 'bg-white text-primary border-b-2 border-primary shadow-sm z-20' 
                        : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 z-10'
                    }`}
                  >
                    <span className="hidden sm:inline">Semester </span>
                    <span className="sm:hidden">S</span>
                    {sem}
                  </button>
                );
              })}
            </div>

            {/* Folder Content Box */}
            <div className="bg-white rounded-b-3xl rounded-tr-3xl p-6 sm:p-10 shadow-sm border border-slate-200 relative z-0">
              {currentTab && (
                <section className="animate-fadeIn">
                  {!groupedModules[currentTab] || groupedModules[currentTab].length === 0 ? (
                    <div className="bg-slate-50 border-dashed border-2 border-slate-200 p-12 sm:p-16 rounded-3xl flex flex-col items-center justify-center text-center">
                      <div className="bg-primary/10 p-8 rounded-full text-primary mb-8 shadow-sm">
                        <FaBookReader size={56} />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 text-slate-900">No Modules Found</h3>
                      <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium text-base sm:text-lg leading-relaxed">
                        Get started by adding your first module to Semester {currentTab} to track attendance, assignments, and upload lecture notes.
                      </p>
                      <button onClick={openAddModal} className="bg-primary text-white px-8 sm:px-10 py-3 sm:py-4 rounded-2xl font-bold shadow-md shadow-primary/20 hover:bg-indigo-600 transition-all flex items-center gap-3">
                        <FaPlus /> Create Module
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
                </section>
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