import axios from 'axios';

const API_BASE_URL = 'https://quickmark-backend-deploy1.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Faculty Auth API
export const authAPI = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Get faculty profile
  getProfile: async () => {
    const response = await api.get('/faculty/me');
    return response.data;
  },

  // Update faculty profile
  updateProfile: async (profileData) => {
    const response = await api.put('/faculty/me', profileData);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
  },
};

export default authAPI;
