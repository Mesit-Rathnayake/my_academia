import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

function BulkAddExamsModal({ isOpen, onClose, onSaved, initialData = null }) {
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  const [seriesTitle, setSeriesTitle] = useState('');
  const [exams, setExams] = useState([
    { title: '', date: '', location: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (_) {
      return '';
    }
  };

  useEffect(() => {
    if (initialData) {
      setSeriesTitle(initialData.title || '');
      if (initialData.exams && initialData.exams.length > 0) {
        setExams(initialData.exams.map(e => ({
          title: e.title || e.subject || '',
          date: formatDateForInput(e.date || e.dateTime),
          location: e.location || ''
        })));
      } else {
        setExams([{ title: '', date: '', location: '' }]);
      }
    } else {
      setSeriesTitle('');
      setExams([{ title: '', date: '', location: '' }]);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setExams([...exams, { title: '', date: '', location: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (exams.length === 1) return;
    setExams(exams.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...exams];
    updated[index][field] = value;
    setExams(updated);
  };

  const handleSave = async () => {
    if (!seriesTitle.trim()) {
      setError("Please provide a name for the Examination Series (e.g., 'Seventh Semester End Examination').");
      return;
    }

    const validExams = exams.filter(e => e.title.trim() && e.date);
    if (validExams.length === 0) {
      setError("Please fill out at least one subject completely (Title and Date).");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const isEditing = !!(initialData && (initialData.id || initialData._id));
      const seriesId = initialData?.id || initialData?._id;

      const url = isEditing 
        ? `${apiBaseUrl}/api/exam-series/${seriesId}`
        : `${apiBaseUrl}/api/exam-series`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: seriesTitle.trim(), exams: validExams })
      });
      
      if (!response.ok) throw new Error('Failed to save exam series');
      
      onSaved();
    } catch (err) {
      setError("Failed to save the exam series. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isEditing = !!(initialData && (initialData.id || initialData._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Edit Exam Timetable Series' : 'Bulk Add Exam Timetable'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Group all exam papers under one examination series with scheduled dates & venues.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="mb-6">
            <label className="text-xs text-primary font-bold uppercase tracking-wider mb-2 block">
              Examination Series Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. End Semester Examination - Fall 2026" 
              className="bg-white text-slate-900 font-bold p-4 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none text-base transition-all" 
              value={seriesTitle} 
              onChange={e => setSeriesTitle(e.target.value)} 
              required 
            />
          </div>

          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3 block">
            Exam Papers / Subjects
          </label>

          <div className="space-y-3">
            {exams.map((exam, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 items-center hover:border-slate-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                  #{i + 1}
                </div>
                
                <div className="flex-1 w-full sm:w-auto min-w-[180px]">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">Subject / Module</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Distributed Systems" 
                    className="bg-white text-slate-900 font-semibold p-3 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none text-sm" 
                    value={exam.title} 
                    onChange={e => handleChange(i, 'title', e.target.value)} 
                    required 
                  />
                </div>

                <div className="flex-1 w-full sm:w-auto min-w-[200px]">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="bg-white text-slate-900 p-3 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none text-sm font-medium" 
                    value={exam.date} 
                    onChange={e => handleChange(i, 'date', e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="flex-1 w-full sm:w-auto min-w-[140px]">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">Location (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Hall A" 
                    className="bg-white text-slate-900 p-3 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none text-sm" 
                    value={exam.location} 
                    onChange={e => handleChange(i, 'location', e.target.value)} 
                  />
                </div>

                {exams.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveRow(i)}
                    className="text-slate-400 hover:text-red-600 p-3 rounded-xl hover:bg-red-50 transition-colors mt-4 sm:mt-0"
                    title="Remove Subject"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button 
            type="button"
            onClick={handleAddRow}
            className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-600 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-bold text-sm"
          >
            <FaPlus size={12} /> Add Another Subject
          </button>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
          <button onClick={onClose} type="button" className="px-6 py-3 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200 text-sm">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            type="button"
            className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale text-sm"
          >
            <FaSave /> {isSaving ? 'Saving...' : (isEditing ? 'Update Exam Series' : 'Save All Exams')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default BulkAddExamsModal;
