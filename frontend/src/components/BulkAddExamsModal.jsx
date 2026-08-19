import React, { useState } from 'react';
import { FaTrash, FaPlus, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';

function BulkAddExamsModal({ isOpen, onClose, onSaved }) {
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  const [seriesTitle, setSeriesTitle] = useState('');
  const [exams, setExams] = useState([
    { title: '', date: '', location: '' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await fetch(`${apiBaseUrl}/api/exam-series`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: seriesTitle.trim(), exams: validExams })
      });
      
      if (!response.ok) throw new Error('Failed to save exam series');
      
      // Clear and close
      setSeriesTitle('');
      setExams([{ title: '', date: '', location: '' }]);
      onSaved();
    } catch (err) {
      setError("Failed to save the exam series. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Add Exam Timetable</h2>
            <p className="text-sm text-slate-500 mt-1">Add all your subjects for this exam period in bulk.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 font-medium text-sm">⚠️ {error}</div>}
          
          <div className="mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
            <label className="text-xs text-primary font-black uppercase tracking-widest mb-2 block">Examination Series Name</label>
            <input 
              type="text" 
              placeholder="e.g. Seventh Semester End Examination" 
              className="bg-white text-slate-900 p-4 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none text-lg font-bold" 
              value={seriesTitle} 
              onChange={e => setSeriesTitle(e.target.value)} 
            />
          </div>

          <div className="space-y-4">
            {exams.map((exam, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 items-start sm:items-center relative group">
                {exams.length > 1 && (
                  <button 
                    onClick={() => handleRemoveRow(i)} 
                    className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:scale-110"
                    title="Remove row"
                  >
                    <FaTrash size={12} />
                  </button>
                )}
                
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">Subject / Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Advanced Mathematics" 
                    className="bg-white text-slate-900 p-3 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none text-sm" 
                    value={exam.title} 
                    onChange={e => handleChange(i, 'title', e.target.value)} 
                  />
                </div>
                
                <div className="w-full sm:w-auto min-w-[200px]">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="bg-white text-slate-900 p-3 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none text-sm" 
                    value={exam.date} 
                    onChange={e => handleChange(i, 'date', e.target.value)} 
                  />
                </div>
                
                <div className="flex-1 w-full sm:w-auto min-w-[150px]">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">Location (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Hall A" 
                    className="bg-white text-slate-900 p-3 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none text-sm" 
                    value={exam.location} 
                    onChange={e => handleChange(i, 'location', e.target.value)} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleAddRow}
            className="mt-6 flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all font-bold text-sm"
          >
            <FaPlus /> Add Another Subject
          </button>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-200 hover:text-slate-900 transition-colors text-sm">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale text-sm"
          >
            <FaSave /> {isSaving ? 'Saving...' : 'Save All Exams'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default BulkAddExamsModal;
