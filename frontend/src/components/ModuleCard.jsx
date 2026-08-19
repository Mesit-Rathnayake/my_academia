import React from 'react';
import { FaTrash, FaEdit, FaCheckCircle, FaTimesCircle, FaClock, FaPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';

const themes = [
  { name: 'rose', badge: 'bg-rose-100 text-rose-700 border-rose-200' },
  { name: 'emerald', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { name: 'violet', badge: 'bg-violet-100 text-violet-700 border-violet-200' },
  { name: 'amber', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  { name: 'blue', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`bg-white p-6 rounded-3xl flex flex-col gap-6 shadow-sm border border-slate-200 border-t-4 border-t-${theme.name}-500 hover:border-${theme.name}-300 transition-all duration-300 group cursor-pointer relative overflow-hidden transform hover:-translate-y-1 hover:shadow-md`}
      onClick={onOpenEdit}
    >
      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <div>
          <span className={`text-xs font-bold tracking-widest px-3 py-1.5 rounded-lg mb-3 inline-block border ${theme.badge}`}>
            {moduleCode || 'NO-CODE'}
          </span>
          <h3 className="text-xl font-bold text-slate-900 leading-tight">
            {moduleName}
          </h3>
        </div>
        <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(module._id); }}
            className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
            title="Delete Module"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>

      {/* Attendance Widget */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 z-10">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
            Attendance
          </h4>
          <span className={`text-sm font-black px-3 py-1 rounded-lg border ${
            attendanceStatus === 'danger' ? 'bg-red-100 text-red-600 border-red-200' :
            attendanceStatus === 'safe' ? 'bg-green-100 text-green-600 border-green-200' :
            'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {attendancePercentage}%
          </span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2 mb-5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              attendanceStatus === 'danger' ? 'bg-red-500' :
              attendanceStatus === 'safe' ? 'bg-green-500' :
              'bg-slate-400'
            }`} 
            style={{ width: `${Math.min(100, attendancePercentage)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wide">
          <div className="flex flex-col items-center bg-white w-full py-2 rounded-l-lg border-y border-l border-slate-200 relative group/btn">
            <span className="text-slate-800 text-xl font-black mb-1">{attendedLectures}</span>
            <span>Attended</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onInlineUpdate('attendedLectures', attendedLectures + 1); }}
              className={`absolute top-1 right-2 bg-slate-100 hover:bg-${theme.name}-100 hover:text-${theme.name}-700 text-slate-500 rounded-full p-1 opacity-0 group-hover/btn:opacity-100 transition-all`}
              title="Add Attended Lecture"
            >
              <FaPlus size={10} />
            </button>
          </div>
          <div className="flex flex-col items-center bg-white w-full py-2 border border-slate-200 relative group/btn">
            <span className="text-slate-800 text-xl font-black mb-1">{conductedLectures}</span>
            <span>Conducted</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onInlineUpdate('conductedLectures', conductedLectures + 1); }}
              className={`absolute top-1 right-2 bg-slate-100 hover:bg-${theme.name}-100 hover:text-${theme.name}-700 text-slate-500 rounded-full p-1 opacity-0 group-hover/btn:opacity-100 transition-all`}
              title="Add Conducted Lecture"
            >
              <FaPlus size={10} />
            </button>
          </div>
          <div className="flex flex-col items-center bg-white w-full py-2 rounded-r-lg border-y border-r border-slate-200">
            <span className="text-slate-800 text-xl font-black mb-1">{totalLectures}</span>
            <span>Total</span>
          </div>
        </div>
      </div>

      {/* Stats row for Tasks and Documents */}
      <div className="flex gap-4 z-10">
        <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center justify-center transition-colors">
          <span className="text-3xl font-black text-slate-800 mb-1">
            {assignments.length + labs.length}
          </span>
          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Tasks</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center justify-center transition-colors">
          <span className="text-3xl font-black text-slate-800 mb-1">
            {documents.length}
          </span>
          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Notes</span>
        </div>
      </div>
    </motion.div>
  );
}

export default ModuleCard;