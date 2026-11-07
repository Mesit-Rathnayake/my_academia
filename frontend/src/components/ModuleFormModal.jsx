import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaUpload, FaFilePdf } from 'react-icons/fa';
import { motion } from 'framer-motion';
import CustomSelect from './CustomSelect';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.12 }}
        className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{initialData ? 'Edit Course Module' : 'Register New Module'}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Configure attendance, grading attempts, coursework, and PDFs</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xl leading-none">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-3.5 py-2.5 rounded-lg mb-5 text-xs font-medium">{error}</div>}
          
          <form id="module-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Core Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Module Title</label>
                <input className="glass-input w-full px-3 py-2 rounded-lg text-xs" value={moduleName} onChange={(e) => setModuleName(e.target.value)} required placeholder="e.g. Data Structures" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Module Code</label>
                <input className="glass-input w-full px-3 py-2 rounded-lg text-xs font-mono uppercase" value={moduleCode} onChange={(e) => setModuleCode(e.target.value)} required placeholder="e.g. EC3202" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Semester</label>
                <CustomSelect 
                  className="glass-input w-full px-3 py-2 rounded-lg text-xs font-medium" 
                  value={semester} 
                  onChange={setSemester}
                  options={[1, 2, 3, 4, 5, 6, 7, 8].map(sem => ({ value: sem, label: `Semester 0${sem}` }))}
                />
              </div>
            </div>

            {/* Academic Results */}
            <div className="bg-zinc-50/80 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider">Examination Results & Attempts</h3>
                </div>
                <button type="button" onClick={addResult} className="text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <FaPlus size={9} /> Add Attempt
                </button>
              </div>
              <div className="space-y-2.5">
                {moduleResults.map((r, i) => (
                  <div key={i} className="bg-white dark:bg-[#121215] p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 relative group">
                    <button type="button" onClick={() => removeResult(i)} className="absolute top-3 right-3 text-zinc-400 hover:text-red-600">
                      <FaTrash size={11} />
                    </button>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end pr-6">
                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">Attempt #</label>
                        <input type="number" min="1" className="glass-input w-full px-2.5 py-1.5 rounded text-xs font-mono" value={r.attemptNumber} onChange={(e) => updateResult(i, 'attemptNumber', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">Grade</label>
                        <input className="glass-input w-full px-2.5 py-1.5 rounded text-xs font-mono uppercase font-bold" value={r.grade || ''} onChange={(e) => updateResult(i, 'grade', e.target.value.toUpperCase())} placeholder="A+, B-, C+" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">Marks (Opt)</label>
                        <input type="number" min="0" max="100" className="glass-input w-full px-2.5 py-1.5 rounded text-xs font-mono" value={r.marks || ''} onChange={(e) => updateResult(i, 'marks', e.target.value)} placeholder="0–100" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-500 mb-1">Academic Year</label>
                        <input className="glass-input w-full px-2.5 py-1.5 rounded text-xs font-mono" value={r.academicYear || ''} onChange={(e) => updateResult(i, 'academicYear', e.target.value)} placeholder="2025/26" />
                      </div>
                      <div className="flex items-center pb-1.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={r.isProperAttempt} onChange={(e) => updateResult(i, 'isProperAttempt', e.target.checked)} className="w-3.5 h-3.5 accent-blue-600 rounded border-zinc-300" />
                          <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium whitespace-nowrap">Proper Attempt</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                {moduleResults.length === 0 && <p className="text-zinc-400 text-xs text-center py-2">No grade recorded yet.</p>}
              </div>
            </div>

            {/* Attendance */}
            <div className="bg-zinc-50/80 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider mb-3">Lecture Attendance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Expected Total Lectures</label>
                  <input type="number" min="0" className="glass-input w-full px-3 py-2 rounded-lg text-xs font-mono" value={totalLectures} onChange={(e) => setTotalLectures(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Lectures Conducted</label>
                  <input type="number" min="0" className="glass-input w-full px-3 py-2 rounded-lg text-xs font-mono" value={conductedLectures} onChange={(e) => setConductedLectures(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Lectures Attended</label>
                  <input type="number" min="0" className="glass-input w-full px-3 py-2 rounded-lg text-xs font-mono" value={attendedLectures} onChange={(e) => setAttendedLectures(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Documents Upload */}
            {initialData ? (
              <div className="bg-zinc-50/80 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider">Lecture PDFs ({documents.length})</h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Indexed automatically for Course AI citations</p>
                  </div>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors">
                    {uploading ? 'Indexing...' : <><FaUpload size={10} /> Upload PDF</>}
                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                  </label>
                </div>
                {documents.length === 0 ? (
                  <p className="text-zinc-400 text-xs">No PDFs attached to this module yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#121215] rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FaFilePdf className="text-red-600 shrink-0" />
                          <span className="text-zinc-800 dark:text-zinc-200 truncate" title={doc.name}>{doc.name}</span>
                        </div>
                        <button type="button" onClick={() => handleDeleteDocument(doc.id)} className="text-zinc-400 hover:text-red-600 p-1 shrink-0">
                          <FaTrash size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Tasks (Assignments & Labs) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Assignments */}
              <div className="bg-zinc-50/80 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider">Assignments</h3>
                  <button type="button" onClick={addAssignment} className="text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <FaPlus size={9} /> Add
                  </button>
                </div>
                <div className="space-y-2.5">
                  {assignments.map((a, i) => (
                    <div key={i} className="bg-white dark:bg-[#121215] p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 relative">
                      <button type="button" onClick={() => removeAssignment(i)} className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-red-600">
                        <FaTrash size={11} />
                      </button>
                      <input className="glass-input w-[88%] px-2.5 py-1.5 rounded text-xs mb-2 font-medium" value={a.name} onChange={(e) => updateAssignment(i, 'name', e.target.value)} placeholder={`Assignment ${i+1}`} />
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-0.5">Status</label>
                          <CustomSelect 
                            className="glass-input w-full px-2 py-1 rounded text-xs" 
                            value={a.status} 
                            onChange={(val) => updateAssignment(i, 'status', val)}
                            options={['Pending', 'Submitted', 'Graded'].map(s => ({ value: s, label: s }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-0.5">Due Date</label>
                          <input type="date" className="glass-input w-full px-2 py-1 rounded text-xs font-mono" value={a.dueDate ? a.dueDate.split('T')[0] : ''} onChange={(e) => updateAssignment(i, 'dueDate', e.target.value)} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input type="number" className="glass-input w-full px-2.5 py-1 rounded text-xs font-mono" value={a.marks ?? ''} onChange={(e) => updateAssignment(i, 'marks', e.target.value)} placeholder="Score" />
                        <span className="text-zinc-400 text-xs">/</span>
                        <input type="number" className="glass-input w-full px-2.5 py-1 rounded text-xs font-mono" value={a.totalMarks ?? ''} onChange={(e) => updateAssignment(i, 'totalMarks', e.target.value)} placeholder="Max" />
                      </div>
                    </div>
                  ))}
                  {assignments.length === 0 && <p className="text-zinc-400 text-xs text-center py-2">No assignments added.</p>}
                </div>
              </div>

              {/* Labs */}
              <div className="bg-zinc-50/80 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase font-mono tracking-wider">Laboratories</h3>
                  <button type="button" onClick={addLab} className="text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <FaPlus size={9} /> Add
                  </button>
                </div>
                <div className="space-y-2.5">
                  {labs.map((l, i) => (
                    <div key={i} className="bg-white dark:bg-[#121215] p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 relative">
                      <button type="button" onClick={() => removeLab(i)} className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-red-600">
                        <FaTrash size={11} />
                      </button>
                      <input className="glass-input w-[88%] px-2.5 py-1.5 rounded text-xs mb-2 font-medium" value={l.name} onChange={(e) => updateLab(i, 'name', e.target.value)} placeholder={`Lab ${i+1}`} />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-0.5">Status</label>
                          <CustomSelect 
                            className="glass-input w-full px-2 py-1 rounded text-xs" 
                            value={l.status} 
                            onChange={(val) => updateLab(i, 'status', val)}
                            options={['Pending', 'Conducted', 'Graded'].map(s => ({ value: s, label: s }))}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-0.5">Date</label>
                          <input type="date" className="glass-input w-full px-2 py-1 rounded text-xs font-mono" value={l.dueDate ? l.dueDate.split('T')[0] : ''} onChange={(e) => updateLab(i, 'dueDate', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {labs.length === 0 && <p className="text-zinc-400 text-xs text-center py-2">No labs added.</p>}
                </div>
              </div>
            </div>

            {/* Credit Rules */}
            <div className="bg-zinc-50/80 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" id="isGpaCounted" checked={isGpaCounted} onChange={(e) => setIsGpaCounted(e.target.checked)} className="w-4 h-4 accent-blue-600 rounded border-zinc-300" />
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Count module toward Cumulative GPA</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-nowrap">Credits Override:</label>
                <input type="number" step="0.5" min="0" className="glass-input w-24 px-2.5 py-1.5 rounded text-xs font-mono" value={creditsOverride} onChange={(e) => setCreditsOverride(e.target.value)} placeholder="Auto" />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700 text-xs"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="module-form" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors text-xs shadow-xs"
          >
            {initialData ? 'Save Changes' : 'Create Module'}
          </button>
        </div>
      </motion.div>
      
      <ConfirmModal 
        isOpen={!!docToDelete}
        title="Remove PDF Document"
        message="Are you sure you want to remove this PDF from the module?"
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
