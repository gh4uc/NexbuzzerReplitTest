
import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const logout = () => {
    // In a real app, this would clear session/tokens
    console.log('User logged out');
    // For now, just reload the page to reset state
    window.location.reload();
  };

  const refreshUser = () => {
    // In a real app, this would fetch updated user data
    console.log('Refreshing user data');
  };

  const value = {
    user: null,
    isAuthenticated: false,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
