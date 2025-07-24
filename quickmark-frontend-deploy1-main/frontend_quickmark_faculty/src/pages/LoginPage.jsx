// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { GanttChartSquare, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { authAPI } from '../api/auth';

const GoogleIcon = (props) => (
    <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        width="1em"
        height="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g>
            <path
                d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.148 0-3.359 2.75-6.148 6.125-6.148 1.922 0 3.211.82 3.953 1.523l2.703-2.633C17.07 2.82 14.977 1.75 12.04 1.75 6.617 1.75 2.25 6.117 2.25 11.5c0 5.383 4.367 9.75 9.79 9.75 5.633 0 9.375-3.945 9.375-9.523 0-.641-.07-1.125-.16-1.704z"
                fill="#FFC107"
            />
            <path
                d="M3.545 7.345l3.273 2.402c.891-1.703 2.578-2.898 4.482-2.898 1.094 0 2.07.375 2.844 1.008l2.703-2.633C15.07 2.82 12.977 1.75 10.04 1.75c-3.75 0-6.922 2.148-8.495 5.595z"
                fill="#FF3D00"
            />
            <path
                d="M12.04 21.25c2.844 0 5.227-.938 6.969-2.555l-3.219-2.637c-.891.633-2.031 1.008-3.75 1.008-3.047 0-5.625-2.055-6.547-4.844l-3.273 2.531C3.07 18.82 7.07 21.25 12.04 21.25z"
                fill="#4CAF50"
            />
            <path
                d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.148 0-.547.07-1.078.18-1.586l-3.273-2.531C2.07 7.82 1.75 9.617 1.75 11.5c0 5.383 4.367 9.75 9.79 9.75 5.633 0 9.375-3.945 9.375-9.523 0-.641-.07-1.125-.16-1.704z"
                fill="#1976D2"
            />
        </g>
    </svg>
);

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email || !password) {
            setError('Please enter both email and password.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await authAPI.login(email, password);
            const { token, faculty } = response;

            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', faculty.email);
            localStorage.setItem('userId', faculty.id);
            localStorage.setItem('userName', faculty.name);

            const userDataForApp = {
                id: faculty.id,
                name: faculty.name,
                email: faculty.email,
                designation: faculty.designation || 'Faculty',
                subjectsTaught: faculty.subjects || [],
                avatar: faculty.photo_url || `https://placehold.co/100x100/E2E8F0/4A5568?text=${faculty.name.charAt(0)}`
            };

            onLogin(token, userDataForApp);
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-200 h-full flex flex-col items-center justify-center">
            {/* Logo Section */}
            <div className="flex items-center justify-center h-20">
                <GanttChartSquare className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold ml-2 text-text-primary">QuickMark</h1>
            </div>

            <div className="w-full max-w-md bg-sky-100 p-8 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-text-primary">Faculty Login</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your college email"
                            className="w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center disabled:bg-gray-100 disabled:cursor-not-allowed"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="text-center w-full px-4 py-3 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-4 flex items-center text-text-secondary disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                Logging in...
                            </>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                <div className="my-8 flex items-center">
                    <div className="flex-grow border-t border-border-color"></div>
                    <span className="flex-shrink mx-4 text-text-secondary text-sm">Or continue with</span>
                    <div className="flex-grow border-t border-border-color"></div>
                </div>

                <button
                    onClick={() => {/* Implement Google auth */}}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-border-color rounded-lg text-text-primary bg-white hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <GoogleIcon className="h-6 w-6 mr-3" />
                    <span className="font-medium">Sign in with Google</span>
                </button>
            </div>
        </div>
    );
};

export default LoginPage;