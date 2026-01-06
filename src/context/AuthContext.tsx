import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { signIn as apiSignIn, getCurrentUser } from '../services/api';

export type User = {
  id: number;
  role_id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  setUserFromPayload: (user: User | null) => void;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiSignIn(email, password);
      // if API returned user directly, use it; otherwise refresh from server
      if (res?.user) setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    try {
      localStorage.removeItem('authToken');
    } catch (e) {
      // noop
    }
    setUser(null);
  };

  const setUserFromPayload = (u: User | null) => {
    setUser(u);
  };

  // On mount, if there's a token, validate it by calling the backend
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      setLoading(true);
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch (e) {
        // token invalid or request failed; clear token and user
        try {
          localStorage.removeItem('authToken');
        } catch (er) {
          // noop
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const isAdmin = () => {
    if (!user) return false;
    return user.role_id === 2;
  };

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    setUserFromPayload,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
