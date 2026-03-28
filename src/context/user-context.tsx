"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  userType: string;
  createdAt: string;
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

  const normalizeUserType = (type?: string): 'citizen' | 'lawyer' | 'firm' | null => {
    if (!type) return null;
    const normalized = type.toLowerCase();
    if (normalized === 'citizen') return 'citizen';
    if (normalized === 'lawyer') return 'lawyer';
    if (normalized === 'firm' || normalized === 'firm_admin') return 'firm';
    return null;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
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
    localStorage.removeItem('authToken');
  };

  const value: UserContextType = {
    user,
    isCitizen: normalizeUserType(user?.userType) === 'citizen',
    isLawyer: normalizeUserType(user?.userType) === 'lawyer',
    isFirm: normalizeUserType(user?.userType) === 'firm',
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