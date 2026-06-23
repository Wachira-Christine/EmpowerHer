import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin.css';

const AdminDashboard = () => {
  const stats = {
    articles: 5,
    facilities: 6,
    feedback: 3
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Control Panel</p>
        <h2 className="h1">Admin <em>Dashboard</em></h2>
        <p className="dek">Manage database directories, educational posts, and view community feedback.</p>
      </div>

      <div className="notice">
        <b>Admin Notice</b>
        Please keep all patient data confidential. Note that PWA health records are stored locally on user devices and are not stored in central databases.
      </div>

      {/* Grid Stats */}
      <div className="admin-grid">
        <div className="admin-card">
          <span className="corner"></span>
          <h3>{stats.articles}</h3>
          <span>Total Articles</span>
        </div>
        <div className="admin-card">
          <span className="corner alt"></span>
          <h3>{stats.facilities}</h3>
          <span>Facilities Listed</span>
        </div>
        <div className="admin-card">
          <span className="corner alt2"></span>
          <h3>{stats.feedback}</h3>
          <span>Pending Feedback</span>
        </div>
      </div>

      {/* Tools Section */}
      <div className="section-head">
        <h3>Administrative Tools</h3>
        <div className="rule"></div>
        <span className="tag">6 modules</span>
      </div>

      {/* Bento Grid */}
      <div className="bento-grid">
        
        <Link to="/admin/content" className="bento-card">
          <span className="corner"></span>
          <span className="no">01</span>
          <div>
            <h4>Manage Educational Content</h4>
            <p>Create, edit, or remove educational articles and health resources.</p>
          </div>
          <span className="arrow">Edit Library &rarr;</span>
        </Link>

        <Link to="/admin/self-exam-guide" className="bento-card alt">
          <span className="corner"></span>
          <span className="no">02</span>
          <div>
            <h4>Manage Self-Exam Guide</h4>
            <p>Update tutorial steps, media attachments, and instructions for guided checks.</p>
          </div>
          <span className="arrow">Configure Guide &rarr;</span>
        </Link>

        <Link to="/admin/facilities" className="bento-card alt2">
          <span className="corner"></span>
          <span className="no">03</span>
          <div>
            <h4>Manage Clinic Directory</h4>
            <p>Update healthcare centers, phone numbers, and services offered.</p>
          </div>
          <span className="arrow">Manage Facilities &rarr;</span>
        </Link>

        <Link to="/admin/feedback" className="bento-card">
          <span className="corner"></span>
          <span className="no">04</span>
          <div>
            <h4>User Feedback</h4>
            <p>Review feedback, ratings, and questions submitted by the community.</p>
          </div>
          <span className="arrow">Read Feedback &rarr;</span>
        </Link>

        <Link to="/admin/summary" className="bento-card wide alt">
          <span className="corner"></span>
          <span className="no">05</span>
          <div>
            <h4>System Summary</h4>
            <p>View application metrics, total interactions, and diagnostic log placeholders.</p>
          </div>
          <span className="arrow">Open Summary &rarr;</span>
        </Link>

        <Link to="/admin/settings" className="bento-card wide alt2">
          <span className="corner"></span>
          <span className="no">06</span>
          <div>
            <h4>Admin Settings</h4>
            <p>Modify local admin password, adjust notification configurations, and manage backup files.</p>
          </div>
          <span className="arrow">Configure System &rarr;</span>
        </Link>

      </div>

      <div className="btn-row">
        <Link to="/dashboard" className="btn-secondary" style={{ display: 'inline-flex', textDecoration: 'none', alignItems: 'center', justifyContent: 'center' }}>
          Exit Admin Area
        </Link>
      </div>

    </div>
  );
};

export default AdminDashboard;
