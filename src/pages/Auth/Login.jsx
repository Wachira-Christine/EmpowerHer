import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth_glass.css';
import desertImg from '../../assets/desert.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [msg, setMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Please enter your email address first.');
      return;
    }
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('../../firebase/firebase');
      await sendPasswordResetEmail(auth, email);
      setMsg('Password reset link sent. Please check your email.');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-email') setErrorMsg('Please enter a valid email address.');
      else if (err.code === 'auth/user-not-found') setErrorMsg('No account was found with this email.');
      else if (err.code === 'auth/network-request-failed') setErrorMsg('Network error. Please try again.');
      else setErrorMsg('Could not send password reset email. Please try again.');
    }
  };

  const getFriendlyErrorMessage = (error) => {
    if (!error || !error.code) return error.message || "Login failed. Please check your credentials.";
    switch (error.code) {
      case 'auth/user-not-found':
        return "No account matches this email address.";
      case 'auth/wrong-password':
        return "Incorrect password. Please try again.";
      case 'auth/invalid-email':
        return "The email address format is not valid.";
      case 'auth/user-disabled':
        return "This account has been disabled.";
      case 'auth/too-many-requests':
        return "Too many failed attempts. Please try again later.";
      default:
        return error.message;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg('');
    setLoadingState(true);

    try {
      const response = await login(email, password);
      // Determine redirection based on role
      const userRole = response.profile?.role || 'user';
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        if ((response.profile?.authProvider === 'email' || !response.profile?.authProvider) && !response.user.emailVerified) {
          navigate('/verify-email');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setLoadingState(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoadingState(true);
    try {
      const response = await googleLogin();
      const userRole = response.profile?.role || 'user';
      if (userRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLoadingState(false);
        return;
      }
      setErrorMsg(getFriendlyErrorMessage(err));
      setLoadingState(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-container">
        {/* Left Side: Desert Image */}
        <div className="auth-visual-panel">
          <img src={desertImg} alt="Private breast health support" className="auth-image" />
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-panel">
          <h2 className="auth-title">Login</h2>
          <p className="auth-sub" style={{ display: 'none' }}>Access your private breast health support account.</p>

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

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <div className="auth-field-input-wrap">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <div className="auth-field-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn-pill" disabled={loadingState} style={{ marginTop: '12px' }}>
              {loadingState ? 'Entering...' : 'Login'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
              <div style={{ flex: 1, borderTop: '1px solid var(--line)' }}></div>
              <span style={{ padding: '0 10px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--ink)', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>or</span>
              <div style={{ flex: 1, borderTop: '1px solid var(--line)' }}></div>
            </div>

            <button 
              type="button" 
              className="auth-btn-pill" 
              onClick={handleGoogleLogin} 
              disabled={loadingState}
              style={{ background: 'var(--paper)', color: 'var(--ink)', border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="auth-links-row">
            <Link to="/register">Create an account</Link>
            <a href="#" onClick={handleForgotPassword}>
              Forgot password
            </a>
          </div>

          <div className="auth-privacy-note" style={{ marginTop: '30px' }}>
            Your self-check records and preferences stay private and are only used to support your breast health journey.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
