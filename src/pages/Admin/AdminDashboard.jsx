import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Static placeholder metrics matching design reference
  const articlesCount = 6;
  const clinicsCount = 6;
  const stepsCount = 7;
  const pendingUpdatesCount = 3;

  const quickAccessCards = [
    {
      title: 'Manage Educational Content',
      desc: 'Create, view, update, and remove breast health awareness articles shown on the Learn page.',
      actions: ['Add article', 'View articles', 'Edit article', 'Delete article'],
      route: '/admin/content',
      altClass: ''
    },
    {
      title: 'Manage Self-Examination Guide',
      desc: 'Update the step-by-step guidance, health notes, and supportive messages used in the guided self-examination page.',
      actions: ['View guide steps', 'Edit step', 'Update health note', 'Manage tutorial images'],
      route: '/admin/self-exam-guide',
      altClass: 'alt'
    },
    {
      title: 'Manage Clinic Directory',
      desc: 'Add and update health facilities shown on the Find Clinic page.',
      actions: ['Add facility', 'View facilities', 'Edit facility', 'Delete outdated facility'],
      route: '/admin/facilities',
      altClass: 'alt2'
    },
    {
      title: 'Admin Settings',
      desc: 'Manage admin account preferences and basic system settings.',
      actions: ['View admin profile', 'Change password', 'Log out'],
      route: '/admin/settings',
      altClass: ''
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header Section */}
      <div>
        <p className="eyebrow">Admin</p>
        <h2 className="h1">Admin <em>Dashboard</em></h2>
        <p className="dek">Manage educational content, clinic information, and system resources for EmpowerHer.</p>
      </div>

      {/* 2. Admin Scope Notice */}
      <div className="notice">
        <b>Admin scope</b>
        Admin actions should support accurate breast health education and safe user guidance. EmpowerHer does not provide diagnosis, risk prediction, or medical decision-making. Admins cannot view private self-check records or personal health notes.
      </div>

      {/* 3. Overview Section */}
      <div className="section-head">
        <h3>Overview</h3>
        <div className="rule"></div>
        <span className="tag">System summary</span>
      </div>

      <div className="summary-row">
        <div className="sum-card">
          <span className="corner"></span>
          <p className="label">Educational articles</p>
          <p className="value">{articlesCount}</p>
        </div>
        <div className="sum-card alt">
          <span className="corner"></span>
          <p className="label">Listed facilities</p>
          <p className="value">{clinicsCount}</p>
        </div>
        <div className="sum-card alt2">
          <span className="corner"></span>
          <p className="label">Self-exam steps</p>
          <p className="value">{stepsCount}</p>
        </div>
        <div className="sum-card">
          <span className="corner"></span>
          <p className="label">Pending updates</p>
          <p className="value flag">{pendingUpdatesCount}</p>
        </div>
      </div>

      {/* 4. Manage / Quick Access Section */}
      <div className="section-head">
        <h3>Manage</h3>
        <div className="rule"></div>
        <span className="tag">Four areas</span>
      </div>

      <div className="action-grid">
        {quickAccessCards.map((card, idx) => (
          <div key={idx} className={`act-card ${card.altClass}`}>
            <span className="corner"></span>
            <div>
              <h4>{card.title}</h4>
              <p>{card.desc}</p>
              <ul className="act-list">
                {card.actions.map((act, index) => (
                  <li key={index}>{act}</li>
                ))}
              </ul>
            </div>
            <button className="btn-mini" onClick={() => navigate(card.route)}>Open</button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;
