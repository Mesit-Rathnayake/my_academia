import React, { useState, useEffect } from 'react';
import { FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';
import CustomSelect from './CustomSelect';

function AddTimetableEntryModal({ isOpen, onClose, onSaved, initialDay, initialStartTime }) {
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const [entry, setEntry] = useState({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
    type: 'Lecture',
    location: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setEntry({
        dayOfWeek: initialDay !== undefined ? initialDay : 1,
        startTime: initialStartTime || '08:00',
        endTime: calculateEndTime(initialStartTime || '08:00'),
        type: '',
        location: ''
      });
      setError(null);
    }
  }, [isOpen, initialDay, initialStartTime]);

  const calculateEndTime = (start) => {
    if (!start) return '09:00';
    const [h, m] = start.split(':').map(Number);
    let endH = h + 1;
    if (endH > 23) endH = 23;
    return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBaseUrl}/api/timetable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (!res.ok) throw new Error('Failed to save timetable entry');
      
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
      >
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Add Class</h2>
            <p className="text-sm text-slate-500 mt-1">Schedule a new repeating class.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
        </div>

        <div className="p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 font-medium text-sm">⚠️ {error}</div>}
          
          <form id="add-timetable-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">Day of Week</label>
              <CustomSelect 
                className="bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm font-semibold"
                value={entry.dayOfWeek} 
                onChange={val => setEntry({...entry, dayOfWeek: val})}
                options={days.map((day, i) => ({ value: i, label: day }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">Start Time</label>
                <input 
                  type="time" 
                  className="bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm" 
                  value={entry.startTime} 
                  onChange={e => setEntry({...entry, startTime: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">End Time</label>
                <input 
                  type="time" 
                  className="bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm" 
                  value={entry.endTime} 
                  onChange={e => setEntry({...entry, endTime: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">Class Title</label>
              <input 
                type="text" 
                placeholder="e.g. Mathematics Lecture" 
                className="bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm font-semibold" 
                value={entry.type} 
                onChange={e => setEntry({...entry, type: e.target.value})} 
                required 
              />
            </div>
            
            <div>
              <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1 block pl-1">Location (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Room 402" 
                className="bg-white text-slate-900 p-3.5 rounded-xl border border-slate-200 w-full focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm" 
                value={entry.location} 
                onChange={e => setEntry({...entry, location: e.target.value})} 
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-4">
          <button onClick={onClose} type="button" className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-200 hover:text-slate-900 transition-colors text-sm">
            Cancel
          </button>
          <button 
            type="submit"
            form="add-timetable-form"
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale text-sm"
          >
            <FaSave /> {isSaving ? 'Saving...' : 'Save Class'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default AddTimetableEntryModal;
