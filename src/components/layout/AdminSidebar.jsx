import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const sidebarItems = [
    { path: '/admin', no: '01', label: 'Admin Dashboard' },
    { path: '/admin/content', no: '02', label: 'Manage Content' },
    { path: '/admin/self-exam-guide', no: '03', label: 'Manage Self-Exam' },
    { path: '/admin/facilities', no: '04', label: 'Manage Clinics' },
    { path: '/admin/feedback', no: '05', label: 'User Feedback' },
    { path: '/admin/summary', no: '06', label: 'System Summary' },
    { path: '/admin/settings', no: '07', label: 'Admin Settings' }
  ];

  return (
    <aside className="sidebar-navigation">
      <h1 className="toc-title" style={{ fontFamily: 'var(--font-display)', fontSize: '27px', fontWeight: '600' }}>
        Empower<em style={{ color: 'var(--coral)', fontStyle: 'italic', fontWeight: '500' }}>Her</em>
        <span style={{ fontSize: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--mustard)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>Admin Hub</span>
      </h1>
      <p className="toc-sub" style={{ fontSize: '12px', opacity: 0.55, margin: '0 0 26px' }}>
        Educational & preventive administration
      </p>
      <hr className="toc-rule" style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '0 0 18px' }} />
      
      <ul className="toc-list" style={{ listStyle: 'none', padding: 0, margin: '0 0 auto', display: 'flex', flexDirection: 'column' }}>
        {sidebarItems.map((item) => (
          <React.Fragment key={item.path}>
            {item.no === '07' && (
              <div className="sep" style={{ height: '1px', backgroundColor: 'var(--line)', margin: '14px 0' }} />
            )}
            <li style={{ marginBottom: '2px' }}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '10px',
                  textDecoration: 'none',
                  color: 'var(--ink)',
                  fontSize: '14.5px',
                  padding: '9px 4px',
                  borderBottom: '1px dotted transparent',
                  fontFamily: 'var(--font-body)',
                  fontWeight: isActive ? '600' : '400'
                })}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                <span className="no" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.4 }}>
                  {item.no}
                </span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          </React.Fragment>
        ))}
      </ul>
      
      <div className="toc-foot" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.45, letterSpacing: '0.05em', paddingTop: '18px', borderTop: '1px solid var(--line)' }}>
        EMPOWERHER ADMIN — ED. 2026
      </div>
    </aside>
  );
};

export default AdminSidebar;
