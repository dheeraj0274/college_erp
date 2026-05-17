import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../api/services';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('erp-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('erp-token'));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(credentials);
      const { user: userData, accessToken } = data.data;
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('erp-user', JSON.stringify(userData));
      localStorage.setItem('erp-token', accessToken);
      toast.success('Login successful');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const loginDirect = useCallback((userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('erp-user', JSON.stringify(userData));
    localStorage.setItem('erp-token', accessToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (e) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('erp-user');
    localStorage.removeItem('erp-token');
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await authAPI.getProfile();
      setUser(data.data.user);
      localStorage.setItem('erp-user', JSON.stringify(data.data.user));
    } catch (e) {}
  }, []);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, setLoading, login, loginDirect, logout, fetchProfile, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
