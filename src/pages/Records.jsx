import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getSelfCheckRecords, 
  updateSelfCheckRecord, 
  deleteSelfCheckRecord 
} from '../services/selfCheckService';
import '../styles/records.css';

const Records = () => {
  const navigate = useRef(useNavigate()).current;
  const { user } = useAuth();

  // State Management
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
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
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deletingRecord, setDeletingRecord] = useState(false);

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

  // Fetch records on mount or when user changes
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setErrorMsg('');
        const data = await getSelfCheckRecords(user.uid);
        setRecords(data);
        if (data.length === 0) {
          setView('empty');
        } else {
          setView('list');
        }
      } catch (err) {
        console.error("Failed to load records:", err);
        setErrorMsg("Failed to retrieve your history log. Please reload the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

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
    setEditCompleted(record.completedGuide || 'Yes');
    setEditSideChecked(record.sideChecked);
    setEditFeltNormal(record.feltNormal);
    setEditChanges(record.changesNoticed || []);
    setEditNotes(record.notes);
    setEditReminder(record.reminderRequested || 'Yes');
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
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!selectedRecord) return;
    setSavingEdit(true);
    setErrorMsg('');

    try {
      const updatedData = {
        date: editDate,
        completedGuide: editCompleted,
        sideChecked: editSideChecked,
        feltNormal: editFeltNormal,
        changesNoticed: editChanges.length > 0 ? editChanges : ['No unusual change noticed'],
        notes: editNotes,
        reminderRequested: editReminder
      };

      await updateSelfCheckRecord(selectedRecord.id, updatedData);

      // Update state locally
      const updatedRecords = records.map((rec) => {
        if (rec.id === selectedRecord.id) {
          return {
            ...rec,
            ...updatedData,
            updatedAt: new Date().toISOString()
          };
        }
        return rec;
      });
      setRecords(updatedRecords);

      const nextDetail = updatedRecords.find(r => r.id === selectedRecord.id);
      setSelectedRecord(nextDetail);
      setView('detail');
    } catch (err) {
      console.error("Failed to update record:", err);
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete modal triggers
  const triggerDelete = (record) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setDeletingRecord(true);
    setErrorMsg('');

    try {
      await deleteSelfCheckRecord(recordToDelete.id);
      const remaining = records.filter(r => r.id !== recordToDelete.id);
      setRecords(remaining);
      setShowDeleteModal(false);
      setRecordToDelete(null);
      if (remaining.length === 0) {
        setView('empty');
      } else {
        setView('list');
      }
    } catch (err) {
      console.error("Failed to delete record:", err);
      setErrorMsg("Failed to delete the self-check record. Please try again.");
      setShowDeleteModal(false);
    } finally {
      setDeletingRecord(false);
    }
  };

  // Calculated Stats
  const totalRecords = records.length;
  const lastCheck = records.length > 0 ? formatShortDate(records[0].date) : 'N/A';
  const nextReminder = records.length > 0 ? '12 Jul 2026' : 'N/A';
  const changesCount = records.filter(r => r.feltNormal === 'No' || r.feltNormal === 'Not sure').length;

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        color: 'var(--oxblood)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Loading your history log...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Eyebrow and Page Headers */}
      <div>
        <p className="eyebrow">Section 04</p>
        <h2 className="h1">Self-Check <em>History</em></h2>
        <p className="dek">Review your past self-check records and keep track of what is normal for your body.</p>
      </div>

      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--oxblood)',
          padding: '10px',
          borderRadius: '6px',
          fontSize: '13px',
          textAlign: 'left'
        }}>
          {errorMsg}
        </div>
      )}

      <div className="notice">
        <b>About this page</b>
        Your history helps you remember what you noticed during each self-check. It does not diagnose breast cancer. If you notice unusual changes or feel worried, please visit a qualified healthcare provider.
      </div>

      {/* Demo State Switcher (Optional Navigation Shortcuts) */}
      {records.length > 0 && (
        <div className="view-switch">
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}>List view</button>
          <button className={view === 'detail' ? 'on' : ''} onClick={() => { if (records.length > 0) { setSelectedRecord(records[0]); setView('detail'); } }}>Record details</button>
          <button className={view === 'edit' ? 'on' : ''} onClick={() => { if (records.length > 0) { handleStartEdit(records[0]); } }}>Edit record</button>
          <button className={view === 'empty' ? 'on' : ''} onClick={() => setView('empty')}>Empty state</button>
        </div>
      )}

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
                    <span className="status-pill">{rec.completedGuide === 'Yes' ? 'Completed' : 'Incomplete'}</span>
                  </div>
                  <div className="meta-row">
                    <span>Checked: {rec.sideChecked}</span>
                  </div>
                  
                  <span className={`result-pill ${hasChanges ? 'changed' : ''}`}>
                    {rec.feltNormal === 'Yes' ? 'Normal for me' : rec.feltNormal === 'No' ? 'Change noticed' : 'Not sure'}
                  </span>
                  
                  <p className="notes">{rec.notes || 'No notes added.'}</p>
                  
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
              <span className="v">{selectedRecord.completedGuide || 'Yes'}</span>
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
              <span className="v">{(selectedRecord.changesNoticed || []).join(', ')}</span>
            </div>
            <div className="detail-row">
              <span className="k">Notes</span>
              <span className="v">{selectedRecord.notes || 'No notes added.'}</span>
            </div>
            <div className="detail-row">
              <span className="k">Reminder set</span>
              <span className="v">{selectedRecord.reminderRequested === 'Yes' ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-row">
              <span className="k">Saved on</span>
              <span className="v">{selectedRecord.createdAt ? formatDateString(selectedRecord.createdAt.split('T')[0]) : formatDateString(selectedRecord.date)}</span>
            </div>

            {(selectedRecord.feltNormal === 'No' || selectedRecord.feltNormal === 'Not sure' || selectedRecord.changesNoticed?.some(c => c !== 'No unusual change noticed')) && (
              <div className="detail-support">
                Some changes are not cancer, but it is important to have unusual changes checked by a healthcare provider.
              </div>
            )}

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
                  required
                />
              </div>

              <div className="field">
                <label>Did you complete the guided self-examination?</label>
                <div className="choice-row">
                  <label className={`choice ${editCompleted === 'Yes' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="editCompleted" 
                      value="Yes" 
                      checked={editCompleted === 'Yes'} 
                      onChange={() => setEditCompleted('Yes')} 
                    /> Yes
                  </label>
                  <label className={`choice ${editCompleted === 'No' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="editCompleted" 
                      value="No" 
                      checked={editCompleted === 'No'} 
                      onChange={() => setEditCompleted('No')} 
                    /> No
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Which side did you check?</label>
                <div className="choice-row">
                  <label className={`choice ${editSideChecked === 'Left breast' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="editSideChecked" 
                      value="Left breast" 
                      checked={editSideChecked === 'Left breast'} 
                      onChange={() => setEditSideChecked('Left breast')} 
                    /> Left breast
                  </label>
                  <label className={`choice ${editSideChecked === 'Right breast' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="editSideChecked" 
                      value="Right breast" 
                      checked={editSideChecked === 'Right breast'} 
                      onChange={() => setEditSideChecked('Right breast')} 
                    /> Right breast
                  </label>
                  <label className={`choice ${editSideChecked === 'Both' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="editSideChecked" 
                      value="Both" 
                      checked={editSideChecked === 'Both'} 
                      onChange={() => setEditSideChecked('Both')} 
                    /> Both
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Did everything feel normal for you?</label>
                <div className="choice-row">
                  <label className={`choice ${editFeltNormal === 'Yes' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="editFeltNormal" 
                      value="Yes" 
                      checked={editFeltNormal === 'Yes'} 
                      onChange={() => setEditFeltNormal('Yes')} 
                    /> Yes
                  </label>
                  <label className={`choice ${editFeltNormal === 'No' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="editFeltNormal" 
                      value="No" 
                      checked={editFeltNormal === 'No'} 
                      onChange={() => setEditFeltNormal('No')} 
                    /> No
                  </label>
                  <label className={`choice ${editFeltNormal === 'Not sure' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="editFeltNormal" 
                      value="Not sure" 
                      checked={editFeltNormal === 'Not sure'} 
                      onChange={() => setEditFeltNormal('Not sure')} 
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
                  <label className={`choice ${editReminder === 'Yes' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="editReminder" 
                      value="Yes" 
                      checked={editReminder === 'Yes'} 
                      onChange={() => setEditReminder('Yes')} 
                    /> Yes
                  </label>
                  <label className={`choice ${editReminder === 'No' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="editReminder" 
                      value="No" 
                      checked={editReminder === 'No'} 
                      onChange={() => setEditReminder('No')} 
                    /> No
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save changes'}
                </button>
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
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowDeleteModal(false)} disabled={deletingRecord}>Cancel</button>
            <button className="btn-mini danger" style={{ padding: '14px' }} onClick={confirmDelete} disabled={deletingRecord}>
              {deletingRecord ? 'Deleting...' : 'Delete record'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Records;
