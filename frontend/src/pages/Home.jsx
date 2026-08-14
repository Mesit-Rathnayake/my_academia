import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import ModuleCard from '../components/ModuleCard';
import ModuleFormModal from '../components/ModuleFormModal';
import { FaPlus, FaBookReader } from 'react-icons/fa';

function Home() {
  const [modules, setModules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModule, setEditModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/modules`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      
      const data = await response.json();
      setModules(data);
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
      <div className="flex flex-col h-screen overflow-hidden text-slate-100 bg-slate-900">
        <Navbar />
        <main className="flex-1 pt-20 p-8 overflow-y-auto custom-scrollbar flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-100 bg-slate-900">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-8 px-8 lg:pt-32 lg:pb-12 lg:px-12 overflow-y-auto custom-scrollbar relative z-0">
        {/* Vibrant Multi-Color Background Blobs */}
        <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-1/4 left-10 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-[700px] h-[700px] bg-violet-500/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
            <div>
              <h2 className="text-3xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-rose-300 to-fuchsia-400 drop-shadow-lg tracking-tight">
                Dashboard
              </h2>
              <p className="text-slate-300 mt-3 font-semibold text-lg">Manage your academic progress and modules.</p>
            </div>
            <button onClick={openAddModal} className="bg-gradient-to-br from-rose-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-rose-500/30 hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-rose-400/50">
              <FaPlus size={18} /> Add Module
            </button>
          </header>

          {error && (
            <div className="bg-red-900/30 backdrop-blur-sm border-2 border-red-500/50 text-red-100 px-6 py-4 rounded-2xl flex justify-between items-center shadow-lg shadow-red-500/20">
              <p className="font-bold">{error}</p>
              <button onClick={() => setError(null)} className="text-red-300 hover:text-white font-bold bg-red-500/20 px-4 py-2 rounded-xl transition-colors">Dismiss</button>
            </div>
          )}

          {modules.length === 0 ? (
            <div className="bg-slate-800/40 backdrop-blur-md p-16 rounded-3xl flex flex-col items-center justify-center text-center mt-12 border-dashed border-2 border-slate-600/50 shadow-2xl">
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-8 rounded-full text-emerald-400 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500/20">
                <FaBookReader size={56} className="drop-shadow-lg" />
              </div>
              <h3 className="text-3xl font-extrabold mb-4 text-white drop-shadow-md">No Modules Found</h3>
              <p className="text-slate-300 max-w-md mx-auto mb-10 font-medium text-lg leading-relaxed">
                Get started by adding your first module to track attendance, assignments, and upload lecture notes.
              </p>
              <button onClick={openAddModal} className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-emerald-400/50">
                <FaPlus /> Create Module
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {modules.map((module, index) => (
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
      </main>

      {isModalOpen && (
        <ModuleFormModal
          onClose={closeModal}
          onSubmit={handleSaveModule}
          initialData={editModule}
        />
      )}
    </div>
  );
}

export default Home;