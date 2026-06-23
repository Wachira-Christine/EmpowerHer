import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/admin.css';

const SystemSummary = () => {
  const metrics = [
    { label: 'Active Users (Local Cache)', value: '142' },
    { label: 'Guided Self-Exams Started', value: '512' },
    { label: 'Guided Self-Exams Completed', value: '408' },
    { label: 'Clinic Locator Searches', value: '310' },
    { label: 'Reminder Alerts Fired', value: '86' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div>
        <p className="eyebrow">Admin Tool</p>
        <h2 className="h1">System <em>Summary</em></h2>
        <p className="dek">View application metrics, total interactions, and diagnostic log placeholders.</p>
      </div>

      <div className="notice">
        <b>Wording Reminder</b>
        This application does not collect, store, or transmit personal health information or private self-check logs. Metrics represent aggregated local-first check statistics.
      </div>

      <div className="section-head">
        <h3>Application Metrics</h3>
        <div className="rule"></div>
        <span className="tag">Summary stats</span>
      </div>

      {/* Stats list */}
      <div className="setting-list">
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

      <div className="btn-row" style={{ marginTop: '16px' }}>
        <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>
          Back to Admin
        </Link>
      </div>

    </div>
  );
};

export default SystemSummary;
