import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setLoading(false);
      return;
    }

    axios.get(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      setUser({
        id: response.data.id,
        email: response.data.email,
      });
    })
    .catch((err) => {
      localStorage.removeItem('jwt');
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        setError('Failed to restore your session. Please login again.');
      }
    })
    .finally(() => {
      setLoading(false);
    });
  }, []);

  const handleAuthError = (err: any): string => {
    if (axios.isAxiosError(err)) {
      const error = err as AxiosError<any>;
      if (error.response?.status === 400) {
        if (error.response.data?.error?.message?.includes('Email or Username')) {
          return 'An account with this email already exists';
        }
        if (error.response.data?.error?.message) {
          return error.response.data.error.message;
        }
        return 'Invalid email or password format';
      }
      if (error.response?.status === 401) {
        return 'Invalid email or password';
      }
      if (error.response?.status === 429) {
        return 'Too many attempts. Please try again later';
      }
      if (!error.response) {
        return 'Unable to connect to the server. Please check your internet connection';
      }
    }
    return 'An unexpected error occurred. Please try again';
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/api/auth/local`, {
        identifier: email,
        password,
      });

      localStorage.setItem('jwt', response.data.jwt);
      setUser({
        id: response.data.user.id,
        email: response.data.user.email,
      });
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        throw new Error('Password too short');
      }

      const response = await axios.post(`${API_URL}/api/auth/local/register`, {
        username: email.split('@')[0],
        email,
        password,
      });

      localStorage.setItem('jwt', response.data.jwt);
      setUser({
        id: response.data.user.id,
        email: response.data.user.email,
      });
    } catch (err) {
      const errorMessage = handleAuthError(err);
      setError(errorMessage);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('chatMessages');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 