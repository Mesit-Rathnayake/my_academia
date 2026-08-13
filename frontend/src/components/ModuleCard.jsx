import React, { useState } from 'react';
import { FaTrash, FaEdit, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

function ModuleCard({ module = {}, onOpenEdit, onInlineUpdate, onDelete }) {
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
      className="glass-panel p-6 rounded-2xl flex flex-col gap-6 shadow-lg shadow-black/20 border-2 border-slate-600/50 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all duration-300 group cursor-pointer relative overflow-hidden"
      onClick={onOpenEdit}
    >
      {/* Background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <div>
          <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block border border-primary/20">
            {moduleCode || 'NO-CODE'}
          </span>
          <h3 className="text-xl font-bold text-slate-100 leading-tight drop-shadow-md">
            {moduleName}
          </h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(module._id); }}
            className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-slate-800 border border-transparent hover:border-red-500/30"
            title="Delete Module"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>

      {/* Attendance Widget */}
      <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-600/50 shadow-inner z-10">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-2">
            Attendance
          </h4>
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
            attendanceStatus === 'danger' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
            attendanceStatus === 'safe' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
            'bg-slate-500/20 text-slate-400 border-slate-500/30'
          }`}>
            {attendancePercentage}%
          </span>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-2.5 mb-4 overflow-hidden border border-slate-700/50 shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              attendanceStatus === 'danger' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' :
              attendanceStatus === 'safe' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' :
              'bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.6)]'
            }`} 
            style={{ width: `${Math.min(100, attendancePercentage)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <div className="flex flex-col items-center">
            <span className="text-slate-200 text-lg font-bold">{attendedLectures}</span>
            <span>Attended</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-200 text-lg font-bold">{conductedLectures}</span>
            <span>Conducted</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-slate-200 text-lg font-bold">{totalLectures}</span>
            <span>Total</span>
          </div>
        </div>
      </div>

      {/* Stats row for Tasks and Documents */}
      <div className="flex gap-4 z-10">
        <div className="flex-1 bg-slate-800/60 rounded-xl p-3 border border-slate-600/50 shadow-inner flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]">{assignments.length + labs.length}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold mt-1">Tasks</span>
        </div>
        <div className="flex-1 bg-slate-800/60 rounded-xl p-3 border border-slate-600/50 shadow-inner flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]">{documents.length}</span>
          <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold mt-1">Notes</span>
        </div>
      </div>
    </div>
  );
}

export default ModuleCard;