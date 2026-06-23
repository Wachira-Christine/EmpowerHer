import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--paper)',
        fontFamily: 'var(--font-mono)',
        color: 'var(--oxblood)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'user') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
