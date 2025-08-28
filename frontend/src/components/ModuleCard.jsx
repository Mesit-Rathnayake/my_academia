import React from 'react';
import '../styles/ModuleCard.css';

function ModuleCard({ module = {}, onOpenEdit, onInlineUpdate, onDelete }) {
  const {
    moduleName = 'Untitled',
    moduleCode = '',
    lectureHours = 0,
    attendedHours = 0,
    assignments = [],
    labs = []
  } = module;

  // Calculate attendance percentage
  const attendancePercentage = lectureHours > 0 
    ? Math.round((attendedHours / lectureHours) * 100)
    : 0;

  const increaseAttendance = () => {
    onInlineUpdate('attendedHours', (attendedHours || 0) + 1);
  };

  const decreaseAttendance = () => {
    const newVal = Math.max(0, (attendedHours || 0) - 1);
    onInlineUpdate('attendedHours', newVal);
  };

  const updateAssignmentMarks = (aIndex, newMarks) => {
    onInlineUpdate(`assignment:${aIndex}:marks`, newMarks === '' ? null : Number(newMarks));
  };

  const toggleLabCompleted = (lIndex, checked) => {
    onInlineUpdate(`lab:${lIndex}:completed`, checked);
  };

  return (
    <div className="module-card" onDoubleClick={onOpenEdit}>
      <div className="card-header">
        <h3>{moduleName}</h3>
        <span className="code">{moduleCode}</span>
      </div>

      <div className="card-section attendance">
        <label>Attendance</label>
        <div className="attendance-display">
          <div className="counter">
            <button onClick={decreaseAttendance} type="button">-</button>
            <span>{attendedHours} / {lectureHours}</span>
            <button onClick={increaseAttendance} type="button">+</button>
          </div>
          <div className="attendance-percentage">
            {attendancePercentage}%
          </div>
        </div>
      </div>

      <div className="card-section">
        <label>Assignments</label>
        <div className="assignments-list">
          {assignments && assignments.length > 0 ? assignments.map((a, i) => (
            <div className="assignment-row" key={i}>
              <div className="assignment-name">{a.name || `Assignment ${i+1}`}</div>
              <div className="assignment-controls">
                <input
                  type="number"
                  min="0"
                  placeholder="marks"
                  value={a.marks ?? ''}
                  onChange={(e) => updateAssignmentMarks(i, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )) : <div className="muted">No assignments</div>}
        </div>
      </div>

      <div className="card-section">
        <label>Labs</label>
        <div className="labs-list">
          {labs && labs.length > 0 ? labs.map((l, i) => (
            <div className="lab-row" key={i}>
              <div className="lab-name">{l.name || `Lab ${i+1}`}</div>
              <input
                type="checkbox"
                checked={!!l.completed}
                onChange={(e) => toggleLabCompleted(i, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )) : <div className="muted">No labs</div>}
        </div>
      </div>

      <div className="card-actions">
        <button onClick={(e) => { 
          e.stopPropagation(); 
          onOpenEdit(); 
        }}>
          Edit
        </button>
        <button 
          onClick={(e) => { 
            e.stopPropagation();
            if (window.confirm('Are you sure you want to delete this module?')) {
              onDelete(module._id);
            }
          }}
          className="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ModuleCard;