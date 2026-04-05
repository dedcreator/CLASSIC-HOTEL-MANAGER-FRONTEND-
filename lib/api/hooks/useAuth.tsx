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
      
      console.log('✅ Login successful! Response:', data);

      let accessToken, refreshToken, userData;

      if (data.access && data.refresh) {
        accessToken = data.access;
        refreshToken = data.refresh;
        userData = data.user;
      } else if (data.token && data.refresh) {
        accessToken = data.token;
        refreshToken = data.refresh;
        userData = data.user;
      } else if (data.access_token && data.refresh_token) {
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        userData = data.user;
      } else {
        console.warn('Unknown response format:', data);
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

      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      if (userData) {
        setUser(userData);
        toast.success(`Welcome back, ${userData.first_name || 'User'}!`);

        if (userData.role === 'bar_staff') {
          router.push('/sales');
        } else if (userData.role === 'receptionist') {
          router.push('/bookings');
        } else {
          router.push('/');
        }
      } else {
        try {
          const userResponse = await api.get('/auth/me/');
          setUser(userResponse.data);
          toast.success('Login successful!');
          router.push('/');
        } catch (userError) {
          console.error('Failed to fetch user data:', userError);
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

  // Update profile method
  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const response = await api.put('/auth/update-profile/', data);
      const updatedUser = response.data.user;
      
      // Update user state
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success(response.data.message || 'Profile updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Change password method
  const changePassword = async (data: ChangePasswordData) => {
    try {
      const response = await api.post('/auth/change-password/', data);
      toast.success(response.data.message || 'Password changed successfully');
      
      // Optional: Auto logout after password change
      setTimeout(() => {
        toast.success('Please login with your new password');
        logout();
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to change password';
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