import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
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
      <div className="flex h-screen overflow-hidden text-slate-100">
        <Sidebar />
        <main className="flex-1 p-8 ml-64 overflow-y-auto custom-scrollbar flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-slate-100">
      <Sidebar />
      
      <main className="flex-1 p-8 lg:p-12 ml-64 overflow-y-auto custom-scrollbar relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-10">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-800/30 p-6 rounded-3xl border border-slate-700/50 shadow-lg">
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 drop-shadow-md">
                Dashboard
              </h2>
              <p className="text-slate-400 mt-2 font-medium">Manage your academic progress and modules.</p>
            </div>
            <button onClick={openAddModal} className="glass-button px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 border border-slate-600/50 flex items-center gap-2">
              <FaPlus /> Add Module
            </button>
          </header>

          {error && (
            <div className="bg-red-900/30 border-2 border-red-500/50 text-red-200 px-6 py-4 rounded-xl flex justify-between items-center shadow-lg shadow-red-500/10">
              <p className="font-semibold">{error}</p>
              <button onClick={() => setError(null)} className="text-red-300 hover:text-white font-bold bg-red-500/20 px-3 py-1 rounded-lg">Dismiss</button>
            </div>
          )}

          {modules.length === 0 ? (
            <div className="glass-panel p-16 rounded-3xl flex flex-col items-center justify-center text-center mt-12 border-dashed border-2 border-slate-600/50 shadow-2xl">
              <div className="bg-slate-800 p-6 rounded-full text-primary mb-6 shadow-[0_0_30px_rgba(14,165,233,0.3)] border border-slate-700">
                <FaBookReader size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-2">No Modules Found</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium">
                Get started by adding your first module to track attendance, assignments, and upload lecture notes.
              </p>
              <button onClick={openAddModal} className="glass-button px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 border border-slate-600/50 flex items-center gap-2">
                <FaPlus /> Create Module
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {modules.map((module) => (
                <ModuleCard
                  key={module._id}
                  module={module}
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