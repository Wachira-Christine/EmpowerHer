import React from 'react';
import { NavLink } from 'react-router-dom';

const UserSidebar = () => {
  const sidebarItems = [
    { path: '/dashboard', no: '01', label: 'Home' },
    { path: '/education', no: '02', label: 'Learn' },
    { path: '/self-examination', no: '03', label: 'Self-check guide' },
    { path: '/records', no: '04', label: 'History log' },
    { path: '/reminders', no: '05', label: 'Reminders' },
    { path: '/clinics', no: '06', label: 'Clinic directory' },
    { path: '/profile', no: '07', label: 'Profile & settings' }
  ];

  return (
    <aside className="sidebar-navigation">
      <h1 className="toc-title" style={{ fontFamily: 'var(--font-display)', fontSize: '27px', fontWeight: '600' }}>
        Empower<em style={{ color: 'var(--coral)', fontStyle: 'italic', fontWeight: '500' }}>Her</em>
      </h1>
      <p className="toc-sub" style={{ fontSize: '12px', opacity: 0.55, margin: '0 0 26px' }}>
        Private breast health support
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
        EMPOWERHER PWA — ED. 2026
      </div>
    </aside>
  );
};

export default UserSidebar;
