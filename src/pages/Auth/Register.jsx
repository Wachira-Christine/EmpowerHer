import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth_glass.css';
import desertImg from '../../assets/desert.jpg';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingState, setLoadingState] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const getFriendlyErrorMessage = (error) => {
    if (!error || !error.code) return error.message || "Registration failed. Please check your details.";
    switch (error.code) {
      case 'auth/email-already-in-use':
        return "This email address is already in use by another account.";
      case 'auth/invalid-email':
        return "The email address format is not valid.";
      case 'auth/weak-password':
        return "The password is too weak. It must be at least 6 characters long.";
      case 'auth/operation-not-allowed':
        return "Email/Password accounts are not enabled. Please contact support.";
      default:
        return error.message;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!agreed) {
      setErrorMsg("Please agree to the Terms of Use and Privacy Policy.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    
    setLoadingState(true);
    try {
      await register(name, email, password, phoneNumber);
      navigate('/dashboard');
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
        {/* Left Side: Form */}
        <div className="auth-form-panel">
          <h2 className="auth-title">Sign up</h2>
          <p className="auth-sub" style={{ display: 'none' }}>Set up your private breast health support account.</p>

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
              <label htmlFor="name">User name</label>
              <div className="auth-field-input-wrap">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Auma"
                  required
                />
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <div className="auth-field-input-wrap">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jane@domain.com"
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
              <label htmlFor="phoneNumber">Phone Number (Optional)</label>
              <div className="auth-field-input-wrap">
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +254712345678"
                />
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
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
                  placeholder="Choose a password"
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

            <div className="auth-field">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-field-input-wrap">
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retype password"
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

            <div className="auth-remember" style={{ margin: '14px 0', fontSize: '11px', display: 'flex', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
              />
              <label htmlFor="terms" style={{ cursor: 'pointer', lineHeight: '1.4', opacity: 0.85 }}>
                I agree to the Terms of Use and Privacy Policy, and understand EmpowerHer is educational and does not offer medical diagnosis.
              </label>
            </div>

            <button type="submit" className="auth-btn-pill" disabled={loadingState}>
              {loadingState ? 'Creating Account...' : 'Sign up'}
            </button>
          </form>

          <div className="auth-center-link">
            <Link to="/login">Already have an account?</Link>
          </div>
        </div>

        {/* Right Side: Desert Image */}
        <div className="auth-visual-panel">
          <img src={desertImg} alt="Private breast health support" className="auth-image" />
        </div>
      </div>
    </div>
  );
};

export default Register;
