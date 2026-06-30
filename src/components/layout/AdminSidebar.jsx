import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const sidebarItems = [
    { path: '/admin', no: 'A1', label: 'Admin dashboard' },
    { path: '/admin/content', no: 'A2', label: 'Manage content' },
    { path: '/admin/self-exam-guide', no: 'A3', label: 'Self-exam guide' },
    { path: '/admin/facilities', no: 'A4', label: 'Facilities' },
    { path: '/admin/settings', no: 'A5', label: 'Admin settings' }
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
            {item.no === '←' && (
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

      <div style={{ marginTop: 'auto', padding: '14px 4px 10px' }}>
        <button 
          onClick={handleLogout} 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--oxblood)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
      
      <div className="toc-foot" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.45, letterSpacing: '0.05em', paddingTop: '18px', borderTop: '1px solid var(--line)' }}>
        EMPOWERHER ADMIN — ED. 2026
      </div>
    </aside>
  );
};

export default AdminSidebar;
