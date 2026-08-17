import React, { useState } from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';

function WeeklyCalendar({ timetable, onDelete, onAddClick }) {
  // Calendar configuration
  const days = [1, 2, 3, 4, 5]; // Monday to Friday (0 is Sunday, 6 is Saturday)
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const startHour = 8; // 8 AM
  const endHour = 20; // 8 PM
  const totalHours = endHour - startHour;
  
  // Calculate top offset based on time
  const getOffset = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    const offsetH = h - startHour;
    return (offsetH + (m / 60)) * 60; // 60px per hour
  };

  // Calculate height based on duration
  const getHeight = (startStr, endStr) => {
    if (!startStr || !endStr) return 60;
    const start = getOffset(startStr);
    const end = getOffset(endStr);
    return Math.max(end - start, 20); // Min 20px height
  };

  // Pre-process entries into days
  const eventsByDay = {};
  days.forEach(d => eventsByDay[d] = []);
  timetable.forEach(entry => {
    if (eventsByDay[entry.dayOfWeek]) {
      eventsByDay[entry.dayOfWeek].push(entry);
    }
  });

  return (
    <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[700px]">
      <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/40">
        <h3 className="text-xl font-bold text-white">Weekly Calendar</h3>
        <button 
          onClick={() => onAddClick(1, '08:00')}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-emerald-500/30"
        >
          <FaPlus /> Add Class
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-900/20">
        <div className="min-w-[600px]">
          {/* Header row (Days) */}
          <div className="flex border-b border-slate-700 sticky top-0 z-20 bg-slate-800 shadow-sm">
            <div className="w-16 shrink-0 border-r border-slate-700 bg-slate-800/80"></div>
            {days.map(d => (
              <div key={d} className="flex-1 text-center py-3 text-xs font-bold text-slate-400 uppercase tracking-widest border-r border-slate-700/50 last:border-r-0">
                {dayNames[d]}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="flex relative" style={{ height: `${totalHours * 60}px` }}>
            {/* Time labels column */}
            <div className="w-16 shrink-0 border-r border-slate-700 bg-slate-800/30 relative">
              {Array.from({ length: totalHours }).map((_, i) => (
                <div key={i} className="absolute w-full text-right pr-2 text-[10px] font-bold text-slate-500" style={{ top: `${i * 60}px`, transform: 'translateY(-50%)' }}>
                  {i + startHour}:00
                </div>
              ))}
            </div>

            {/* Background horizontal grid lines */}
            <div className="absolute top-0 right-0 left-16 bottom-0 pointer-events-none">
              {Array.from({ length: totalHours }).map((_, i) => (
                <div key={i} className="absolute w-full border-t border-slate-700/30" style={{ top: `${i * 60}px` }}></div>
              ))}
            </div>

            {/* Days columns */}
            {days.map(d => (
              <div key={d} className="flex-1 relative border-r border-slate-700/50 last:border-r-0 hover:bg-slate-700/10 transition-colors group">
                {/* Clickable background to add event */}
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const hour = Math.floor(y / 60) + startHour;
                    onAddClick(d, `${String(hour).padStart(2, '0')}:00`);
                  }}
                />
                
                {/* Events for this day */}
                {eventsByDay[d].map(entry => (
                  <div 
                    key={entry.id}
                    className="absolute left-1 right-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-sm overflow-hidden group/event transition-all z-10"
                    style={{ 
                      top: `${getOffset(entry.startTime)}px`, 
                      height: `${getHeight(entry.startTime, entry.endTime)}px` 
                    }}
                  >
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500"></div>
                    <div className="p-1.5 pl-3 h-full flex flex-col">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-emerald-300 leading-tight truncate pr-1">{entry.type}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                          className="opacity-0 group-hover/event:opacity-100 text-slate-400 hover:text-red-400 transition-opacity bg-slate-900/50 rounded p-1 shrink-0"
                        >
                          <FaTrash size={8} />
                        </button>
                      </div>
                      <span className="text-[9px] text-emerald-400/80 font-medium">{entry.startTime} - {entry.endTime}</span>
                      {entry.location && <span className="text-[9px] text-slate-400 truncate mt-0.5">{entry.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyCalendar;
