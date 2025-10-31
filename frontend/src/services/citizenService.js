import api from './api.js';

export const citizenService = {
  async getStats() {
    const response = await api.get('/citizen/stats');
    return response.data;
  },

  async getRecentRequests() {
    const response = await api.get('/citizen/requests');
    return response.data;
  },

  async createRequest(requestData) {
    const response = await api.post('/citizen/requests', requestData);
    return response.data;
  }
};