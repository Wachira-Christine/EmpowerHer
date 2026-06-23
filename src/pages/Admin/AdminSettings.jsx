import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin.css';

const AdminSettings = () => {
  const [adminPassword, setAdminPassword] = useState('********');
  const [backupSchedule, setBackupSchedule] = useState('Weekly');
  const [offlineMode, setOfflineMode] = useState(true);

  const handleUpdate = (e) => {
    e.preventDefault();
    alert("Admin configurations saved (placeholder only)!");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Admin Tool</p>
        <h2 className="h1">Admin <em>Settings</em></h2>
        <p className="dek">Modify local admin password, adjust notification configurations, and manage backup files.</p>
      </div>

      <div className="notice">
        <b>System Settings</b>
        Modify configurations safely. Ensure offline PWA settings are correctly set for underserved community deployment.
      </div>

      <div className="layout">
        
        {/* Form panel */}
        <div>
          <div className="section-head">
            <h3>Configuration</h3>
            <div className="rule"></div>
            <span className="tag">Settings</span>
          </div>

          <div className="form-card">
            <p className="form-title">System Settings</p>
            <p className="form-sub">Adjust offline deployment and security details.</p>
            
            <form onSubmit={handleUpdate}>
              <div className="field">
                <label>Admin Security Password</label>
                <input 
                  type="text" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)} 
                  required 
                />
              </div>

              <div className="field">
                <label>Data Backup Schedule</label>
                <select value={backupSchedule} onChange={(e) => setBackupSchedule(e.target.value)}>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Manual">Manual Only</option>
                </select>
              </div>

              <div className="field">
                <label>Offline PWA Support Mode</label>
                <select value={offlineMode ? 'On' : 'Off'} onChange={(e) => setOfflineMode(e.target.value === 'On')}>
                  <option value="On">Enabled (Cache resources offline)</option>
                  <option value="Off">Disabled (Online only)</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Settings</button>
              </div>
            </form>
          </div>
        </div>

        {/* Action list */}
        <div>
          <div className="section-head">
            <h3>Maintenance tasks</h3>
            <div className="rule"></div>
            <span className="tag">Database</span>
          </div>

          <div className="action-list">
            <div className="action-row">
              <div>
                <h4>Export clinic list</h4>
                <p>Download the clinic directory database as JSON.</p>
              </div>
              <button className="btn-secondary" onClick={() => alert("Clinic list exported.")}>Export</button>
            </div>
            
            <div className="action-row danger">
              <div>
                <h4>Reset article database</h4>
                <p>Clear all custom articles and restore system defaults.</p>
              </div>
              <button className="btn-secondary" onClick={() => { if(confirm("Reset article library?")) alert("Articles reset to defaults."); }}>Reset</button>
            </div>
          </div>
        </div>

      </div>

      <div className="btn-row">
        <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Back to Admin
        </Link>
      </div>

    </div>
  );
};

export default AdminSettings;
