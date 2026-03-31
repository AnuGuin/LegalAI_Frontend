"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider?: string;
  userType?: string;
  role?: string; 
  createdAt?: string;
  lastLoginAt?: string;
}

interface UserContextType {
  user: User | null;
  isCitizen: boolean;
  isLawyer: boolean;
  isFirm: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeUserType = (type?: string, role?: string): 'citizen' | 'lawyer' | 'firm' | null => {
    const typeToUse = type || role;
    if (!typeToUse) return null;
    const normalized = typeToUse.toLowerCase();
    if (normalized === 'citizen' || normalized === 'user') return 'citizen';
    if (normalized === 'lawyer') return 'lawyer';
    if (normalized === 'firm' || normalized === 'firm_admin' || normalized === 'firm_member') return 'firm';
    return null;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || localStorage.getItem('lawyerUser') || localStorage.getItem('firmUser');
    
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('lawyerToken') || 
                  localStorage.getItem('lawyerAuthToken') || 
                  localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('lawyerUser');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('lawyerUser');
    localStorage.removeItem('firmUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('lawyerToken');
    localStorage.removeItem('lawyerAuthToken');
    localStorage.removeItem('token');
  };

  const value: UserContextType = {
    user,
    isCitizen: normalizeUserType(user?.userType, user?.role) === 'citizen',
    isLawyer: normalizeUserType(user?.userType, user?.role) === 'lawyer',
    isFirm: normalizeUserType(user?.userType, user?.role) === 'firm',
    isLoading,
    login,
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}