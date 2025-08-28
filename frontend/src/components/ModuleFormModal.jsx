import React, { useState, useEffect } from 'react';
import '../styles/ModuleFormModal.css';

function ModuleFormModal({ onClose, onSubmit, initialData = null }) {
  const [moduleName, setModuleName] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [lectureHours, setLectureHours] = useState(0);
  const [attendedHours, setAttendedHours] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setModuleName(initialData.moduleName || '');
      setModuleCode(initialData.moduleCode || '');
      setLectureHours(initialData.lectureHours || 0);
      setAttendedHours(initialData.attendedHours || 0);
      setAssignments(initialData.assignments ? [...initialData.assignments] : []);
      setLabs(initialData.labs ? [...initialData.labs] : []);
    } else {
      setModuleName('');
      setModuleCode('');
      setLectureHours(0);
      setAttendedHours(0);
      setAssignments([]);
      setLabs([]);
    }
  }, [initialData]);

  const addAssignment = () => setAssignments([...assignments, { name: '', marks: null }]);
  const removeAssignment = (i) => setAssignments(assignments.filter((_, idx) => idx !== i));
  const updateAssignment = (i, key, val) => {
    const copy = [...assignments];
    copy[i] = { ...copy[i], [key]: key === 'marks' ? (val === '' ? null : Number(val)) : val };
    setAssignments(copy);
  };

  const addLab = () => setLabs([...labs, { name: '', completed: false }]);
  const removeLab = (i) => setLabs(labs.filter((_, idx) => idx !== i));
  const updateLab = (i, key, val) => {
    const copy = [...labs];
    copy[i] = { ...copy[i], [key]: key === 'completed' ? !!val : val };
    setLabs(copy);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const errors = [];
    if (!moduleName.trim()) errors.push('Module name is required');
    if (!moduleCode.trim()) errors.push('Module code is required');
    
    assignments.forEach((a, i) => {
      if (!a.name.trim()) errors.push(`Assignment ${i + 1} name is required`);
    });

    labs.forEach((l, i) => {
      if (!l.name.trim()) errors.push(`Lab ${i + 1} name is required`);
    });

    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }

    const moduleData = {
      moduleName: moduleName.trim(),
      moduleCode: moduleCode.trim(),
      lectureHours: Number(lectureHours) || 0,
      attendedHours: Number(attendedHours) || 0,
      assignments: assignments.map(a => ({
        name: a.name.trim(),
        marks: a.marks === null ? null : Number(a.marks)
      })),
      labs: labs.map(l => ({
        name: l.name.trim(),
        completed: !!l.completed
      }))
    };

    onSubmit(moduleData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content form-modal">
        <h2>{initialData ? 'Edit Module' : 'Add Module'}</h2>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row" style={{ alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="moduleName">Module Name:</label>
              <input
                id="moduleName"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                required
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="moduleCode">Module Code:</label>
              <input
                id="moduleCode"
                value={moduleCode}
                onChange={(e) => setModuleCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row" style={{ alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="lectureHours">Total Lecture Hours:</label>
              <input
                id="lectureHours"
                type="number"
                value={lectureHours}
                onChange={(e) => setLectureHours(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="row" style={{ alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <label htmlFor="attendedHours">Attended Hours:</label>
              <input
                id="attendedHours"
                type="number"
                value={attendedHours}
                onChange={(e) => setAttendedHours(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="section">
            <h4>Assignments</h4>
            {assignments.map((a, i) => (
              <div className="row" key={i}>
                <input
                  placeholder={`Assignment ${i + 1} name`}
                  value={a.name}
                  onChange={(e) => updateAssignment(i, 'name', e.target.value)}
                  required
                />
                <input
                  placeholder="marks (optional)"
                  type="number"
                  min="0"
                  value={a.marks ?? ''}
                  onChange={(e) => updateAssignment(i, 'marks', e.target.value)}
                />
                <button type="button" className="small-danger" onClick={() => removeAssignment(i)}>Remove</button>
              </div>
            ))}
            <button type="button" className="add-btn-inline" onClick={addAssignment}>+ Add Assignment</button>
          </div>

          <div className="section">
            <h4>Labs</h4>
            {labs.map((l, i) => (
              <div className="row" key={i}>
                <input
                  placeholder={`Lab ${i + 1} name`}
                  value={l.name}
                  onChange={(e) => updateLab(i, 'name', e.target.value)}
                  required
                />
                <label className="lab-checkbox">
                  <input
                    type="checkbox"
                    checked={!!l.completed}
                    onChange={(e) => updateLab(i, 'completed', e.target.checked)}
                  />
                  Completed
                </label>
                <button type="button" className="small-danger" onClick={() => removeLab(i)}>Remove</button>
              </div>
            ))}
            <button type="button" className="add-btn-inline" onClick={addLab}>+ Add Lab</button>
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-btn">{initialData ? 'Save Changes' : 'Add Module'}</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModuleFormModal;