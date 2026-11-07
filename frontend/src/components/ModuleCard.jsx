import React, { useState } from 'react';
import { FaTrash, FaPlus, FaFilePdf, FaUpload, FaExternalLinkAlt } from 'react-icons/fa';
import { getDeptMeta } from '../utils/theme';

const getGradeStyle = (grade) => {
  if (!grade) return 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
  if (grade.startsWith('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70';
  if (grade.startsWith('B')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/70';
  if (grade.startsWith('C')) return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70';
  if (grade === 'E' || grade === 'F') return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/70';
  return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
};

const getCreditsFromCode = (code, override) => {
  if (override !== null && override !== undefined && override !== '') return override;
  const match = (code || '').match(/\d+/);
  if (match && match[0].length >= 2) {
    const c = parseInt(match[0].charAt(1), 10);
    return isNaN(c) ? null : c;
  }
  return null;
};

function ModuleCard({ module = {}, onOpenEdit, onInlineUpdate, onDelete }) {
  const {
    _id,
    id,
    moduleName = 'Untitled',
    moduleCode = '',
    totalLectures = 0,
    conductedLectures = 0,
    attendedLectures = 0,
    creditsOverride = null,
    assignments = [],
    labs = [],
    documents = [],
    moduleResults = []
  } = module;

  const moduleId = _id || id;
  const [isUploading, setIsUploading] = useState(false);
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  const dept = getDeptMeta(moduleCode);

  const attendancePercentage = conductedLectures > 0 
    ? Math.round((attendedLectures / conductedLectures) * 100)
    : 0;

  let attendanceStatus = 'safe';
  if (attendancePercentage < 80) attendanceStatus = 'danger';
  if (conductedLectures === 0) attendanceStatus = 'neutral';

  const latestResult = moduleResults.length > 0 
    ? moduleResults[moduleResults.length - 1] 
    : null;
  const finalGrade = latestResult?.grade || null;
  const credits = getCreditsFromCode(moduleCode, creditsOverride);

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
    <div 
      className={`bg-white dark:bg-[#121215] rounded-xl p-5 flex flex-col justify-between gap-4 border border-zinc-200/90 dark:border-zinc-800/90 border-t-[3px] ${dept.borderTop} hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-150 cursor-pointer group shadow-[0_1px_2px_rgba(0,0,0,0.03)]`}
      onClick={onOpenEdit}
    >
      {/* Top Header: Code, Credits, Grade, Delete */}
      <div>
        <div className="flex justify-between items-center gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${dept.codeBadge}`}>
              {moduleCode || 'NO-CODE'}
            </span>
            {credits !== null && (
              <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 bg-zinc-100/80 dark:bg-zinc-800/70 rounded">
                {credits} Cr
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {finalGrade && (
              <span className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded border ${getGradeStyle(finalGrade)}`}>
                {finalGrade}
              </span>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(moduleId); }}
              className="text-zinc-300 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100"
              title="Delete Module"
            >
              <FaTrash size={11} />
            </button>
          </div>
        </div>

        <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 min-h-[2.6rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {moduleName}
        </h3>
      </div>

      {/* Attendance Section */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">Attendance</span>
          <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
            <span className="text-zinc-500 dark:text-zinc-400">{attendedLectures}/{conductedLectures}</span>
            {conductedLectures > 0 && (
              <span className={`font-semibold ${
                attendanceStatus === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                ({attendancePercentage}%)
              </span>
            )}
          </div>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 mb-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              attendanceStatus === 'danger' ? 'bg-red-500' :
              attendanceStatus === 'safe' ? 'bg-emerald-500' :
              'bg-zinc-300 dark:bg-zinc-700'
            }`} 
            style={{ width: `${Math.min(100, attendancePercentage)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
          <div className="bg-zinc-50/80 dark:bg-zinc-900/80 py-1.5 px-2 rounded border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-sans">Attended</span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">{attendedLectures}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onInlineUpdate('attendedLectures', attendedLectures + 1); }}
              className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded p-1 transition-colors"
              title="Increment Attended"
            >
              <FaPlus size={9} />
            </button>
          </div>

          <div className="bg-zinc-50/80 dark:bg-zinc-900/80 py-1.5 px-2 rounded border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-sans">Held</span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">{conductedLectures}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onInlineUpdate('conductedLectures', conductedLectures + 1); }}
              className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded p-1 transition-colors"
              title="Increment Conducted"
            >
              <FaPlus size={9} />
            </button>
          </div>

          <div className="bg-zinc-50/80 dark:bg-zinc-900/80 py-1.5 px-2 rounded border border-zinc-200/70 dark:border-zinc-800 text-left">
            <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-sans">Target</span>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">{totalLectures}</span>
          </div>
        </div>
      </div>

      {/* Footer: PDFs & Coursework */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
          <span>
            <strong className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{assignments.length + labs.length}</strong> Tasks
          </span>
          <span>·</span>
          <span>
            <strong className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">{documents.length}</strong> PDFs
          </span>
        </div>

        <label 
          onClick={(e) => e.stopPropagation()} 
          className="cursor-pointer text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/60 text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
        >
          {isUploading ? 'Indexing...' : <><FaUpload size={9} /> Add PDF</>}
          <input type="file" accept=".pdf" className="hidden" onChange={handleCardFileUpload} disabled={isUploading} />
        </label>
      </div>

      {documents.length > 0 && (
        <div className="space-y-1 max-h-20 overflow-y-auto pt-1">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              onClick={(e) => handleViewPdf(e, doc.id)}
              className="flex items-center justify-between px-2 py-1 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200/60 dark:border-zinc-800 hover:border-blue-400 transition-colors text-[11px] text-zinc-700 dark:text-zinc-300"
              title={doc.name}
            >
              <div className="flex items-center gap-1.5 truncate">
                <FaFilePdf className="text-red-500 shrink-0 text-[10px]" />
                <span className="truncate">{doc.name}</span>
              </div>
              <FaExternalLinkAlt className="text-zinc-400 shrink-0 ml-1 text-[9px]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ModuleCard;
