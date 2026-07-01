import React from 'react';
import { Link } from 'react-router-dom';

const UserHeader = () => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      borderBottom: '1px solid var(--line)',
      backgroundColor: 'var(--paper)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.5rem' }}>🌸</span>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--oxblood)', fontFamily: 'var(--font-display)', margin: 0 }}>
          Empower<em style={{ color: 'var(--coral)', fontStyle: 'italic', fontWeight: '500' }}>Her</em>
        </h1>
      </div>
      <Link to="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--oxblood-deep)',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px'
        }}>
          EH
        </div>
      </Link>
    </header>
  );
};

export default UserHeader;
