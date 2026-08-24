import React, { useState } from 'react';
import { FaTrash, FaPlus, FaFilePdf, FaUpload, FaExternalLinkAlt, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const themes = [
  { name: 'indigo', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', borderTop: 'border-t-indigo-600' },
  { name: 'sky', badge: 'bg-sky-50 text-sky-700 border-sky-200', borderTop: 'border-t-sky-600' },
  { name: 'emerald', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', borderTop: 'border-t-emerald-600' },
  { name: 'violet', badge: 'bg-violet-50 text-violet-700 border-violet-200', borderTop: 'border-t-violet-600' },
  { name: 'amber', badge: 'bg-amber-50 text-amber-700 border-amber-200', borderTop: 'border-t-amber-600' },
];

function ModuleCard({ module = {}, index = 0, onOpenEdit, onInlineUpdate, onDelete }) {
  const {
    _id,
    id,
    moduleName = 'Untitled',
    moduleCode = '',
    totalLectures = 0,
    conductedLectures = 0,
    attendedLectures = 0,
    assignments = [],
    labs = [],
    documents = []
  } = module;

  const moduleId = _id || id;
  const [isUploading, setIsUploading] = useState(false);
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  const theme = themes[index % themes.length];

  const attendancePercentage = conductedLectures > 0 
    ? Math.round((attendedLectures / conductedLectures) * 100)
    : 0;

  let attendanceStatus = 'safe';
  if (attendancePercentage < 80) attendanceStatus = 'danger';
  if (conductedLectures === 0) attendanceStatus = 'neutral';

  const handleCardFileUpload = async (e) => {
    e.stopPropagation();
    const file = e.target.files[0];
    if (!file || !moduleId) return;

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${apiBaseUrl}/api/modules/${moduleId}/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      
      // Trigger a re-fetch of dashboard modules
      if (typeof onInlineUpdate === 'function') {
        onInlineUpdate('refresh', true);
      }
    } catch (err) {
      alert('Failed to upload document: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleViewPdf = (e, docId) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    window.open(`${apiBaseUrl}/api/modules/${moduleId}/documents/${docId}?token=${token}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`bg-white p-6 rounded-3xl flex flex-col gap-5 shadow-sm border border-slate-200 border-t-4 ${theme.borderTop} hover:border-slate-300 transition-all duration-300 group cursor-pointer relative overflow-hidden transform hover:-translate-y-1 hover:shadow-md`}
      onClick={onOpenEdit}
    >
      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <div>
          <span className={`text-xs font-bold tracking-widest px-3 py-1.5 rounded-lg mb-2 inline-block border ${theme.badge}`}>
            {moduleCode || 'NO-CODE'}
          </span>
          <h3 className="text-xl font-bold text-slate-900 leading-tight">
            {moduleName}
          </h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(moduleId); }}
            className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-xl hover:bg-red-50"
            title="Delete Module"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>

      {/* Attendance Widget */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 z-10">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
            Attendance
          </h4>
          <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
            attendanceStatus === 'danger' ? 'bg-red-100 text-red-600 border-red-200' :
            attendanceStatus === 'safe' ? 'bg-green-100 text-green-700 border-green-200' :
            'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {attendancePercentage}%
          </span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              attendanceStatus === 'danger' ? 'bg-red-500' :
              attendanceStatus === 'safe' ? 'bg-green-600' :
              'bg-slate-400'
            }`} 
            style={{ width: `${Math.min(100, attendancePercentage)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-slate-600 font-bold uppercase tracking-wide">
          <div className="flex flex-col items-center bg-white w-full py-2 rounded-l-xl border-y border-l border-slate-200 relative group/btn">
            <span className="text-slate-900 text-lg font-black">{attendedLectures}</span>
            <span className="text-[10px] text-slate-500">Attended</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onInlineUpdate('attendedLectures', attendedLectures + 1); }}
              className="absolute top-1 right-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full p-1 opacity-0 group-hover/btn:opacity-100 transition-all shadow-sm"
              title="Add Attended Lecture"
            >
              <FaPlus size={10} />
            </button>
          </div>
          <div className="flex flex-col items-center bg-white w-full py-2 border border-slate-200 relative group/btn">
            <span className="text-slate-900 text-lg font-black">{conductedLectures}</span>
            <span className="text-[10px] text-slate-500">Conducted</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onInlineUpdate('conductedLectures', conductedLectures + 1); }}
              className="absolute top-1 right-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full p-1 opacity-0 group-hover/btn:opacity-100 transition-all shadow-sm"
              title="Add Conducted Lecture"
            >
              <FaPlus size={10} />
            </button>
          </div>
          <div className="flex flex-col items-center bg-white w-full py-2 rounded-r-xl border-y border-r border-slate-200">
            <span className="text-slate-900 text-lg font-black">{totalLectures}</span>
            <span className="text-[10px] text-slate-500">Total</span>
          </div>
        </div>
      </div>

      {/* PDF & Academic Notes Section */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 z-10">
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-2">
            <FaFilePdf className="text-red-500 text-sm" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Lecture Notes & Syllabus ({documents.length})
            </h4>
          </div>
          <label 
            onClick={(e) => e.stopPropagation()} 
            className="cursor-pointer bg-primary hover:bg-indigo-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm transition-all active:scale-95"
          >
            {isUploading ? 'Uploading...' : <><FaUpload size={10} /> Upload PDF</>}
            <input type="file" accept=".pdf" className="hidden" onChange={handleCardFileUpload} disabled={isUploading} />
          </label>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-2.5 bg-white rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 font-medium">No PDFs attached yet</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                onClick={(e) => handleViewPdf(e, doc.id)}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-xs font-medium text-slate-800 group/pdf"
                title={doc.name}
              >
                <div className="flex items-center gap-2 truncate">
                  <FaFilePdf className="text-red-500 shrink-0 text-xs" />
                  <span className="truncate">{doc.name}</span>
                </div>
                <FaExternalLinkAlt className="text-slate-400 group-hover/pdf:text-primary shrink-0 ml-1 text-[10px]" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Stats Row */}
      <div className="flex gap-3 z-10 pt-1">
        <div className="flex-1 bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Tasks</span>
          <span className="text-lg font-black text-slate-800">
            {assignments.length + labs.length}
          </span>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">PDFs</span>
          <span className="text-lg font-black text-slate-800">
            {documents.length}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default ModuleCard;