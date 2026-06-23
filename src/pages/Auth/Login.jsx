import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth_glass.css';
import desertImg from '../../assets/desert.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                />
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
              </div>
            </div>

            <button type="submit" className="auth-btn-pill" disabled={loadingState} style={{ marginTop: '12px' }}>
              {loadingState ? 'Entering...' : 'Login'}
            </button>
          </form>

          <div className="auth-links-row">
            <Link to="/register">Create an account</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Forgot password functionality placeholder"); }}>
              Forgot password
            </a>
          </div>

          <Link to="/admin/login" className="auth-btn-secondary-outline">
            Login as Admin
          </Link>

          <div className="auth-privacy-note">
            Your self-check records and preferences stay private and are only used to support your breast health journey.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
