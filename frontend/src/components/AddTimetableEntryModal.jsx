import React, { useState, useEffect } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.12 }}
        className="bg-white dark:bg-[#121215] w-full max-w-md rounded-xl shadow-xl overflow-hidden flex flex-col border border-zinc-200 dark:border-zinc-800"
      >
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Schedule Class Session</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Add a recurring weekly slot</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5">
          {error && <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg mb-4 text-xs font-medium">{error}</div>}
          
          <form id="add-timetable-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mb-1.5 block">Day of Week</label>
              <CustomSelect 
                className="glass-input px-3 py-2 rounded-lg w-full text-xs font-medium"
                value={entry.dayOfWeek} 
                onChange={val => setEntry({...entry, dayOfWeek: val})}
                options={days.map((day, i) => ({ value: i, label: day }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mb-1.5 block">Start Time</label>
                <input 
                  type="time" 
                  className="glass-input px-3 py-2 rounded-lg w-full text-xs font-mono" 
                  value={entry.startTime} 
                  onChange={e => setEntry({...entry, startTime: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mb-1.5 block">End Time</label>
                <input 
                  type="time" 
                  className="glass-input px-3 py-2 rounded-lg w-full text-xs font-mono" 
                  value={entry.endTime} 
                  onChange={e => setEntry({...entry, endTime: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mb-1.5 block">Session Title</label>
              <input 
                type="text" 
                placeholder="e.g. EC4201 Lecture" 
                className="glass-input px-3 py-2 rounded-lg w-full text-xs" 
                value={entry.type} 
                onChange={e => setEntry({...entry, type: e.target.value})} 
                required 
              />
            </div>
            
            <div>
              <label className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold mb-1.5 block">Venue / Hall (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. LT-1 / Lab 03" 
                className="glass-input px-3 py-2 rounded-lg w-full text-xs" 
                value={entry.location} 
                onChange={e => setEntry({...entry, location: e.target.value})} 
              />
            </div>
          </form>
        </div>

        <div className="px-5 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-2">
          <button onClick={onClose} type="button" className="px-3.5 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-200/70 dark:hover:bg-zinc-700 transition-colors text-xs border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
            Cancel
          </button>
          <button 
            type="submit"
            form="add-timetable-form"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 text-xs shadow-xs"
          >
            {isSaving ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default AddTimetableEntryModal;
