import axios from 'axios';

// Backend URLs - easy to switch when deploying
const API_BASE_URL = 'http://localhost:3700/api';
// const API_BASE_URL = 'https://quickmark-backend-deploy1.onrender.com/api'; // For deployment

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 second timeout
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error
            const message = error.response.data.message || 'An error occurred';
            if (error.response.status === 401) {
                // Clear invalid tokens
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
            }
            throw new Error(message);
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. Please try again.');
        } else if (error.request) {
            throw new Error('No response from server. Please check your connection.');
        }
        throw error;
    }
);

// Faculty Auth API
export const authAPI = {
    // Login
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error) {
            console.error('Login error:', error.message);
            throw error;
        }
    },

    // Get faculty profile
    getProfile: async () => {
        try {
            const response = await api.get('/faculty/me');
            return response.data;
        } catch (error) {
            console.error('Profile fetch error:', error.message);
            throw error;
        }
    },

    // Update faculty profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/faculty/me', profileData);
            return response.data;
        } catch (error) {
            console.error('Profile update error:', error.message);
            throw error;
        }
    },

    // Change faculty password
    changePassword: async (current_password, new_password) => {
        try {
            const response = await api.put('/faculty/me/password', { current_password, new_password });
            return response.data;
        } catch (error) {
            console.error('Password change error:', error.message);
            throw error;
        }
    },

    // Upload profile photo - simplified
    uploadProfilePhoto: async (formData) => {
        try {
            const response = await api.post('/faculty/me/photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to upload photo');
        }
    },

    // Check password expiry status
    checkPasswordStatus: async () => {
        try {
            const response = await api.get('/faculty/me/password-status');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
    }
};

export default authAPI;
