import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
    baseURL: 'https://quickmark-backend-deploy1.onrender.com/api',
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
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
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