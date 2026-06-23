import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Placeholder for user authentication state.
  // In the future, this will hook into Firebase Auth.
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);

  // Future Firebase Login implementation placeholder
  const login = async (email, password, role = 'user') => {
    setLoading(true);
    try {
      console.log('Firebase auth login placeholder called with:', email, role);
      // Simulate successful login of a normal user or admin
      setUser({ email, role, name: role === 'admin' ? 'Admin Operator' : 'Jane Doe' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Future Firebase Registration implementation placeholder
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      console.log('Firebase auth registration placeholder called for:', name, email);
      setUser({ email, role: 'user', name });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Future Firebase Sign Out implementation placeholder
  const logout = async () => {
    console.log('Firebase sign out placeholder called');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
