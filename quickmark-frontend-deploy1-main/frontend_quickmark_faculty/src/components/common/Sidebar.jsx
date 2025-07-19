import React from 'react';
import { LayoutDashboard, UserCheck, Book, Settings, GanttChartSquare, LogOut } from 'lucide-react';

// Sidebar navigation items
const navItems = [
  { name: 'Home', icon: LayoutDashboard, route: '/dashboard' },
  { name: 'Attendance', icon: UserCheck, route: '/mark-attendance' },
  { name: 'Subjects', icon: Book, route: '/subjects' },
  { name: 'Settings', icon: Settings, route: '/settings' },
];

const Sidebar = ({ currentRoute, onNavigate, onLogout }) => {
  return (
    <aside className="w-64 bg-white shadow-md flex-col hidden sm:flex">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-20 border-b">
        <GanttChartSquare className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold ml-2 text-text-primary">QuickMark</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <button
                onClick={() => onNavigate(item.route)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                  currentRoute === item.route
                    ? 'bg-primary text-white' // Active state
                    : 'text-text-secondary hover:bg-gray-100' // Inactive state
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="ml-4 font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="px-6 pb-4">
        <button
          onClick={onLogout}
          className="group flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 font-bold text-white shadow-md transition-all duration-300 ease-in-out hover:bg-red-600 hover:shadow-lg w-full"
        >
          <LogOut className="mr-2 h-5 w-5 transition-transform duration-300 ease-in-out group-hover:scale-110" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
