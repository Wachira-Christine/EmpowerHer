import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../../styles/global.css';
import '../../styles/responsive.css';

const AdminLayout = () => {
  return (
    <div className="app-container app-container-with-sidebar">
      {/* Desktop Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Admin Header Bar */}
        <header className="desktop-header-hide" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid var(--line)',
          backgroundColor: 'var(--paper)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🛠️</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--oxblood)', fontFamily: 'var(--font-display)' }}>
              Empower<em style={{ color: 'var(--coral)', fontStyle: 'italic', fontWeight: '500' }}>Her</em> Admin
            </h1>
          </div>
          <Link to="/dashboard" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--coral)', textDecoration: 'underline' }}>
            Exit Admin
          </Link>
        </header>

        {/* Main Content Area */}
        <main className="main-content" style={{ paddingBottom: '30px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
