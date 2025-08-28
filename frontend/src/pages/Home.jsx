import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import '../styles/Home.css';
import ModuleCard from '../components/ModuleCard';
import ModuleFormModal from '../components/ModuleFormModal';

function Home() {
  const [modules, setModules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModule, setEditModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/modules', {
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
        ? `http://localhost:5000/api/modules/${editModule._id}`
        : 'http://localhost:5000/api/modules';
      
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
      const response = await fetch(`http://localhost:5000/api/modules/${moduleId}`, {
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

      if (field === 'attendedHours' || field === 'lectureHours') {
        updatedModule[field] = value;
      } else if (field.startsWith('assignment:')) {
        const [_, index, prop] = field.split(':');
        const assignmentIndex = parseInt(index);
        
        if (!updatedModule.assignments) updatedModule.assignments = [];
        if (!updatedModule.assignments[assignmentIndex]) updatedModule.assignments[assignmentIndex] = {};
        
        updatedModule.assignments[assignmentIndex][prop] = 
          prop === 'marks' ? (value === '' ? null : Number(value)) : value;
      } else if (field.startsWith('lab:')) {
        const [_, index, prop] = field.split(':');
        const labIndex = parseInt(index);
        
        if (!updatedModule.labs) updatedModule.labs = [];
        if (!updatedModule.labs[labIndex]) updatedModule.labs[labIndex] = {};
        
        updatedModule.labs[labIndex][prop] = 
          prop === 'completed' ? !!value : value;
      }

      const response = await fetch(`http://localhost:5000/api/modules/${moduleId}`, {
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
      <div className="home">
        <Sidebar />
        <div className="home-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <Sidebar />
      <div className="home-content">
        <div className="home-header">
          <h2>Welcome Back</h2>
          <button className="add-module-btn" onClick={openAddModal}>+ Add Module</button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <div className="modules-grid">
          {modules.length === 0 ? (
            <div className="empty-note">No modules yet. Click <strong>Add Module</strong> to create one.</div>
          ) : (
            modules.map((module) => (
              <ModuleCard
                key={module._id}
                module={module}
                onOpenEdit={() => openEditModal(module)}
                onInlineUpdate={(field, value) => handleInlineUpdate(module._id, field, value)}
                onDelete={(moduleId) => handleDeleteModule(moduleId)}
              />
            ))
          )}
        </div>
      </div>

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