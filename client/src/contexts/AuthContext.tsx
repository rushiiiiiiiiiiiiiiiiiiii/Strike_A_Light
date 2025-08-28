import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (userData: Partial<User> & { password: string }) => Promise<User | null>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock login - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: `${role}_${Date.now()}`,
      name: role === 'individual' ? 'John Doe' : role === 'institution' ? 'Tech Institute Admin' : 'Super Admin',
      email,
      role,
      institutionName: role === 'institution' ? 'Tech Institute' : undefined,
      createdAt: new Date(),
    };
    
    setUser(mockUser);
    setIsLoading(false);
    return true;
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<User | null> => {
    setIsLoading(true);
    
    // Mock registration - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `${userData.role}_${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'individual',
      institutionName: userData.institutionName,
      createdAt: new Date(),
    };
    
    setUser(newUser);
    setIsLoading(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};