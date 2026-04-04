import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  // Fallback for current mocked state:
  role: 'admin' | 'employee';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Temporary mock accounts for UI testing
const MOCK_ACCOUNTS = [
  { email: 'we9li', password: '123', profile: { id: 'U-1', name: 'مدير النظام', role: 'admin' as const, branch: 'المركز الرئيسي' } },
  { email: 'we9l', password: '123', profile: { id: 'U-2', name: 'موظف مبيعات', role: 'employee' as const, branch: 'المركز الرئيسي' } },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for mock session
    const storedUser = localStorage.getItem('mockSessionUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, pass: string) => {
    // Simulate API call
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const account = MOCK_ACCOUNTS.find(a => a.email === email && a.password === pass);
        if (account) {
          setUser(account.profile);
          localStorage.setItem('mockSessionUser', JSON.stringify(account.profile));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockSessionUser');
  };

  // Provide fallback role for older components until fully migrated
  const role = user?.role || 'employee';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, role }}>
      {children}
    </AuthContext.Provider>
  );
}

// Rename this hook for standard pattern, but export backwards compatible useRole pointing to useAuth if needed.
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Fallback to not break immediate compilation layout
export function useRole() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useRole must be used within an AuthProvider');
  }
  return { role: context.role, setRole: () => { /* no-op in auth flow */ } };
}
