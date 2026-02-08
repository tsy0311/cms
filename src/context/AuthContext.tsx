import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple admin credentials (in production, this should be handled by a backend)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // Change this in production!
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setIsAdmin(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      setIsAuthenticated(true);
      setIsAdmin(true);
      localStorage.setItem('adminAuth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('adminAuth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

