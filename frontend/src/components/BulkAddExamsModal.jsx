import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
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
      setError("Please provide a title for the examination series.");
      return;
    }

    const validExams = exams.filter(e => e.title.trim() && e.date);
    if (validExams.length === 0) {
      setError("Please fill out at least one examination paper (Title and Date).");
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
      setError("Failed to save the exam series. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isEditing = !!(initialData && (initialData.id || initialData._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.12 }}
        className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {isEditing ? 'Edit Examination Series' : 'New Examination Series'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Group exam papers under a single examination session
            </p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-md">
            <FaTimes size={14} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-3.5 py-2.5 rounded-lg mb-4 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mb-1.5 block">
              Series Title
            </label>
            <input 
              type="text" 
              placeholder="e.g. Semester 06 End Examination" 
              className="glass-input px-3.5 py-2.5 rounded-lg w-full text-xs font-semibold" 
              value={seriesTitle} 
              onChange={e => setSeriesTitle(e.target.value)} 
              required 
            />
          </div>

          <label className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mb-2 block">
            Scheduled Papers
          </label>

          <div className="space-y-2.5">
            {exams.map((exam, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2.5 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800 items-center">
                <div className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-mono font-bold flex items-center justify-center text-[11px] shrink-0">
                  {i + 1}
                </div>
                
                <div className="flex-1 w-full sm:w-auto">
                  <input 
                    type="text" 
                    placeholder="Module Code & Name" 
                    className="glass-input px-3 py-2 rounded-lg w-full text-xs" 
                    value={exam.title} 
                    onChange={e => handleChange(i, 'title', e.target.value)} 
                    required 
                  />
                </div>

                <div className="w-full sm:w-48">
                  <input 
                    type="datetime-local" 
                    className="glass-input px-3 py-2 rounded-lg w-full text-xs font-mono" 
                    value={exam.date} 
                    onChange={e => handleChange(i, 'date', e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="w-full sm:w-36">
                  <input 
                    type="text" 
                    placeholder="Venue (e.g. Hall A)" 
                    className="glass-input px-3 py-2 rounded-lg w-full text-xs" 
                    value={exam.location} 
                    onChange={e => handleChange(i, 'location', e.target.value)} 
                  />
                </div>

                {exams.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveRow(i)}
                    className="text-zinc-400 hover:text-red-600 p-1.5 rounded transition-colors"
                    title="Remove Paper"
                  >
                    <FaTrash size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button 
            type="button"
            onClick={handleAddRow}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-blue-600 hover:border-blue-500 transition-colors font-semibold text-xs"
          >
            <FaPlus size={10} /> Add Paper
          </button>
        </div>

        <div className="px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-2">
          <button onClick={onClose} type="button" className="px-3.5 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700 text-xs">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 text-xs shadow-xs"
          >
            {isSaving ? 'Saving...' : (isEditing ? 'Update Series' : 'Save Series')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default BulkAddExamsModal;
