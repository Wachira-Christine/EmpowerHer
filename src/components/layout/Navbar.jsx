import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/global.css';

const Navbar = () => {
  const navItems = [
    { path: '/dashboard', no: '01', label: 'Home' },
    { path: '/education', no: '02', label: 'Learn' },
    { path: '/self-examination', no: '03', label: 'Check' },
    { path: '/records', no: '04', label: 'History' },
    { path: '/profile', no: '05', label: 'Profile' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: 'var(--paper)',
      borderTop: '1px solid var(--line)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000
    }}>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: isActive ? 'var(--oxblood-deep)' : 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'var(--transition-fast)'
          })}
        >
          {({ isActive }) => (
            <>
              <span style={{ fontSize: '9px', opacity: isActive ? 1 : 0.4, color: isActive ? 'var(--coral)' : 'inherit' }}>
                {item.no}
              </span>
              <span style={{ fontWeight: isActive ? '600' : '400' }}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
