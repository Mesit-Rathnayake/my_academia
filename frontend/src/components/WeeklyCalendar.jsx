import React from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';

function WeeklyCalendar({ timetable, onDelete, onAddClick }) {
  const days = [1, 2, 3, 4, 5]; // Monday to Friday
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const startHour = 8; // 8 AM
  const endHour = 19; // 7 PM
  const totalHours = endHour - startHour;
  
  const getOffset = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    const offsetH = h - startHour;
    return (offsetH + (m / 60)) * 54;
  };

  const getHeight = (startStr, endStr) => {
    if (!startStr || !endStr) return 54;
    const start = getOffset(startStr);
    const end = getOffset(endStr);
    return Math.max(end - start, 24);
  };

  const eventsByDay = {};
  days.forEach(d => eventsByDay[d] = []);
  timetable.forEach(entry => {
    if (eventsByDay[entry.dayOfWeek]) {
      eventsByDay[entry.dayOfWeek].push(entry);
    }
  });

  return (
    <div className="bg-white dark:bg-[#121215] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-[660px]">
      <div className="px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex justify-between items-center bg-white dark:bg-[#121215]">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Weekly Class Grid</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Click any time slot to schedule a lecture or lab</p>
        </div>
        <button 
          onClick={() => onAddClick(1, '08:00')}
          className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-zinc-200/80 dark:border-zinc-700"
        >
          <FaPlus size={10} /> Add Slot
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto relative bg-white dark:bg-[#121215]">
        <div className="min-w-[540px]">
          {/* Header row */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 bg-zinc-50 dark:bg-zinc-900">
            <div className="w-14 shrink-0 border-r border-zinc-200/80 dark:border-zinc-800"></div>
            {days.map(d => (
              <div key={d} className="flex-1 text-center py-2.5 text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider border-r border-zinc-200/60 dark:border-zinc-800 last:border-r-0">
                {dayNames[d]}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="flex relative" style={{ height: `${totalHours * 54}px` }}>
            {/* Time labels */}
            <div className="w-14 shrink-0 border-r border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 relative">
              {Array.from({ length: totalHours }).map((_, i) => (
                <div key={i} className="absolute w-full text-right pr-2 text-[10px] font-mono text-zinc-400 tabular-nums" style={{ top: `${i * 54}px`, transform: 'translateY(-50%)' }}>
                  {String(i + startHour).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Horizontal grid lines */}
            <div className="absolute top-0 right-0 left-14 bottom-0 pointer-events-none">
              {Array.from({ length: totalHours }).map((_, i) => (
                <div key={i} className="absolute w-full border-t border-zinc-100 dark:border-zinc-800/60" style={{ top: `${i * 54}px` }}></div>
              ))}
            </div>

            {/* Days columns */}
            {days.map(d => (
              <div key={d} className="flex-1 relative border-r border-zinc-100 dark:border-zinc-800/60 last:border-r-0 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors">
                <div 
                  className="absolute inset-0 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const hour = Math.floor(y / 54) + startHour;
                    onAddClick(d, `${String(hour).padStart(2, '0')}:00`);
                  }}
                />
                
                {eventsByDay[d].map(entry => (
                  <div 
                    key={entry.id}
                    className="absolute left-1 right-1 rounded-md border border-blue-200 dark:border-blue-800 border-l-2 border-l-blue-600 bg-blue-50/70 dark:bg-blue-950/50 p-1.5 overflow-hidden group/event transition-colors z-10"
                    style={{ 
                      top: `${getOffset(entry.startTime)}px`, 
                      height: `${getHeight(entry.startTime, entry.endTime)}px` 
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-semibold text-blue-950 dark:text-blue-100 leading-tight truncate pr-1">{entry.type}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                        className="opacity-0 group-hover/event:opacity-100 text-zinc-400 hover:text-red-600 transition-opacity p-0.5 shrink-0"
                      >
                        <FaTrash size={8} />
                      </button>
                    </div>
                    <span className="block text-[10px] font-mono text-blue-700/80 dark:text-blue-300/80 tabular-nums">{entry.startTime}–{entry.endTime}</span>
                    {entry.location && <span className="block text-[10px] text-blue-600/70 dark:text-blue-400/70 truncate">{entry.location}</span>}
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
