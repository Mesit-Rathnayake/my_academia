import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaUpload, FaFilePdf } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

function ModuleFormModal({ onClose, onSubmit, initialData = null }) {
  const [moduleName, setModuleName] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [semester, setSemester] = useState(1);
  const [totalLectures, setTotalLectures] = useState(0);
  const [conductedLectures, setConductedLectures] = useState(0);
  const [attendedLectures, setAttendedLectures] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isGpaCounted, setIsGpaCounted] = useState(true);
  const [creditsOverride, setCreditsOverride] = useState('');
  const [moduleResults, setModuleResults] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    if (initialData) {
      setModuleName(initialData.moduleName || '');
      setModuleCode(initialData.moduleCode || '');
      setSemester(initialData.semester || 1);
      setTotalLectures(initialData.totalLectures || 0);
      setConductedLectures(initialData.conductedLectures || 0);
      setAttendedLectures(initialData.attendedLectures || 0);
      setAssignments(initialData.assignments ? [...initialData.assignments] : []);
      setLabs(initialData.labs ? [...initialData.labs] : []);
      setDocuments(initialData.documents ? [...initialData.documents] : []);
      setIsGpaCounted(initialData.isGpaCounted !== false);
      setCreditsOverride(initialData.creditsOverride || '');
      setModuleResults(initialData.moduleResults ? [...initialData.moduleResults] : []);
    } else {
      setModuleName('');
      setModuleCode('');
      setSemester(1);
      setTotalLectures(0);
      setConductedLectures(0);
      setAttendedLectures(0);
      setAssignments([]);
      setLabs([]);
      setDocuments([]);
      setIsGpaCounted(true);
      setCreditsOverride('');
      setModuleResults([]);
    }
  }, [initialData]);

  const addResult = () => {
    const nextAttempt = moduleResults.length > 0 ? Math.max(...moduleResults.map(r => r.attemptNumber)) + 1 : 1;
    setModuleResults([...moduleResults, { attemptNumber: nextAttempt, marks: '', grade: '', isProperAttempt: true, academicYear: '' }]);
  };
  const removeResult = (i) => setModuleResults(moduleResults.filter((_, idx) => idx !== i));
  const updateResult = (i, key, val) => {
    const copy = [...moduleResults];
    copy[i] = { ...copy[i], [key]: val };
    setModuleResults(copy);
  };

  const addAssignment = () => setAssignments([...assignments, { name: '', marks: null, totalMarks: null, dueDate: '', status: 'Pending' }]);
  const removeAssignment = (i) => setAssignments(assignments.filter((_, idx) => idx !== i));
  const updateAssignment = (i, key, val) => {
    const copy = [...assignments];
    copy[i] = { ...copy[i], [key]: (key === 'marks' || key === 'totalMarks') ? (val === '' ? null : Number(val)) : val };
    setAssignments(copy);
  };

  const addLab = () => setLabs([...labs, { name: '', marks: null, totalMarks: null, dueDate: '', status: 'Pending' }]);
  const removeLab = (i) => setLabs(labs.filter((_, idx) => idx !== i));
  const updateLab = (i, key, val) => {
    const copy = [...labs];
    copy[i] = { ...copy[i], [key]: (key === 'marks' || key === 'totalMarks') ? (val === '' ? null : Number(val)) : val };
    setLabs(copy);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !initialData?._id) return;
    
    try {
      setUploading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${apiBaseUrl}/api/modules/${initialData._id}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to upload');
      
      setDocuments([...documents, data.document]);
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDeleteDocument = (docId) => {
    setDocToDelete(docId);
  };

  const confirmDeleteDocument = async () => {
    if (!docToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/modules/${initialData._id}/documents/${docToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete');
      setDocuments(documents.filter(d => d.id !== docToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      setDocToDelete(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const errors = [];
    if (!moduleName.trim()) errors.push('Module name is required');
    if (!moduleCode.trim()) errors.push('Module code is required');
    
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }

    const moduleData = {
      moduleName: moduleName.trim(),
      moduleCode: moduleCode.trim(),
      semester: Number(semester) || 1,
      totalLectures: Number(totalLectures) || 0,
      conductedLectures: Number(conductedLectures) || 0,
      attendedLectures: Number(attendedLectures) || 0,
      assignments: assignments.map(a => ({
        name: a.name.trim() || 'Untitled',
        marks: a.marks === null ? null : Number(a.marks),
        totalMarks: a.totalMarks === null ? null : Number(a.totalMarks),
        dueDate: a.dueDate || null,
        status: a.status || 'Pending'
      })),
      labs: labs.map(l => ({
        name: l.name.trim() || 'Untitled',
        marks: l.marks === null ? null : Number(l.marks),
        totalMarks: l.totalMarks === null ? null : Number(l.totalMarks),
        dueDate: l.dueDate || null,
        status: l.status || 'Pending'
      })),
      isGpaCounted,
      creditsOverride: creditsOverride === '' ? null : Number(creditsOverride),
      moduleResults: moduleResults.map(r => ({
        attemptNumber: Number(r.attemptNumber) || 1,
        marks: r.marks === '' ? null : Number(r.marks),
        grade: r.grade || null,
        isProperAttempt: r.isProperAttempt,
        academicYear: r.academicYear || null
      }))
    };

    onSubmit(moduleData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="glass-panel w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/40">
          <h2 className="text-2xl font-bold text-white">{initialData ? 'Edit Module' : 'Add Module'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl mb-6">{error}</div>}
          
          <form id="module-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Module Name</label>
                <input className="glass-input w-full px-4 py-3 rounded-xl" value={moduleName} onChange={(e) => setModuleName(e.target.value)} required placeholder="e.g. Data Structures" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Module Code</label>
                <input className="glass-input w-full px-4 py-3 rounded-xl" value={moduleCode} onChange={(e) => setModuleCode(e.target.value)} required placeholder="e.g. CS101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Semester</label>
                <select className="glass-input w-full px-4 py-3 rounded-xl" value={semester} onChange={(e) => setSemester(e.target.value)}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendance */}
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Attendance Tracking</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Total Lectures (Expected)</label>
                  <input type="number" min="0" className="glass-input w-full px-4 py-3 rounded-xl" value={totalLectures} onChange={(e) => setTotalLectures(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Lectures Conducted</label>
                  <input type="number" min="0" className="glass-input w-full px-4 py-3 rounded-xl" value={conductedLectures} onChange={(e) => setConductedLectures(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Lectures Attended</label>
                  <input type="number" min="0" className="glass-input w-full px-4 py-3 rounded-xl" value={attendedLectures} onChange={(e) => setAttendedLectures(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Documents Upload (Only in Edit Mode) */}
            {initialData ? (
              <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Lecture Notes (PDFs)</h3>
                  <label className="glass-button cursor-pointer px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                    {uploading ? 'Uploading...' : <><FaUpload /> Upload PDF</>}
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>
                {documents.length === 0 ? (
                  <p className="text-slate-500 text-sm">No notes uploaded yet. Upload a PDF to chat with it.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                        <div className="flex items-center gap-3 truncate">
                          <FaFilePdf className="text-red-400 text-xl shrink-0" />
                          <span className="text-slate-200 text-sm truncate" title={doc.name}>{doc.name}</span>
                        </div>
                        <button type="button" onClick={() => handleDeleteDocument(doc.id)} className="text-slate-500 hover:text-red-400 p-2 shrink-0">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50 border-dashed text-center">
                <p className="text-slate-400 text-sm">Save this module first to upload and chat with lecture notes.</p>
              </div>
            )}

            {/* Tasks (Assignments & Labs) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assignments */}
              <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Assignments</h3>
                  <button type="button" onClick={addAssignment} className="text-primary hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
                    <FaPlus size={12} /> Add
                  </button>
                </div>
                <div className="space-y-4">
                  {assignments.map((a, i) => (
                    <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30 relative group">
                      <button type="button" onClick={() => removeAssignment(i)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaTrash size={14} />
                      </button>
                      <input className="glass-input w-[90%] px-3 py-2 rounded-lg text-sm mb-3 font-semibold" value={a.name} onChange={(e) => updateAssignment(i, 'name', e.target.value)} placeholder={`Assignment ${i+1}`} />
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Status</label>
                          <select className="glass-input w-full px-2 py-1.5 rounded-lg text-xs" value={a.status} onChange={(e) => updateAssignment(i, 'status', e.target.value)}>
                            <option value="Pending">Pending</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Graded">Graded</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Due Date</label>
                          <input type="date" className="glass-input w-full px-2 py-1.5 rounded-lg text-xs" value={a.dueDate ? a.dueDate.split('T')[0] : ''} onChange={(e) => updateAssignment(i, 'dueDate', e.target.value)} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" className="glass-input w-full px-3 py-2 rounded-lg text-sm" value={a.marks ?? ''} onChange={(e) => updateAssignment(i, 'marks', e.target.value)} placeholder="Marks" />
                        <span className="text-slate-500">/</span>
                        <input type="number" className="glass-input w-full px-3 py-2 rounded-lg text-sm" value={a.totalMarks ?? ''} onChange={(e) => updateAssignment(i, 'totalMarks', e.target.value)} placeholder="Total" />
                      </div>
                    </div>
                  ))}
                  {assignments.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No assignments added.</p>}
                </div>
              </div>

              {/* Labs */}
              <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Labs</h3>
                  <button type="button" onClick={addLab} className="text-primary hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
                    <FaPlus size={12} /> Add
                  </button>
                </div>
                <div className="space-y-4">
                  {labs.map((l, i) => (
                    <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30 relative group">
                      <button type="button" onClick={() => removeLab(i)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaTrash size={14} />
                      </button>
                      <input className="glass-input w-[90%] px-3 py-2 rounded-lg text-sm mb-3 font-semibold" value={l.name} onChange={(e) => updateLab(i, 'name', e.target.value)} placeholder={`Lab ${i+1}`} />
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Status</label>
                          <select className="glass-input w-full px-2 py-1.5 rounded-lg text-xs" value={l.status} onChange={(e) => updateLab(i, 'status', e.target.value)}>
                            <option value="Pending">Pending</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Graded">Graded</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Due Date</label>
                          <input type="date" className="glass-input w-full px-2 py-1.5 rounded-lg text-xs" value={l.dueDate ? l.dueDate.split('T')[0] : ''} onChange={(e) => updateLab(i, 'dueDate', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {labs.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No labs added.</p>}
                </div>
              </div>
            </div>

            {/* GPA Settings */}
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Academic Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isGpaCounted" checked={isGpaCounted} onChange={(e) => setIsGpaCounted(e.target.checked)} className="w-5 h-5 accent-emerald-500 rounded bg-slate-700 border-slate-600 focus:ring-emerald-500" />
                  <label htmlFor="isGpaCounted" className="text-sm font-medium text-slate-300">Include in GPA Calculation (GPA Counted)</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Credits Override (Leave blank to auto-detect)</label>
                  <input type="number" step="0.5" min="0" className="glass-input w-full px-4 py-2 rounded-xl" value={creditsOverride} onChange={(e) => setCreditsOverride(e.target.value)} placeholder="e.g. 3" />
                </div>
              </div>
            </div>

            {/* Academic Results */}
            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Academic Results (Attempts)</h3>
                <button type="button" onClick={addResult} className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-bold flex items-center gap-1">
                  <FaPlus size={12} /> Add Attempt
                </button>
              </div>
              <div className="space-y-4">
                {moduleResults.map((r, i) => (
                  <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 relative group">
                    <button type="button" onClick={() => removeResult(i)} className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaTrash size={14} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end pr-8">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Attempt #</label>
                        <input type="number" min="1" className="glass-input w-full px-3 py-2 rounded-lg text-sm" value={r.attemptNumber} onChange={(e) => updateResult(i, 'attemptNumber', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Grade</label>
                        <input className="glass-input w-full px-3 py-2 rounded-lg text-sm uppercase" value={r.grade || ''} onChange={(e) => updateResult(i, 'grade', e.target.value.toUpperCase())} placeholder="e.g. A+" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Marks (Optional)</label>
                        <input type="number" min="0" max="100" className="glass-input w-full px-3 py-2 rounded-lg text-sm" value={r.marks || ''} onChange={(e) => updateResult(i, 'marks', e.target.value)} placeholder="0-100" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Academic Year</label>
                        <input className="glass-input w-full px-3 py-2 rounded-lg text-sm" value={r.academicYear || ''} onChange={(e) => updateResult(i, 'academicYear', e.target.value)} placeholder="e.g. 2024/2025" />
                      </div>
                      <div className="flex items-center h-full pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={r.isProperAttempt} onChange={(e) => updateResult(i, 'isProperAttempt', e.target.checked)} className="w-4 h-4 accent-emerald-500 rounded bg-slate-700" />
                          <span className="text-xs text-slate-300 font-medium whitespace-nowrap">Proper Attempt</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                {moduleResults.length === 0 && <p className="text-slate-500 text-sm text-center py-2">No results recorded for this module yet.</p>}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-700/50 bg-slate-800/80 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-300 font-medium hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button type="submit" form="module-form" className="glass-button px-8 py-3 rounded-xl font-medium shadow-lg">
            {initialData ? 'Save Changes' : 'Create Module'}
          </button>
        </div>
      </motion.div>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!docToDelete}
        title="Delete Document"
        message="Are you sure you want to delete this document? This will remove it from the module."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={confirmDeleteDocument}
        onCancel={() => setDocToDelete(null)}
      />
    </div>
  );
}

export default ModuleFormModal;