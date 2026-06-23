import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile 
} from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Monitor Firebase Auth status changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: profile.fullName || firebaseUser.displayName,
              role: profile.role || 'user',
              accountStatus: profile.accountStatus || 'active',
              ...profile
            });
          } else {
            // Profile doc might be missing or still creating, default to standard user
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: 'user',
              accountStatus: 'active'
            });
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: 'user',
            accountStatus: 'active'
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await loginUser(email, password);
      setUser({
        uid: response.user.uid,
        email: response.user.email,
        displayName: response.profile.fullName,
        role: response.profile.role,
        accountStatus: response.profile.accountStatus,
        ...response.profile
      });
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phoneNumber) => {
    setLoading(true);
    try {
      const response = await registerUser(name, email, password, phoneNumber);
      setUser({
        uid: response.user.uid,
        email: response.user.email,
        displayName: response.profile.fullName,
        role: response.profile.role,
        accountStatus: response.profile.accountStatus,
        ...response.profile
      });
      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
