import React from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import Navbar from './Navbar';
import '../../styles/global.css';
import '../../styles/responsive.css';

const UserLayout = () => {
  return (
    <div className="app-container app-container-with-sidebar">
      {/* Desktop User Sidebar */}
      <UserSidebar />

      {/* Main Content Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Header Bar */}
        <header className="desktop-header-hide" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'var(--paper)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🌸</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--oxblood)', fontFamily: 'var(--font-display)' }}>
              Empower<em style={{ color: 'var(--coral)', fontStyle: 'italic', fontWeight: '500' }}>Her</em>
            </h1>
          </div>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--oxblood)' }}>ED. 2026</div>
        </header>

        {/* Main Content Area */}
        <main className="main-content" style={{ paddingBottom: '84px' }}>
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Menu */}
        <div className="hide-desktop">
          <Navbar />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
