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
  role: string;
  phone?: string;
}

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  password?: string;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  hasPermission: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper functions for session management
  const sessionHelpers = {
    clearSession: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    },
    
    setSession: (accessToken: string, refreshToken: string, userData: User) => {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    },
    
    getTokens: () => ({
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token'),
    })
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { access: token, refresh: refreshToken } = sessionHelpers.getTokens();
      const storedUser = localStorage.getItem('user');
      
      if (!token || !refreshToken) {
        setLoading(false);
        return;
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
      
      try {
        const { data } = await api.get('/auth/me/');
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } catch (error: any) {
        console.error('Token validation failed:', error);
        
        if (error.response?.status === 401 && refreshToken) {
          try {
            const response = await api.post('/auth/token/refresh/', {
              refresh: refreshToken
            });
            
            if (response.data.access) {
              const newAccessToken = response.data.access;
              localStorage.setItem('access_token', newAccessToken);
              api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              
              const { data } = await api.get('/auth/me/');
              setUser(data);
              localStorage.setItem('user', JSON.stringify(data));
            }
          } catch (refreshError) {
            console.error('Refresh failed, clearing session');
            sessionHelpers.clearSession();
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      const data = response.data;
      
      let accessToken, refreshToken, userData;

      if (data.access && data.refresh) {
        accessToken = data.access;
        refreshToken = data.refresh;
        userData = data.user;
      } else if (data.token && data.refresh) {
        accessToken = data.token;
        refreshToken = data.refresh;
        userData = data.user;
      } else {
        throw new Error('Could not find authentication tokens in response');
      }

      // Ensure role is uppercase
      if (userData && userData.role) {
        userData.role = userData.role.toUpperCase();
      }

      sessionHelpers.setSession(accessToken, refreshToken, userData);
      setUser(userData);
      
      toast.success(`Welcome back, ${userData?.first_name || userData?.username || 'User'}!`);

      if (userData?.role === 'BAR_STAFF') {
        router.push('/sales');
      } else if (userData?.role === 'RECEPTIONIST') {
        router.push('/bookings');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh }).catch(() => {});
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionHelpers.clearSession();
      setUser(null);
      router.push('/login');
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.put('/auth/update-profile/', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success(response.data.message || 'Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
      throw error;
    }
  };

  const changePassword = async (data: ChangePasswordData) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.post('/auth/change-password/', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success(response.data.message || 'Password changed successfully');
      
      setTimeout(() => {
        toast.success('Please login with your new password');
        logout();
      }, 2000);
    } catch (error: any) {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
      throw error;
    }
  };

  const hasPermission = (allowedRoles: string[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateProfile,
      changePassword,
      hasPermission 
    }}>
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