// frontend/lib/api/hooks/useAuth.tsx
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import api from '../client';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'receptionist' | 'bar_staff' | 'housekeeping' | 'ceo';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const { data } = await api.get('/auth/me/');
      setUser(data);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

const login = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login/', { username, password });
    const data = response.data;
    
    console.log('✅ Login successful! Response:', data); // Check what you're getting

    // Check different possible response structures
    let accessToken, refreshToken, userData;

    // Structure 1: { access: "...", refresh: "...", user: {...} }
    if (data.access && data.refresh) {
      accessToken = data.access;
      refreshToken = data.refresh;
      userData = data.user;
    }
    // Structure 2: { token: "...", refresh: "...", user: {...} }
    else if (data.token && data.refresh) {
      accessToken = data.token;
      refreshToken = data.refresh;
      userData = data.user;
    }
    // Structure 3: { access_token: "...", refresh_token: "...", user: {...} }
    else if (data.access_token && data.refresh_token) {
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
      userData = data.user;
    }
    // Structure 4: Just tokens, user data in separate field
    else if (data.access && data.refresh) {
      accessToken = data.access;
      refreshToken = data.refresh;
      // Try to get user from different possible locations
      userData = data.user || data.profile || data.data;
    }
    // Structure 5: Unknown format - log it and try to find tokens
    else {
      console.warn('Unknown response format:', data);
      // Try to find any token-like properties
      const possibleToken = data.access || data.token || data.access_token;
      const possibleRefresh = data.refresh || data.refresh_token;
      
      if (possibleToken && possibleRefresh) {
        accessToken = possibleToken;
        refreshToken = possibleRefresh;
        userData = data.user || data.profile || null;
      } else {
        throw new Error('Could not find authentication tokens in response');
      }
    }

    // Store tokens
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    // Handle user data
    if (userData) {
      setUser(userData);
      toast.success(`Welcome back, ${userData.first_name || 'User'}!`);

      // Redirect based on role
      if (userData.role === 'bar_staff') {
        router.push('/sales');
      } else if (userData.role === 'receptionist') {
        router.push('/bookings');
      } else {
        router.push('/');
      }
    } else {
      // If no user data, fetch it
      try {
        const userResponse = await api.get('/auth/me/');
        setUser(userResponse.data);
        toast.success('Login successful!');
        router.push('/');
      } catch (userError) {
        console.error('Failed to fetch user data:', userError);
        // Still redirect even if user fetch fails
        router.push('/');
      }
    }
  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Login failed';
    
    toast.error(errorMessage);
    throw error;
  }
};

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh }).catch(() => {
          // Silently fail if logout endpoint doesn't exist
          console.log('Logout endpoint not available');
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      router.push('/login');
      toast.success('Logged out successfully');
    }
  };

  const hasPermission = (allowedRoles: string[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};