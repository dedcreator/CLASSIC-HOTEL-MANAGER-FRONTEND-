// frontend/lib/api/hooks/useTokenRefresh.ts

import { useEffect } from 'react';
import { sessionManager } from '@/lib/auth/session';

export function useTokenRefresh() {
  useEffect(() => {
    // Refresh token every 6 days (before 7-day expiry)
    const interval = setInterval(async () => {
      const success = await sessionManager.refreshSession();
      if (!success) {
        // If refresh fails, redirect to login
        sessionManager.clearSession();
        window.location.href = '/login';
      }
    }, 6 * 24 * 60 * 60 * 1000); // 6 days
    
    return () => clearInterval(interval);
  }, []);
}