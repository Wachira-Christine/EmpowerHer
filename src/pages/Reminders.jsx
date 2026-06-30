import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchReminders, saveReminder, deleteReminder } from '../services/firestore';
import '../styles/reminders.css';

const Reminders = () => {
  const { user } = useAuth();
  
  // Reminders list state
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Monthly self-check');
  const [date, setDate] = useState('2026-07-12');
  const [time, setTime] = useState('20:00');
  const [repeat, setRepeat] = useState('Monthly');
  const [note, setNote] = useState('');
  const [notifyPreference, setNotifyPreference] = useState(['In-app']);
  const [status, setStatus] = useState('Active');

  // Editing state
  const [editingId, setEditingId] = useState(null);

  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);

  // Fetch reminders on load
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchReminders(user.uid)
        .then(data => {
          setReminders(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading user reminders:", err);
          setLoading(false);
        });
    }
  }, [user]);

  // Helpers to display date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[monthIndex]} ${year}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${minute} ${ampm}`;
  };

  // Form handlers
  const handleSaveReminder = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const emailNotification = notifyPreference.includes('Email/SMS');

    const payload = {
      userId: user.uid,
      userEmail: user.email || '',
      userName: user.displayName || 'User',
      title,
      type,
      date,
      time,
      repeat,
      note,
      notifyPreference,
      status,
      emailNotification,
      lastSent: editingId ? (reminders.find(r => r.id === editingId)?.lastSent || null) : null,
      nextReminder: date, // initially matches date
      deliveryStatus: editingId ? (reminders.find(r => r.id === editingId)?.deliveryStatus || 'Pending') : 'Pending'
    };

    // Optimistic UI updates
    const prevReminders = [...reminders];
    if (editingId) {
      setReminders(reminders.map(r => r.id === editingId ? { ...payload, id: editingId } : r));
      setEditingId(null);
    } else {
      const tempId = `temp-${Date.now()}`;
      setReminders([...reminders, { ...payload, id: tempId }]);
    }

    resetForm();

    try {
      const savedId = await saveReminder(editingId, payload);
      // Replace temp ID with actual firestore ID if created
      if (!editingId) {
        setReminders(prev => prev.map(r => r.id.toString().startsWith('temp-') ? { ...r, id: savedId } : r));
      }
    } catch (err) {
      console.error("Error saving reminder:", err);
      setReminders(prevReminders); // Rollback
    }
  };

  const handleEditClick = (reminder) => {
    setEditingId(reminder.id);
    setTitle(reminder.title);
    setType(reminder.type);
    setDate(reminder.date);
    setTime(reminder.time);
    setRepeat(reminder.repeat);
    setNote(reminder.note);
    setNotifyPreference(reminder.notifyPreference || []);
    setStatus(reminder.status);
  };

  const handleToggleStatus = async (id) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    const nextStatus = reminder.status === 'Active' ? 'Off' : 'Active';
    
    // Optimistic update
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, status: nextStatus } : r
    ));

    try {
      await saveReminder(id, { status: nextStatus });
    } catch (err) {
      console.error(err);
      setReminders(reminders); // rollback on error
    }
  };

  const handleDeleteTrigger = (reminder) => {
    setReminderToDelete(reminder);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (reminderToDelete) {
      const prevReminders = [...reminders];
      setReminders(reminders.filter(r => r.id !== reminderToDelete.id));
      setShowDeleteModal(false);
      const targetId = reminderToDelete.id;
      setReminderToDelete(null);

      try {
        await deleteReminder(targetId);
      } catch (err) {
        console.error(err);
        setReminders(prevReminders); // Rollback
      }
    }
  };

  const handleNotifyCheckboxChange = (pref) => {
    if (notifyPreference.includes(pref)) {
      setNotifyPreference(notifyPreference.filter(p => p !== pref));
    } else {
      setNotifyPreference([...notifyPreference, pref]);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setType('Monthly self-check');
    setDate('2026-07-12');
    setTime('20:00');
    setRepeat('Monthly');
    setNote('');
    setNotifyPreference(['In-app']);
    setStatus('Active');
  };

  // Stats calculation
  const activeCount = reminders.filter(r => r.status === 'Active').length;
  
  // Find next reminder date
  const activeReminders = reminders.filter(r => r.status === 'Active').sort((a, b) => a.date.localeCompare(b.date));
  const nextReminderText = activeReminders.length > 0 ? formatDate(activeReminders[0].date) : 'Not set';

  const monthlyCheckReminder = reminders.find(r => r.type === 'Monthly self-check' && r.status === 'Active');
  const monthlyCheckText = monthlyCheckReminder ? 'Active' : 'Not set';

  const clinicFollowupReminder = reminders.find(r => r.type === 'Clinic appointment' && r.status === 'Active');
  const clinicFollowupText = clinicFollowupReminder ? 'Active' : 'Not set';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div>
        <p className="eyebrow">Section 05</p>
        <h2 className="h1">Breast Health <em>Reminders</em></h2>
        <p className="dek">Set gentle reminders for your monthly self-checks, clinic visits, and follow-up care.</p>
      </div>

      <div className="notice">
        <b>About reminders</b>
        Reminders are here to support your routine. EmpowerHer does not provide diagnosis or medical advice. If you notice unusual changes, please visit a qualified healthcare provider.
      </div>

      {/* Summary Row */}
      <div className="summary-row">
        <div className="sum-card">
          <span className="corner"></span>
          <p className="label">Active reminders</p>
          <p className="value">{loading ? '...' : activeCount}</p>
        </div>
        <div className="sum-card alt">
          <span className="corner"></span>
          <p className="label">Next reminder</p>
          <p className="value" style={{ fontSize: '17px' }}>{loading ? '...' : nextReminderText}</p>
        </div>
        <div className="sum-card alt2">
          <span className="corner"></span>
          <p className="label">Monthly self-check</p>
          <p className="value" style={{ fontSize: '17px' }}>{loading ? '...' : monthlyCheckText}</p>
        </div>
        <div className="sum-card">
          <span className="corner"></span>
          <p className="label">Clinic follow-up</p>
          <p className="value" style={{ fontSize: '17px', opacity: clinicFollowupText === 'Not set' ? 0.55 : 1 }}>{loading ? '...' : clinicFollowupText}</p>
        </div>
      </div>

      {/* Layout Split Grid */}
      <div className="layout">
        
        {/* Left Form Panel */}
        <div>
          <div className="section-head">
            <h3>{editingId ? 'Edit' : 'New'}</h3>
            <div className="rule"></div>
            <span className="tag">{editingId ? 'Modify reminder' : 'Add reminder'}</span>
          </div>

          <div className="form-card">
            <p className="form-title">{editingId ? 'Modify reminder' : 'Create a reminder'}</p>
            <p className="form-sub">Set it once — we'll do the remembering.</p>
            
            <form onSubmit={handleSaveReminder}>
              <div className="field">
                <label>Reminder title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Monthly self-check" 
                  required 
                />
              </div>

              <div className="field">
                <label>Reminder type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Monthly self-check">Monthly self-check</option>
                  <option value="Clinic appointment">Clinic appointment</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field">
                <label>Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required
                />
              </div>

              <div className="field">
                <label>Time</label>
                <input 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  required
                />
              </div>

              <div className="field">
                <label>Repeat</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="repeat" 
                      value="Once" 
                      checked={repeat === 'Once'} 
                      onChange={(e) => setRepeat(e.target.value)} 
                    /> Once
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="repeat" 
                      value="Monthly" 
                      checked={repeat === 'Monthly'} 
                      onChange={(e) => setRepeat(e.target.value)} 
                    /> Monthly
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="repeat" 
                      value="Custom" 
                      checked={repeat === 'Custom'} 
                      onChange={(e) => setRepeat(e.target.value)} 
                    /> Custom
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Note</label>
                <textarea 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  placeholder="Do this in a private and comfortable place."
                />
              </div>

              <div className="field">
                <label>Notify me by</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="checkbox" 
                      checked={notifyPreference.includes('In-app')} 
                      onChange={() => handleNotifyCheckboxChange('In-app')} 
                    /> In-app
                  </label>
                  <label className="choice">
                    <input 
                      type="checkbox" 
                      checked={notifyPreference.includes('Phone notification')} 
                      onChange={() => handleNotifyCheckboxChange('Phone notification')} 
                    /> Phone notification
                  </label>
                  <label className="choice">
                    <input 
                      type="checkbox" 
                      checked={notifyPreference.includes('Email/SMS')} 
                      onChange={() => handleNotifyCheckboxChange('Email/SMS')} 
                    /> Email Reminder
                  </label>
                </div>
              </div>

              <div className="field">
                <label>Status</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Active" 
                      checked={status === 'Active'} 
                      onChange={(e) => setStatus(e.target.value)} 
                    /> Active
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Off" 
                      checked={status === 'Off'} 
                      onChange={(e) => setStatus(e.target.value)} 
                    /> Off
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save reminder</button>
                <button type="button" className="btn-ghost" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>

        {/* Right List Panel */}
        <div>
          <div className="section-head">
            <h3>Your reminders</h3>
            <div className="rule"></div>
            <span className="tag">{reminders.length} total</span>
          </div>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading reminders...</div>
          ) : reminders.length === 0 ? (
            <div className="empty">
              <h3>No reminders yet.</h3>
              <p>Set a reminder to help make breast self-checks part of your routine.</p>
              <button className="btn-primary" onClick={resetForm}>Create reminder</button>
            </div>
          ) : (
            reminders.map((rem, idx) => (
              <div key={rem.id} className={`rem-card ${idx % 2 === 1 ? 'alt' : ''}`} style={{ opacity: rem.id.toString().startsWith('temp-') ? 0.6 : 1 }}>
                <span className="corner"></span>
                <div className="rem-top">
                  <p className="rem-title">{rem.title}</p>
                  <span className={`status-pill ${rem.status === 'Off' ? 'off' : ''}`}>
                    {rem.status}
                  </span>
                </div>
                <div className="rem-meta">
                  <span>{rem.type}</span>
                  <span>{formatDate(rem.date)}, {formatTime(rem.time)}</span>
                  <span>Repeats {rem.repeat.toLowerCase()}</span>
                </div>
                {rem.emailNotification && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--coral)', marginTop: '4px' }}>
                    <span>📧 Email notification ON</span>
                    {rem.deliveryStatus && <span style={{ opacity: 0.6 }}>({rem.deliveryStatus})</span>}
                  </div>
                )}
                <p className="rem-note">{rem.note}</p>
                
                <div className="rem-actions">
                  <button className="btn-mini primary" onClick={() => handleEditClick(rem)} disabled={rem.id.toString().startsWith('temp-')}>Edit</button>
                  <button className="btn-mini" onClick={() => handleToggleStatus(rem.id)} disabled={rem.id.toString().startsWith('temp-')}>
                    {rem.status === 'Active' ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn-mini danger" onClick={() => handleDeleteTrigger(rem)} disabled={rem.id.toString().startsWith('temp-')}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      <div className={`modal-overlay ${showDeleteModal ? 'show' : ''}`}>
        <div className="modal">
          <h4>Delete this reminder?</h4>
          <p>This reminder will be removed from your list. You can create a new one anytime.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="btn-mini danger" style={{ padding: '13px' }} onClick={confirmDelete}>Delete reminder</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Reminders;
