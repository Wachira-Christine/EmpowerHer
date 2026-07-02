import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/firebase';
import '../../styles/auth_glass.css';
import desertImg from '../../assets/desert.jpg';

const VerifyEmail = () => {
  const { user, resendVerification, logout } = useAuth();
  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleResend = async () => {
    setLoadingState(true);
    setMsg('');
    setErrorMsg('');
    try {
      // resendVerification accepts the firebase user
      await resendVerification(auth.currentUser);
      setMsg('Verification email sent! Please check your inbox or spam folder.');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to send verification email. Please try again later.');
    } finally {
      setLoadingState(false);
    }
  };

  const handleCheckVerified = async () => {
    setLoadingState(true);
    setMsg('');
    setErrorMsg('');
    try {
      // Reload user to get latest emailVerified status
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        // Update Firestore
        const { doc, updateDoc, serverTimestamp, getDoc } = await import('firebase/firestore');
        const { db } = await import('../../firebase/firebase');
        const userRef = doc(db, 'users', auth.currentUser.uid);
        
        await updateDoc(userRef, {
          emailVerified: true,
          updatedAt: serverTimestamp()
        });

        // Check role and redirect
        const docSnap = await getDoc(userRef);
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setErrorMsg('Your email is not verified yet. Please check your inbox or spam folder.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error checking verification status.');
    } finally {
      setLoadingState(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="auth-wrap">
      <div className="auth-container">
        {/* Left Side: Desert Image */}
        <div className="auth-visual-panel">
          <img src={desertImg} alt="Private breast health support" className="auth-image" />
        </div>

        {/* Right Side: Message */}
        <div className="auth-form-panel">
          <h2 className="auth-title">Verify your email</h2>
          <p className="auth-sub" style={{ marginBottom: '20px' }}>
            Account created successfully. Please verify your email before continuing. We sent a verification link to your email address.
          </p>

          {msg && (
            <div style={{
              backgroundColor: 'rgba(63, 122, 82, 0.1)',
              border: '1px solid rgba(63, 122, 82, 0.2)',
              color: 'var(--success)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '15px',
              textAlign: 'left'
            }}>
              {msg}
            </div>
          )}

          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--oxblood)',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '13px',
              marginBottom: '15px',
              textAlign: 'left'
            }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <button 
              onClick={handleCheckVerified} 
              disabled={loadingState}
              className="auth-btn"
              style={{ padding: '14px 20px' }}
            >
              {loadingState ? 'Checking...' : 'I have verified my email'}
            </button>

            <button 
              onClick={handleResend} 
              disabled={loadingState}
              className="auth-btn"
              style={{ 
                background: 'transparent', 
                color: 'var(--oxblood)', 
                border: '1.5px solid var(--oxblood)',
                padding: '12px 20px'
              }}
            >
              Resend verification email
            </button>
            
            <button 
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ink)',
                opacity: 0.6,
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                textTransform: 'uppercase',
                padding: '10px',
                marginTop: '10px'
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
