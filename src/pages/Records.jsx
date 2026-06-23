import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/records.css';

const Records = () => {
  const navigate = useNavigate();

  // Initial placeholder records
  const [records, setRecords] = useState([
    {
      id: 1,
      date: '2026-06-12',
      completed: 'Yes',
      sideChecked: 'Both',
      feltNormal: 'Yes',
      changes: ['No unusual change noticed'],
      notes: 'No unusual change noticed.',
      reminder: 'Yes',
      savedDate: '2026-06-12, 8:15 AM'
    },
    {
      id: 2,
      date: '2026-05-12',
      completed: 'Yes',
      sideChecked: 'Left breast',
      feltNormal: 'No',
      changes: ['Breast pain'],
      notes: 'Slight pain near upper breast area.',
      reminder: 'Yes',
      savedDate: '2026-05-12, 7:42 PM'
    },
    {
      id: 3,
      date: '2026-04-12',
      completed: 'Yes',
      sideChecked: 'Both',
      feltNormal: 'Yes',
      changes: ['No unusual change noticed'],
      notes: 'Everything felt normal.',
      reminder: 'Yes',
      savedDate: '2026-04-12, 9:30 AM'
    },
    {
      id: 4,
      date: '2026-03-12',
      completed: 'Yes',
      sideChecked: 'Right breast',
      feltNormal: 'Yes',
      changes: ['No unusual change noticed'],
      notes: 'Everything felt the same.',
      reminder: 'Yes',
      savedDate: '2026-03-12, 10:15 AM'
    }
  ]);

  // Views: 'list' | 'detail' | 'edit' | 'empty'
  const [view, setView] = useState('list');
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Edit Form State
  const [editDate, setEditDate] = useState('');
  const [editCompleted, setEditCompleted] = useState('Yes');
  const [editSideChecked, setEditSideChecked] = useState('Both');
  const [editFeltNormal, setEditFeltNormal] = useState('Yes');
  const [editChanges, setEditChanges] = useState([]);
  const [editNotes, setEditNotes] = useState('');
  const [editReminder, setEditReminder] = useState('Yes');

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Available changes list
  const changesList = [
    'No unusual change noticed',
    'Lump or thickened area',
    'Breast pain',
    'Nipple discharge',
    'Nipple position change',
    'Skin dimpling or redness',
    'Swelling',
    'Change in breast shape or size',
    'Other'
  ];

  // Formatting date helper
  const formatDateString = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${day} ${months[monthIndex]} ${year}`;
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[monthIndex]} ${year}`;
  };

  // Switch View handlers
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setView('detail');
  };

  const handleStartEdit = (record) => {
    setSelectedRecord(record);
    setEditDate(record.date);
    setEditCompleted(record.completed);
    setEditSideChecked(record.sideChecked);
    setEditFeltNormal(record.feltNormal);
    setEditChanges(record.changes || []);
    setEditNotes(record.notes);
    setEditReminder(record.reminder);
    setView('edit');
  };

  // Checklist handler
  const handleCheckboxChange = (change) => {
    if (change === 'No unusual change noticed') {
      if (editChanges.includes(change)) {
        setEditChanges([]);
      } else {
        setEditChanges(['No unusual change noticed']);
      }
    } else {
      let updated = editChanges.filter(item => item !== 'No unusual change noticed');
      if (updated.includes(change)) {
        updated = updated.filter(item => item !== change);
      } else {
        updated.push(change);
      }
      setEditChanges(updated);
    }
  };

  // Save edit handler
  const handleSaveChanges = (e) => {
    e.preventDefault();
    const updatedRecords = records.map((rec) => {
      if (rec.id === selectedRecord.id) {
        return {
          ...rec,
          date: editDate,
          completed: editCompleted,
          sideChecked: editSideChecked,
          feltNormal: editFeltNormal,
          changes: editChanges.length > 0 ? editChanges : ['No unusual change noticed'],
          notes: editNotes,
          reminder: editReminder
        };
      }
      return rec;
    });

    setRecords(updatedRecords);
    // Find the updated record to keep in detail view
    const nextDetail = updatedRecords.find(r => r.id === selectedRecord.id);
    setSelectedRecord(nextDetail);
    setView('detail');
  };

  // Delete modal triggers
  const triggerDelete = (record) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      const remaining = records.filter(r => r.id !== recordToDelete.id);
      setRecords(remaining);
      setShowDeleteModal(false);
      setRecordToDelete(null);
      if (remaining.length === 0) {
        setView('empty');
      } else {
        setView('list');
      }
    }
  };

  // Calculated placeholders or stats
  const totalRecords = records.length;
  const lastCheck = records.length > 0 ? formatShortDate(records[0].date) : 'N/A';
  const nextReminder = records.length > 0 ? '12 Jul 2026' : 'N/A';
  const changesCount = records.filter(r => r.feltNormal === 'No' || r.feltNormal === 'Not sure').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Eyebrow and Page Headers */}
      <div>
        <p className="eyebrow">Section 04</p>
        <h2 className="h1">Self-Check <em>History</em></h2>
        <p className="dek">Review your past self-check records and keep track of what is normal for your body.</p>
      </div>

      <div className="notice">
        <b>About this page</b>
        Your history helps you remember what you noticed during each self-check. It does not diagnose breast cancer. If you notice unusual changes or feel worried, please visit a qualified healthcare provider.
      </div>

      {/* Demo State Switcher (as requested to follow the template's switch bar) */}
      <div className="view-switch">
        <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>List view</button>
        <button className={view === 'detail' ? 'on' : ''} onClick={() => { if (records.length > 0) { setSelectedRecord(records[0]); setView('detail'); } }}>Record details</button>
        <button className={view === 'edit' ? 'on' : ''} onClick={() => { if (records.length > 0) { handleStartEdit(records[0]); } }}>Edit record</button>
        <button className={view === 'empty' ? 'on' : ''} onClick={() => setView('empty')}>Empty state</button>
      </div>

      {/* ============ LIST VIEW ============ */}
      {view === 'list' && (
        <div className="view show">
          
          {/* Summary Row */}
          <div className="summary-row">
            <div className="sum-card">
              <span className="corner"></span>
              <p className="label">Total records</p>
              <p className="value">{totalRecords}</p>
            </div>
            <div className="sum-card alt">
              <span className="corner"></span>
              <p className="label">Last checked</p>
              <p className="value" style={{ fontSize: '18px' }}>{lastCheck}</p>
            </div>
            <div className="sum-card alt2">
              <span className="corner"></span>
              <p className="label">Next reminder</p>
              <p className="value" style={{ fontSize: '18px' }}>{nextReminder}</p>
            </div>
            <div className="sum-card">
              <span className="corner"></span>
              <p className="label">Changes to review</p>
              <p className={`value ${changesCount > 0 ? 'flag' : ''}`}>{changesCount}</p>
            </div>
          </div>

          <div className="section-head">
            <h3>Your records</h3>
            <div className="rule"></div>
            <span className="tag">{totalRecords} entries</span>
          </div>

          {/* Record Grid */}
          <div className="record-grid">
            {records.map((rec) => {
              const hasChanges = rec.feltNormal === 'No' || rec.feltNormal === 'Not sure';
              return (
                <div key={rec.id} className={`record ${hasChanges ? 'flagged' : ''}`}>
                  <span className="corner"></span>
                  <div className="record-top">
                    <p className="record-date">{formatDateString(rec.date)}</p>
                    <span className="status-pill">{rec.completed === 'Yes' ? 'Completed' : 'Incomplete'}</span>
                  </div>
                  <div className="meta-row">
                    <span>Checked: {rec.sideChecked}</span>
                  </div>
                  
                  <span className={`result-pill ${hasChanges ? 'changed' : ''}`}>
                    {rec.feltNormal === 'Yes' ? 'Normal for me' : rec.feltNormal === 'No' ? 'Change noticed' : 'Not sure'}
                  </span>
                  
                  <p className="notes">{rec.notes}</p>
                  
                  {hasChanges && (
                    <p className="support-tag">Consider speaking to a healthcare provider.</p>
                  )}
                  
                  <div className="record-actions">
                    <button className="btn-mini primary" onClick={() => handleViewDetails(rec)}>View details</button>
                    <button className="btn-mini" onClick={() => handleStartEdit(rec)}>Edit</button>
                    <button className="btn-mini danger" onClick={() => triggerDelete(rec)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ============ DETAIL VIEW ============ */}
      {view === 'detail' && selectedRecord && (
        <div className="view show">
          <div className="section-head">
            <h3>Record details</h3>
            <div className="rule"></div>
            <span className="tag">{formatDateString(selectedRecord.date)}</span>
          </div>
          
          <div className="detail-card">
            <div className="detail-row">
              <span className="k">Date of self-check</span>
              <span className="v">{formatDateString(selectedRecord.date)}</span>
            </div>
            <div className="detail-row">
              <span className="k">Guide completed</span>
              <span className="v">{selectedRecord.completed}</span>
            </div>
            <div className="detail-row">
              <span className="k">Side checked</span>
              <span className="v">{selectedRecord.sideChecked}</span>
            </div>
            <div className="detail-row">
              <span className="k">Felt normal</span>
              <span className="v">{selectedRecord.feltNormal}</span>
            </div>
            <div className="detail-row">
              <span className="k">Changes selected</span>
              <span className="v">{(selectedRecord.changes || []).join(', ')}</span>
            </div>
            <div className="detail-row">
              <span className="k">Notes</span>
              <span className="v">{selectedRecord.notes}</span>
            </div>
            <div className="detail-row">
              <span className="k">Reminder set</span>
              <span className="v">{selectedRecord.reminder === 'Yes' ? 'Yes — 12 Jul 2026' : 'No'}</span>
            </div>
            <div className="detail-row">
              <span className="k">Saved on</span>
              <span className="v">{selectedRecord.savedDate || `${formatDateString(selectedRecord.date)}, 12:00 PM`}</span>
            </div>

            <div className="detail-support">
              Some changes are not cancer, but it is important to have unusual changes checked by a healthcare provider.
            </div>

            <div className="detail-actions">
              <button className="btn-primary" onClick={() => handleStartEdit(selectedRecord)}>Edit record</button>
              <button className="btn-secondary" onClick={() => navigate('/clinics')}>Find a clinic</button>
            </div>
            <div className="detail-actions">
              <button className="btn-mini danger" onClick={() => triggerDelete(selectedRecord)}>Delete record</button>
              <button className="btn-ghost" onClick={() => setView('list')}>Back to history</button>
            </div>
          </div>
        </div>
      )}

      {/* ============ EDIT VIEW ============ */}
      {view === 'edit' && selectedRecord && (
        <div className="view show">
          <div className="section-head">
            <h3>Edit record</h3>
            <div className="rule"></div>
            <span className="tag">{formatDateString(selectedRecord.date)}</span>
          </div>

          <div className="form-card">
            <form onSubmit={handleSaveChanges}>
              
              <div className="field">
                <label>Date of self-check</label>
                <input 
                  type="date" 
                  value={editDate} 
                  onChange={(e) => setEditDate(e.target.value)} 
                />
              </div>

              <div className="field">
                <label>Did you complete the guided self-examination?</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="completed" 
                      value="Yes" 
                      checked={editCompleted === 'Yes'} 
                      onChange={(e) => setEditCompleted(e.target.value)} 
                    /> Yes
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="completed" 
                      value="No" 
                      checked={editCompleted === 'No'} 
                      onChange={(e) => setEditCompleted(e.target.value)} 
                    /> No
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Which side did you check?</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="sideChecked" 
                      value="Left breast" 
                      checked={editSideChecked === 'Left breast'} 
                      onChange={(e) => setEditSideChecked(e.target.value)} 
                    /> Left breast
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="sideChecked" 
                      value="Right breast" 
                      checked={editSideChecked === 'Right breast'} 
                      onChange={(e) => setEditSideChecked(e.target.value)} 
                    /> Right breast
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="sideChecked" 
                      value="Both" 
                      checked={editSideChecked === 'Both'} 
                      onChange={(e) => setEditSideChecked(e.target.value)} 
                    /> Both
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Did everything feel normal for you?</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="feltNormal" 
                      value="Yes" 
                      checked={editFeltNormal === 'Yes'} 
                      onChange={(e) => setEditFeltNormal(e.target.value)} 
                    /> Yes
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="feltNormal" 
                      value="No" 
                      checked={editFeltNormal === 'No'} 
                      onChange={(e) => setEditFeltNormal(e.target.value)} 
                    /> No
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="feltNormal" 
                      value="Not sure" 
                      checked={editFeltNormal === 'Not sure'} 
                      onChange={(e) => setEditFeltNormal(e.target.value)} 
                    /> Not sure
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Did you notice any changes? Select all that apply</label>
                <div className="checklist">
                  {changesList.map((change) => (
                    <label key={change}>
                      <input 
                        type="checkbox" 
                        checked={editChanges.includes(change)} 
                        onChange={() => handleCheckboxChange(change)} 
                      /> {change}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Notes</label>
                <textarea 
                  value={editNotes} 
                  onChange={(e) => setEditNotes(e.target.value)} 
                  placeholder="Additional details..." 
                />
              </div>

              <div className="field">
                <label>Reminder for next month?</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="reminder" 
                      value="Yes" 
                      checked={editReminder === 'Yes'} 
                      onChange={(e) => setEditReminder(e.target.value)} 
                    /> Yes
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="reminder" 
                      value="No" 
                      checked={editReminder === 'No'} 
                      onChange={(e) => setEditReminder(e.target.value)} 
                    /> No
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save changes</button>
                <button type="button" className="btn-ghost" onClick={() => setView('detail')}>Cancel</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============ EMPTY STATE ============ */}
      {view === 'empty' && (
        <div className="view show">
          <div className="empty">
            <h3>No self-check records yet.</h3>
            <p>After completing a guided self-examination, you can save your record here for future reference.</p>
            <button className="btn-primary" onClick={() => navigate('/self-examination')}>Start guided self-check</button>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      <div className={`modal-overlay ${showDeleteModal ? 'show' : ''}`}>
        <div className="modal">
          <h4>Delete this self-check record?</h4>
          <p>This will remove the record from your history. This action cannot be undone.</p>
          <div class="modal-actions">
            <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="btn-mini danger" style={{ padding: '14px' }} onClick={confirmDelete}>Delete record</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Records;
