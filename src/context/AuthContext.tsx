import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface LoyaltyLevel {
  name: string;
  discount: number;
  icon: string;
  color: string;
}

interface User {
  id: number;
  phone: string;
  name: string;
  email: string;
  role: string;
  bonus_balance: number;
  total_spent: number;
  loyalty: LoyaltyLevel;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<{ error?: string }>;
  register: (data: object) => Promise<{ error?: string }>;
  logout: () => void;
  refresh: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const session = localStorage.getItem('ipro_session');
    if (!session) { setLoading(false); return; }
    const res = await api.me();
    if (res.user) setUser(res.user);
    else { localStorage.removeItem('ipro_session'); setUser(null); }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const login = async (phone: string, password: string) => {
    const res = await api.login({ phone, password });
    if (res.error) return { error: res.error };
    localStorage.setItem('ipro_session', res.session_id);
    setUser(res.user);
    return {};
  };

  const register = async (data: object) => {
    const res = await api.register(data);
    if (res.error) return { error: res.error };
    localStorage.setItem('ipro_session', res.session_id);
    setUser(res.user);
    return {};
  };

  const logout = async () => {
    await api.logout();
    localStorage.removeItem('ipro_session');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
