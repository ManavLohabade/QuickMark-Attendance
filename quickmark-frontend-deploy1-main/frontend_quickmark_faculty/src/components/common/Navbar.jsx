// components/common/Navbar.js

import React from 'react';
import { Bell } from 'lucide-react';

// 1. Accept 'currentRoute' as a prop
const Navbar = ({ user, onNavigate, currentRoute }) => {

  // 2. Create a handler that contains the toggle logic
  const handleProfileClick = () => {
    // 3. Check if the user is ALREADY on the profile page
    if (currentRoute === '/profile') {
      // If yes, navigate them back to the main dashboard
      onNavigate('/dashboard');
    } else {
      // Otherwise, navigate them to the profile page
      onNavigate('/profile');
    }
  };

  return (
    <header className="flex items-center justify-end h-20 bg-white shadow-sm px-4 sm:px-6 md:px-8">
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <button className="p-2 rounded-full text-text-secondary hover:bg-gray-100 hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <Bell className="h-6 w-6" />
        </button>

        {/* Profile Avatar */}
        <button
          // 4. Call the new handler function on click
          onClick={handleProfileClick}
          className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full"
        >
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={user.avatar}
            alt="User Avatar"
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/E2E8F0/4A5568?text=U"; }}
          />
        </button>
      </div>
    </header>
  );
};

export default Navbar;