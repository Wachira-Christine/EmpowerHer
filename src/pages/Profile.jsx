import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sub-screens: 'overview' | 'edit'
  const [view, setView] = useState('overview');

  // Local Profile State (pre-populated with user context or template defaults)
  const [profile, setProfile] = useState({
    name: user?.name || 'Christine Wachira',
    email: user?.email || 'christine@example.com',
    ageRange: '18–25',
    county: 'Nairobi',
    status: 'Active'
  });

  // Edit form buffer state
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editAgeRange, setEditAgeRange] = useState(profile.ageRange);
  const [editCounty, setEditCounty] = useState(profile.county);

  // Privacy Settings Toggles State
  const [privacySettings, setPrivacySettings] = useState({
    hideSensitive: true,
    requirePIN: false,
    keepPrivate: true
  });

  // Reminder Settings State
  const [reminderSettings, setReminderSettings] = useState({
    monthlySelfCheck: true,
    clinicFollowup: false,
    preferredTime: '20:00',
    methods: ['In-app']
  });

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Switch handlers
  const handlePrivacyToggle = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleReminderToggle = (key) => {
    setReminderSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleReminderMethodChange = (method) => {
    const current = reminderSettings.methods;
    if (current.includes(method)) {
      setReminderSettings(prev => ({
        ...prev,
        methods: current.filter(m => m !== method)
      }));
    } else {
      setReminderSettings(prev => ({
        ...prev,
        methods: [...current, method]
      }));
    }
  };

  const handleTimeChange = (e) => {
    setReminderSettings(prev => ({
      ...prev,
      preferredTime: e.target.value
    }));
  };

  // Form actions
  const handleStartEdit = () => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditAgeRange(profile.ageRange);
    setEditCounty(profile.county);
    setView('edit');
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setProfile(prev => ({
      ...prev,
      name: editName,
      email: editEmail,
      ageRange: editAgeRange,
      county: editCounty
    }));
    setView('overview');
  };

  // Account / Security Actions
  const handleClearData = () => {
    if (confirm("Clear local app data? This removes cached content stored on this device only.")) {
      alert("Local data cleared.");
    }
  };

  const handleUpdateReminders = () => {
    alert("Reminder preferences updated successfully!");
  };

  const handleChangePassword = () => {
    alert("Change password flow triggered (UI placeholder only).");
  };

  const handleSetPIN = () => {
    alert("PIN protection setup triggered (UI placeholder only).");
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
    navigate('/');
  };

  const handleExportRecords = () => {
    alert("Exporting records... Your self-check history will download shortly as a text/CSV report.");
  };

  const handleClearRecords = () => {
    if (confirm("Are you sure you want to clear all saved self-check records? This action cannot be undone.")) {
      alert("All history log records cleared.");
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    alert("Account deletion triggered. You will be logged out.");
    handleLogout();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="main">
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Section 07</p>
        <h1 className="h1">Profile & <em>Settings</em></h1>
        <p className="dek">Manage your account, privacy, reminders, and personal preferences.</p>
      </div>

      <div className="notice">
        <b>About your privacy</b>
        Your profile settings help personalize your experience. EmpowerHer keeps your self-check records private and does not provide medical diagnosis.
      </div>

      {/* ===== PROFILE OVERVIEW / EDIT VIEW ===== */}
      <div className="section-head">
        <h3>Your profile</h3>
        <div className="rule"></div>
        <span className="tag">Overview</span>
      </div>

      {view === 'overview' && (
        <div className="view show">
          <div className="profile-card">
            <span className="corner"></span>
            <div className="profile-top">
              <div className="avatar">{profile.name.charAt(0).toUpperCase()}</div>
              <div>
                <p className="profile-name">{profile.name}</p>
                <span className="status-pill">{profile.status}</span>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <p className="label">Email or phone</p>
                <p className="value">{profile.email}</p>
              </div>
              <div className="info-item">
                <p className="label">Age range</p>
                <p className="value">{profile.ageRange}</p>
              </div>
              <div className="info-item">
                <p className="label">County</p>
                <p className="value">{profile.county}</p>
              </div>
              <div className="info-item">
                <p className="label">Account status</p>
                <p className="value">{profile.status}</p>
              </div>
            </div>
            <div className="btn-row">
              <button className="btn-secondary" onClick={handleStartEdit}>Edit profile</button>
            </div>
          </div>
        </div>
      )}

      {view === 'edit' && (
        <div className="view show">
          <div className="profile-card">
            <span className="corner"></span>
            <form onSubmit={handleSaveChanges}>
              <div className="field">
                <label>Full name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required 
                />
              </div>
              <div className="field">
                <label>Email or phone number</label>
                <input 
                  type="text" 
                  value={editEmail} 
                  onChange={(e) => setEditEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Age range</label>
                  <select value={editAgeRange} onChange={(e) => setEditAgeRange(e.target.value)}>
                    <option value="16–17">16–17</option>
                    <option value="18–25">18–25</option>
                    <option value="26–35">26–35</option>
                    <option value="36–45">36–45</option>
                    <option value="46+">46+</option>
                  </select>
                </div>
                <div className="field">
                  <label>County / location</label>
                  <select value={editCounty} onChange={(e) => setEditCounty(e.target.value)}>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Kiambu">Kiambu</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="btn-row">
                <button type="submit" className="btn-primary">Save changes</button>
                <button type="button" className="btn-ghost" onClick={() => setView('overview')}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== PRIVACY SETTINGS ===== */}
      <div className="section-head">
        <h3>Privacy</h3>
        <div className="rule"></div>
        <span className="tag">On this device</span>
      </div>

      <div className="setting-list">
        <div className="setting-row">
          <div>
            <h4>Hide sensitive information on screen</h4>
            <p>Mask details on the history and self-check pages until tapped.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={privacySettings.hideSensitive} 
              onChange={() => handlePrivacyToggle('hideSensitive')} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <div>
            <h4>Require PIN before viewing self-check history</h4>
            <p>Add a quick lock screen before opening your records.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={privacySettings.requirePIN} 
              onChange={() => handlePrivacyToggle('requirePIN')} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <div>
            <h4>Keep self-check records private</h4>
            <p>Your records are never shared without your permission.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={privacySettings.keepPrivate} 
              onChange={() => handlePrivacyToggle('keepPrivate')} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <div>
            <h4>Clear local app data</h4>
            <p>Remove cached content stored on this device only.</p>
          </div>
          <button className="btn-ghost" onClick={handleClearData}>Clear data</button>
        </div>
      </div>
      <p className="privacy-note">Privacy settings help you control how your personal health information is shown and protected on this device.</p>

      {/* ===== REMINDER PREFERENCES ===== */}
      <div className="section-head">
        <h3>Reminder preferences</h3>
        <div className="rule"></div>
        <span className="tag">Defaults</span>
      </div>

      <div className="setting-list">
        <div className="setting-row">
          <div>
            <h4>Monthly self-check reminders</h4>
            <p>A nudge once a month to do your guided self-check.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={reminderSettings.monthlySelfCheck} 
              onChange={() => handleReminderToggle('monthlySelfCheck')} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <div>
            <h4>Clinic follow-up reminders</h4>
            <p>Reminders for upcoming or past-due clinic visits.</p>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={reminderSettings.clinicFollowup} 
              onChange={() => handleReminderToggle('clinicFollowup')} 
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="field-inline">
          <label>Preferred time</label>
          <input 
            type="time" 
            value={reminderSettings.preferredTime} 
            onChange={handleTimeChange} 
          />
        </div>
        <div className="field-inline">
          <label>Reminder method</label>
          <div className="method-row">
            <label>
              <input 
                type="checkbox" 
                checked={reminderSettings.methods.includes('In-app')} 
                onChange={() => handleReminderMethodChange('In-app')} 
              /> In-app
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={reminderSettings.methods.includes('Phone notification')} 
                onChange={() => handleReminderMethodChange('Phone notification')} 
              /> Phone notification
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={reminderSettings.methods.includes('SMS')} 
                onChange={() => handleReminderMethodChange('SMS')} 
              /> SMS
            </label>
          </div>
        </div>
      </div>
      <div className="btn-row" style={{ marginTop: '16px' }}>
        <button className="btn-primary" onClick={handleUpdateReminders}>Update reminder settings</button>
        <button className="btn-secondary" onClick={() => navigate('/reminders')}>Go to Reminders page</button>
      </div>

      {/* ===== SECURITY ===== */}
      <div className="section-head">
        <h3>Security</h3>
        <div className="rule"></div>
        <span className="tag">Account</span>
      </div>

      <div className="action-list">
        <div className="action-row">
          <div>
            <h4>Change password</h4>
            <p>Update the password you use to sign in.</p>
          </div>
          <button className="btn-secondary" onClick={handleChangePassword}>Change password</button>
        </div>
        <div className="action-row">
          <div>
            <h4>PIN protection</h4>
            <p>Add a short PIN as an extra layer on this device.</p>
          </div>
          <button className="btn-secondary" onClick={handleSetPIN}>Set PIN</button>
        </div>
        <div className="action-row">
          <div>
            <h4>Log out</h4>
            <p>Sign out of EmpowerHer on this device.</p>
          </div>
          <button className="btn-ghost" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {/* ===== ACCOUNT ACTIONS ===== */}
      <div className="section-head">
        <h3>Account actions</h3>
        <div className="rule"></div>
        <span className="tag">Manage data</span>
      </div>

      <div className="action-list">
        <div className="action-row">
          <div>
            <h4>Download or export my records</h4>
            <p>Save a copy of your self-check history for your own reference.</p>
          </div>
          <button className="btn-secondary" onClick={handleExportRecords}>Export records</button>
        </div>
        <div className="action-row danger">
          <div>
            <h4>Clear saved self-check records</h4>
            <p>Remove all entries from your History Log. This cannot be undone.</p>
          </div>
          <button className="btn-secondary" onClick={handleClearRecords}>Clear records</button>
        </div>
        <div className="action-row danger">
          <div>
            <h4>Delete account</h4>
            <p>Permanently remove your account and saved records.</p>
          </div>
          <button className="btn-secondary" onClick={() => setShowDeleteModal(true)}>Delete account</button>
        </div>
      </div>

      {/* ============ DELETE CONFIRMATION MODAL ============ */}
      <div className={`modal-overlay ${showDeleteModal ? 'show' : ''}`}>
        <div className="modal">
          <h4>Delete account?</h4>
          <p>This will remove your account and saved records. This action cannot be undone.</p>
          <div className="modal-actions">
            <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="btn-secondary" style={{ borderColor: 'var(--oxblood)', color: 'var(--oxblood)' }} onClick={handleDeleteAccount}>Delete account</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
