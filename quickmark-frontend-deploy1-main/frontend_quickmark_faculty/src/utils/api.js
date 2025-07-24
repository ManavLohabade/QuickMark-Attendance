import axios from 'axios';

// Get API URL from environment variable or fallback to default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3700/api';

// Create axios instance with base configuration
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('API Request:', {
            url: config.url,
            method: config.method,
            data: config.data,
            headers: config.headers
        });
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('API Error Response:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            // Only redirect if it's an authentication error, not other 401 errors
            const errorMessage = error.response?.data?.message || ''; 
            
            // Check if it's a real auth error (token expired, invalid token, etc.)
            if (errorMessage.includes('token') || errorMessage.includes('unauthorized') || 
                errorMessage.includes('authentication') || errorMessage.includes('login')) {
                console.log('Authentication error detected, redirecting to login');
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                
                // Only redirect if not already on login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            } else {
                console.log('401 error but not authentication related:', errorMessage);
            }
        }
        return Promise.reject(error);
    }
);

export { API_BASE_URL };