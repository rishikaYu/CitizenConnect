import api from './api.js';

export const authService = {
  register: async (userData) => {
    try {
      console.log('📧 AuthService: Sending registration request to /auth/register');
      const response = await api.post('/auth/register', userData);
      console.log('✅ AuthService: Registration successful', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AuthService: Registration failed', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('📧 AuthService: Sending login request to /auth/login');
      const response = await api.post('/auth/login', credentials);
      console.log('✅ AuthService: Login successful', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AuthService: Login failed', error);
      throw error;
    }
  }
};