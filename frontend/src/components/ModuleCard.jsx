import React from 'react';
import { FaTrash, FaEdit, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const themes = [
  { name: 'rose', badge: 'bg-rose-500 shadow-rose-500/30', glow: 'from-rose-500/20 via-transparent to-orange-500/10' },
  { name: 'emerald', badge: 'bg-emerald-500 shadow-emerald-500/30', glow: 'from-emerald-500/20 via-transparent to-teal-500/10' },
  { name: 'violet', badge: 'bg-violet-500 shadow-violet-500/30', glow: 'from-violet-500/20 via-transparent to-fuchsia-500/10' },
  { name: 'amber', badge: 'bg-amber-500 shadow-amber-500/30', glow: 'from-amber-500/20 via-transparent to-yellow-500/10' },
  { name: 'blue', badge: 'bg-blue-500 shadow-blue-500/30', glow: 'from-blue-500/20 via-transparent to-cyan-500/10' },
];

function ModuleCard({ module = {}, index = 0, onOpenEdit, onInlineUpdate, onDelete }) {
  const {
    moduleName = 'Untitled',
    moduleCode = '',
    totalLectures = 0,
    conductedLectures = 0,
    attendedLectures = 0,
    assignments = [],
    labs = [],
    documents = []
  } = module;

  const theme = themes[index % themes.length];

  const attendancePercentage = conductedLectures > 0 
    ? Math.round((attendedLectures / conductedLectures) * 100)
    : 0;

  let attendanceStatus = 'safe';
  if (attendancePercentage < 80) attendanceStatus = 'danger';
  if (conductedLectures === 0) attendanceStatus = 'neutral';

  const updateAssignmentMarks = (aIndex, newMarks) => {
    onInlineUpdate(`assignment:${aIndex}:marks`, newMarks === '' ? null : Number(newMarks));
  };

  const toggleLabCompleted = (lIndex, checked) => {
    onInlineUpdate(`lab:${lIndex}:status`, checked ? 'Graded' : 'Pending');
  };

  return (
    <div 
      className={`bg-slate-800/80 backdrop-blur-sm p-6 rounded-3xl flex flex-col gap-6 shadow-xl shadow-black/30 border-2 border-slate-700 hover:border-${theme.name}-500/50 transition-all duration-300 group cursor-pointer relative overflow-hidden transform hover:-translate-y-1`}
      onClick={onOpenEdit}
    >
      {/* Background glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <div>
          <span className={`text-xs font-black tracking-widest text-white px-3 py-1.5 rounded-lg mb-3 inline-block shadow-lg ${theme.badge}`}>
            {moduleCode || 'NO-CODE'}
          </span>
          <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">
            {moduleName}
          </h3>
        </div>
        <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50 hover:bg-slate-900/80 transition-colors">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(module._id); }}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-red-500 shadow-sm"
            title="Delete Module"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>

      {/* Attendance Widget */}
      <div className="bg-slate-900/70 rounded-2xl p-5 border border-slate-700/80 shadow-inner z-10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            Attendance
          </h4>
          <span className={`text-sm font-black px-3 py-1 rounded-lg border shadow-sm ${
            attendanceStatus === 'danger' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
            attendanceStatus === 'safe' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
            'bg-slate-700 text-slate-300 border-slate-600'
          }`}>
            {attendancePercentage}%
          </span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-3 mb-5 overflow-hidden border border-slate-700 shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              attendanceStatus === 'danger' ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
              attendanceStatus === 'safe' ? 'bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]' :
              'bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.6)]'
            }`} 
            style={{ width: `${Math.min(100, attendancePercentage)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wide">
          <div className="flex flex-col items-center bg-slate-800/50 w-full py-2 rounded-l-lg border-r border-slate-700/50">
            <span className="text-white text-xl font-black mb-1">{attendedLectures}</span>
            <span>Attended</span>
          </div>
          <div className="flex flex-col items-center bg-slate-800/50 w-full py-2 border-r border-slate-700/50">
            <span className="text-white text-xl font-black mb-1">{conductedLectures}</span>
            <span>Conducted</span>
          </div>
          <div className="flex flex-col items-center bg-slate-800/50 w-full py-2 rounded-r-lg">
            <span className="text-white text-xl font-black mb-1">{totalLectures}</span>
            <span>Total</span>
          </div>
        </div>
      </div>

      {/* Stats row for Tasks and Documents */}
      <div className="flex gap-4 z-10">
        <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700 shadow-lg flex flex-col items-center justify-center group-hover:border-blue-500/30 transition-colors">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)] mb-1">
            {assignments.length + labs.length}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Tasks</span>
        </div>
        <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 border border-slate-700 shadow-lg flex flex-col items-center justify-center group-hover:border-purple-500/30 transition-colors">
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)] mb-1">
            {documents.length}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Notes</span>
        </div>
      </div>
    </div>
  );
}

export default ModuleCard;