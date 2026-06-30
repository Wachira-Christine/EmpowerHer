import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { db, auth } from '../../firebase/firebase';
import '../../styles/admin.css';

const AdminSettings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Settings State
  const [profileName, setProfileName] = useState('Admin User');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Preference fields
  const [defaultArticleStatus, setDefaultArticleStatus] = useState('Draft');
  const [confirmDeleteContent, setConfirmDeleteContent] = useState(true);
  const [confirmDeleteFacilities, setConfirmDeleteFacilities] = useState(true);

  // Modals visibility
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Form inputs
  const [editNameInput, setEditNameInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAdminSettings = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileName(data.fullName || data.displayName || 'Admin User');
        setEditNameInput(data.fullName || data.displayName || 'Admin User');
        
        if (data.adminSettings) {
          setDefaultArticleStatus(data.adminSettings.defaultArticleStatus || 'Draft');
          setConfirmDeleteContent(data.adminSettings.confirmBeforeDeletingContent !== false);
          setConfirmDeleteFacilities(data.adminSettings.confirmBeforeDeletingFacilities !== false);
        }
      } else {
        setProfileName(user.displayName || 'Admin User');
        setEditNameInput(user.displayName || 'Admin User');
      }
    } catch (err) {
      console.error("Error loading admin settings:", err);
      showToast("Error loading preferences.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminSettings();
  }, [user]);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        adminSettings: {
          defaultArticleStatus,
          confirmBeforeDeletingContent: confirmDeleteContent,
          confirmBeforeDeletingFacilities: confirmDeleteFacilities,
          updatedAt: serverTimestamp()
        }
      }, { merge: true });

      showToast("Admin settings updated successfully.");
    } catch (err) {
      console.error(err);
      showToast("Could not update your settings. Please try again.", "error");
    }
  };

  const handleCancelPreferences = () => {
    loadAdminSettings();
    showToast("Unsaved changes reverted.");
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    if (!editNameInput.trim()) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        fullName: editNameInput,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setProfileName(editNameInput);
      setIsEditProfileOpen(false);
      showToast("Profile updated successfully.");
      
      // Force reload page state to sync context if needed
      window.location.reload();
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile", "error");
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showToast("All fields are required.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Your new password should be at least 6 characters.", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast("The new passwords do not match.", "error");
      return;
    }

    setPasswordUpdating(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        showToast("Session expired. Please log in again.", "error");
        return;
      }

      // Reauthenticate
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, newPassword);
      
      showToast("Password updated successfully.");
      setIsChangePasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        showToast("The current password you entered is incorrect.", "error");
      } else {
        showToast("Could not update your password. Please try again.", "error");
      }
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error(err);
      showToast("Logout failed", "error");
    }
  };

  // Avatar initial character helper
  const getInitials = (name) => {
    if (!name) return 'A';
    return name.trim().charAt(0).toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast alert */}
      {toast && (
        <div className={`toast-notification ${toast.type === 'error' ? 'error' : 'success'}`} style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2000,
          background: toast.type === 'error' ? 'var(--oxblood-deep)' : 'var(--success-bg)',
          color: toast.type === 'error' ? '#fff' : 'var(--success)',
          padding: '12px 20px',
          border: '1.5px solid currentColor',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px'
        }}>
          {toast.message}
        </div>
      )}

      {/* Heading & Intro */}
      <div>
        <p className="eyebrow">Admin / A5</p>
        <h2 className="h1">Admin <em>Settings</em></h2>
        <p className="dek">Manage admin account options and basic admin preferences.</p>
      </div>

      {/* Profile Overview */}
      <div className="section-head">
        <h3>Admin profile</h3>
        <div className="rule" />
        <span className="tag">Overview</span>
      </div>

      <div className="profile-card">
        <span className="corner"></span>
        <div className="profile-top">
          <div className="avatar">{getInitials(profileName)}</div>
          <div>
            <p className="profile-name">{profileName}</p>
            <span className="status-pill">{user?.accountStatus || 'Active'}</span>
          </div>
        </div>
        <div className="info-grid">
          <div className="info-item">
            <p className="label">Email</p>
            <p className="value">{user?.email || 'amina.admin@example.com'}</p>
          </div>
          <div className="info-item">
            <p className="label">Role</p>
            <p className="value" style={{ textTransform: 'capitalize' }}>{user?.role || 'Administrator'}</p>
          </div>
          <div className="info-item">
            <p className="label">Account status</p>
            <p className="value" style={{ textTransform: 'capitalize' }}>{user?.accountStatus || 'Active'}</p>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn-secondary" onClick={() => { setEditNameInput(profileName); setIsEditProfileOpen(true); }}>Edit admin profile</button>
        </div>
      </div>

      {/* Account Security */}
      <div className="section-head">
        <h3>Account security</h3>
        <div className="rule" />
        <span className="tag">Access</span>
      </div>

      <div className="action-list">
        <div className="action-row">
          <div>
            <h4>Change password</h4>
            <p>Update the password used to access the admin panel.</p>
          </div>
          <button className="btn-secondary" onClick={() => setIsChangePasswordOpen(true)}>Change password</button>
        </div>
        <div className="action-row">
          <div>
            <h4>Log out</h4>
            <p>Sign out of the admin panel on this device.</p>
          </div>
          <button className="btn-ghost" onClick={handleLogoutClick}>Log out</button>
        </div>
      </div>

      {/* Admin Preferences */}
      <div className="section-head">
        <h3>Admin preferences</h3>
        <div className="rule" />
        <span className="tag">Workflow</span>
      </div>

      <form onSubmit={handleSavePreferences}>
        <div className="setting-list">
          <div className="setting-row">
            <div>
              <h4>Default article status</h4>
              <p>Determine default toggle settings for new educational posts.</p>
            </div>
            <select 
              value={defaultArticleStatus} 
              onChange={(e) => setDefaultArticleStatus(e.target.value)}
              style={{
                width: '140px',
                border: '1px solid var(--line)',
                background: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '6px 8px',
                outline: 'none'
              }}
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <h4>Confirm before deleting content</h4>
              <p>Ask for manual approval when removing articles from storage.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={confirmDeleteContent}
                onChange={(e) => setConfirmDeleteContent(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-row">
            <div>
              <h4>Confirm before deleting facilities</h4>
              <p>Ask for confirmation when removing clinics from directories.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={confirmDeleteFacilities}
                onChange={(e) => setConfirmDeleteFacilities(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: '24px' }}>
          <button type="submit" className="btn-primary">Save changes</button>
          <button type="button" className="btn-ghost" onClick={handleCancelPreferences}>Cancel</button>
        </div>
      </form>

      {/* ============ EDIT PROFILE MODAL ============ */}
      {isEditProfileOpen && (
        <div className="modal-overlay show" onClick={() => setIsEditProfileOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Edit admin profile</h4>
            <p>Update your public display name on the portal.</p>
            <form onSubmit={handleEditProfileSubmit}>
              <div className="field" style={{ marginBottom: '20px' }}>
                <label>Display name</label>
                <input 
                  type="text" 
                  value={editNameInput} 
                  onChange={(e) => setEditNameInput(e.target.value)} 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setIsEditProfileOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save name</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ CHANGE PASSWORD MODAL ============ */}
      {isChangePasswordOpen && (
        <div className="modal-overlay show" onClick={() => setIsChangePasswordOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Change password</h4>
            <p>Enter your credentials to update account access keys.</p>
            <form onSubmit={handleChangePasswordSubmit}>
              <div className="field">
                <label>Current password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="field">
                <label>New password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="field" style={{ marginBottom: '24px' }}>
                <label>Confirm new password</label>
                <input 
                  type="password" 
                  value={confirmNewPassword} 
                  onChange={(e) => setConfirmNewPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setIsChangePasswordOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={passwordUpdating}>
                  {passwordUpdating ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSettings;
