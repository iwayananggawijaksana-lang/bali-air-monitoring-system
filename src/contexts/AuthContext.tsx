import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminService } from '../services/adminService';
import { AuthContextType, Admin, LoginCredentials } from '../types/admin';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      const storedAdmin = localStorage.getItem('adminData');
      if (storedAdmin) {
        try {
          setIsAdmin(true);
          setAdmin(JSON.parse(storedAdmin));
        } catch (error) {
          console.error('Error parsing admin data:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        }
      }
    }
    setLoading(false);
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await adminService.login(credentials);
      if (response && response.token) {
        const adminData: Admin = { 
          username: response.username || credentials.username, 
          token: response.token 
        };
        
        setIsAdmin(true);
        setAdmin(adminData);
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('adminData', JSON.stringify(adminData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = (): void => {
    setIsAdmin(false);
    setAdmin(null);
    adminService.logout();
  };

  const contextValue: AuthContextType = {
    isAdmin,
    admin,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};