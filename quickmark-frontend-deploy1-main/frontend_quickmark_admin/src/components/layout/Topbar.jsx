// src/components/layout/Topbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Bell, User, ArrowLeft } from 'lucide-react';

export default function Topbar({ onLogout, showBackButton, onBack, title }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors mr-4"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        {title && (
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* Profile icon and dropdown menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            A
          </button>

          {/* Conditional rendering of the popup menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
              <div className="px-4 py-2 text-sm text-gray-700">
                <p className="font-semibold">Hi, Admin</p>
              </div>
              <div className="border-t border-gray-100"></div>
              <div className="flex items-center justify-start p-4">
                <button
                  onClick={onLogout}
                  className="group flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 font-bold text-white shadow-md transition-all duration-300 ease-in-out hover:bg-red-600 hover:shadow-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5 transition-transform duration-300 ease-in-out group-hover:scale-110"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}