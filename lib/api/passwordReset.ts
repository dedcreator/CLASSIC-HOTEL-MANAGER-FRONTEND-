// frontend/lib/api/passwordReset.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const passwordResetService = {
  async forgotPassword(email: string) {
    const response = await axios.post(`${API_URL}/auth/forgot-password/`, { email });
    return response.data;
  },

  async verifyToken(token: string) {
    const response = await axios.post(`${API_URL}/auth/verify-reset-token/`, { token });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    const response = await axios.post(`${API_URL}/auth/reset-password/`, {
      token,
      new_password: newPassword,
      confirm_password: confirmPassword
    });
    return response.data;
  }
};