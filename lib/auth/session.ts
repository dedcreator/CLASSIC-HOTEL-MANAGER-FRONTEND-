// frontend/lib/auth/session.ts

export const sessionManager = {
  // Check if session is still valid
  isSessionValid: () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return false;
    
    // Optional: Check token expiry if you store it
    const tokenExpiry = localStorage.getItem('token_expiry');
    if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
      return false;
    }
    
    return true;
  },
  
  // Refresh the session
  refreshSession: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        // Set token expiry (7 days from now)
        localStorage.setItem('token_expiry', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
        return true;
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
    
    return false;
  },
  
  // Clear session
  clearSession: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expiry');
  }
};