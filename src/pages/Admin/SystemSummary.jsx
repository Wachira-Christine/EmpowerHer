import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllReminders, saveReminder, deleteReminder } from '../../services/firestore';
import '../../styles/admin.css';

const SystemSummary = () => {
  // Pre-existing aggregated metrics
  const metrics = [
    { label: 'Active Users (Local Cache)', value: '142' },
    { label: 'Guided Self-Exams Started', value: '512' },
    { label: 'Guided Self-Exams Completed', value: '408' },
    { label: 'Clinic Locator Searches', value: '310' },
    { label: 'Reminder Alerts Fired', value: '86' }
  ];

  // Admin Reminders State
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReminder, setEditingReminder] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Monthly self-check');
  const [date, setDate] = useState('2026-07-12');
  const [time, setTime] = useState('20:00');
  const [repeat, setRepeat] = useState('Monthly');
  const [note, setNote] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [status, setStatus] = useState('Active');
  const [emailNotification, setEmailNotification] = useState(true);
  const [deliveryStatus, setDeliveryStatus] = useState('Pending');

  // Load reminders
  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReminders();
      setReminders(data);
    } catch (err) {
      console.error("Error loading system reminders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleEditClick = (rem) => {
    setEditingReminder(rem);
    setTitle(rem.title || '');
    setType(rem.type || 'Monthly self-check');
    setDate(rem.date || '2026-07-12');
    setTime(rem.time || '20:00');
    setRepeat(rem.repeat || 'Monthly');
    setNote(rem.note || '');
    setUserEmail(rem.userEmail || '');
    setStatus(rem.status || 'Active');
    setEmailNotification(rem.emailNotification ?? true);
    setDeliveryStatus(rem.deliveryStatus || 'Pending');
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingReminder(null);
    setTitle('');
    setType('Monthly self-check');
    setDate('2026-07-12');
    setTime('20:00');
    setRepeat('Monthly');
    setNote('');
    setUserEmail('user@example.com');
    setStatus('Active');
    setEmailNotification(true);
    setDeliveryStatus('Pending');
    setIsFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !userEmail.trim()) return;

    const payload = {
      userId: editingReminder ? (editingReminder.userId || 'admin-created') : 'admin-created',
      userEmail,
      userName: userEmail.split('@')[0],
      title,
      type,
      date,
      time,
      repeat,
      note,
      notifyPreference: emailNotification ? ['In-app', 'Email/SMS'] : ['In-app'],
      status,
      emailNotification,
      nextReminder: date,
      deliveryStatus,
      lastSent: editingReminder ? (editingReminder.lastSent || null) : null
    };

    try {
      const id = editingReminder ? editingReminder.id : null;
      const savedId = await saveReminder(id, payload);
      
      if (id) {
        setReminders(reminders.map(r => r.id === id ? { ...payload, id: savedId } : r));
      } else {
        setReminders([...reminders, { ...payload, id: savedId }]);
      }
      setIsFormOpen(false);
      setEditingReminder(null);
    } catch (err) {
      console.error("Error saving reminder:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;
    try {
      await deleteReminder(id);
      setReminders(reminders.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Admin Tool / A6</p>
        <h2 className="h1">System <em>Summary</em></h2>
        <p className="dek">View application metrics, total interactions, and diagnostic log placeholders.</p>
      </div>

      <div className="notice">
        <b>Wording Reminder</b>
        This application does not collect, store, or transmit personal health information or private self-check logs. Metrics represent aggregated local-first check statistics.
      </div>

      {/* Overview stats cards */}
      <div className="section-head">
        <h3>Application Metrics</h3>
        <div className="rule"></div>
        <span className="tag">Summary stats</span>
      </div>

      {/* Stats list */}
      <div className="setting-list" style={{ marginBottom: '30px' }}>
        {metrics.map((metric) => (
          <div key={metric.label} className="setting-row">
            <div>
              <h4 style={{ fontSize: '15px' }}>{metric.label}</h4>
              <p>Aggregated local metrics tracking interaction counts.</p>
            </div>
            <span className="status-pill" style={{ fontSize: '13px', padding: '6px 12px' }}>{metric.value}</span>
          </div>
        ))}
      </div>

      {/* System Reminders Admin Module */}
      <div className="section-head">
        <h3>Manage System Reminders</h3>
        <div className="rule"></div>
        <span className="tag">Mail Deliveries</span>
      </div>

      {isFormOpen ? (
        <div className="form-card" style={{ maxWidth: '640px', marginBottom: '20px' }}>
          <p className="form-title">{editingReminder ? 'Edit System Reminder' : 'Create System Reminder'}</p>
          <p className="form-sub">Configure user email reminders and delivery parameters.</p>
          
          <form onSubmit={handleSave}>
            <div className="field">
              <label>User Email Address</label>
              <input 
                type="email" 
                value={userEmail} 
                onChange={(e) => setUserEmail(e.target.value)} 
                required 
                placeholder="patient@domain.com"
              />
            </div>

            <div className="field">
              <label>Reminder Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="Time for monthly self-check"
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Reminder Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Monthly self-check">Monthly self-check</option>
                  <option value="Clinic appointment">Clinic appointment</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="field">
                <label>Repeat / Frequency</label>
                <select value={repeat} onChange={(e) => setRepeat(e.target.value)}>
                  <option value="Once">Once</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Scheduled Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="field">
                <label>Scheduled Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>

            <div className="field">
              <label>Reminder Note</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Encouraging message..." />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Email Notification</label>
                <div className="choice-row">
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="emailNotification" 
                      checked={emailNotification === true} 
                      onChange={() => setEmailNotification(true)} 
                    /> Enabled
                  </label>
                  <label className="choice">
                    <input 
                      type="radio" 
                      name="emailNotification" 
                      checked={emailNotification === false} 
                      onChange={() => setEmailNotification(false)} 
                    /> Disabled
                  </label>
                </div>
              </div>
              <div className="field">
                <label>Delivery Status</label>
                <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Sent">Sent</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Active Status</label>
              <div className="choice-row">
                <label className="choice">
                  <input type="radio" name="status" checked={status === 'Active'} onChange={() => setStatus('Active')} /> Active (ON)
                </label>
                <label className="choice">
                  <input type="radio" name="status" checked={status === 'Off'} onChange={() => setStatus('Off')} /> Paused (OFF)
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Reminder</button>
              <button type="button" className="btn-ghost" onClick={() => { setIsFormOpen(false); setEditingReminder(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          <div className="table-wrap">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Loading reminders...</div>
            ) : reminders.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>No reminders configured.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>User (Email)</th>
                    <th>Date / Time</th>
                    <th>Frequency</th>
                    <th>Email Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reminders.map(rem => (
                    <tr key={rem.id}>
                      <td style={{ fontWeight: '600' }}>{rem.title}</td>
                      <td>{rem.userEmail}</td>
                      <td>{rem.date} ({rem.time})</td>
                      <td>{rem.repeat}</td>
                      <td>
                        <span className={`pill ${
                          rem.deliveryStatus === 'Sent' ? 'pub' : 
                          rem.deliveryStatus === 'Failed' ? 'danger' : 'draft'
                        }`} style={{
                          color: rem.deliveryStatus === 'Failed' ? 'var(--coral)' : '',
                          backgroundColor: rem.deliveryStatus === 'Failed' ? 'var(--paper-deep)' : ''
                        }}>
                          {rem.deliveryStatus || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <button onClick={() => handleEditClick(rem)}>Edit</button>
                          <button className="danger" onClick={() => handleDelete(rem.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="table-foot" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
            <button className="btn-primary" onClick={handleAddClick}>Add new reminder</button>
          </div>
        </div>
      )}

      <div className="btn-row" style={{ marginTop: '16px' }}>
        <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Back to Admin
        </Link>
      </div>

    </div>
  );
};

export default SystemSummary;
