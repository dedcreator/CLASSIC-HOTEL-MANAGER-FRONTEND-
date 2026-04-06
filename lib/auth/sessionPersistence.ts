// frontend/lib/auth/sessionPersistence.ts
'use client';

import api from '../api/client';

export const sessionPersistence = {
  // Check if token is valid
  validateToken: async (): Promise<boolean> => {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me/');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
  
  // Refresh token
  refreshToken: async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;
    
    try {
      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      const newAccessToken = response.data.access;
      localStorage.setItem('access_token', newAccessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  },
  
  // Clear session
  clearSession: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }
};