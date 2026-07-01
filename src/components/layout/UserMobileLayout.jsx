import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import UserHeader from './UserHeader';
import { useReminderChecker } from '../../hooks/useReminderChecker';
import '../../styles/global.css';
import '../../styles/responsive.css';

const UserMobileLayout = () => {
  const { toastMessage, dismissToast } = useReminderChecker();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', backgroundColor: 'var(--paper-deep)' }}>
      <div className="mobile-app-shell">
        {/* Reminder Toast Overlay */}
        {toastMessage && (
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'var(--oxblood)',
            color: 'var(--paper)',
            padding: '16px 24px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'var(--font-base)',
            fontSize: '14px'
          }}>
            <span style={{ flex: 1 }}>{toastMessage}</span>
            <button 
              onClick={dismissToast} 
              style={{ background: 'transparent', border: 'none', color: 'var(--paper)', cursor: 'pointer', fontSize: '18px', padding: 0 }}
            >
              ×
            </button>
          </div>
        )}

        {/* Mobile Header Bar */}
        <UserHeader />

        {/* Main Content Area */}
        <main className="mobile-app-content">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Menu */}
        <Navbar />
      </div>
    </div>
  );
};

export default UserMobileLayout;
