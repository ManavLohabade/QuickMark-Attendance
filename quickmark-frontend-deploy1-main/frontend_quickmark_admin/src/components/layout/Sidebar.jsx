// src/components/layout/Sidebar.jsx
import React from "react";
// Import new icons
import {
  LayoutDashboard,
  Book,
  User,
  Users, // Add Users icon for Faculty Management
  ShieldAlert,
  Settings,
  Building,
  GraduationCap, // Add this for Degree icon
  Activity,
  UserPlus,
} from "lucide-react";

export default function Sidebar({ currentPage, navigateTo, onLogout }) {
  // Updated navItems array - Following recommended flow order
  const navItems = [
    { path: "Home", label: "Home", icon: LayoutDashboard },
    { path: "Degree", label: "Degree", icon: GraduationCap }, // Degree link
    { path: "Departments", label: "Departments", icon: Building },
    { path: "Faculty", label: "Faculty", icon: User },
    { path: "Subjects", label: "Subjects", icon: Book },
    { path: "Students", label: "Students", icon: User },
    { path: "CoreEnrollments", label: "Enrollments", icon: UserPlus },
    { path: "Defaulters", label: "Defaulters", icon: ShieldAlert },
    { path: "FaceRegister", label: "Face Register", icon: "📷" },
    { path: "AdminActivityLog", label: "Activity Log", icon: Activity },
    { path: "FacultyManagement", label: "Faculty Management", icon: Users }, // Move here, below Activity Log
    { path: "Settings", label: "Settings", icon: Settings },
  ];

  const getIcon = (item) => {
    const Icon = item.icon;
    if (typeof Icon === "string") {
      return <span className="mr-3 text-lg">{Icon}</span>;
    }
    return <Icon size={18} className="mr-3" />;
  };

  return (
    <aside className="w-64 bg-white-800 text-black-900 flex-col hidden md:flex">
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold">QuickMark</h1>
      </div>
      {/* Main nav */}
      <nav className="flex-1 px-4 py-4">
        <ul>
          {navItems.map((item) => {
            const isActive = currentPage === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigateTo(item.path)}
                  className={`w-full flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-800 hover:bg-primary hover:text-white"
                  }`}
                >
                  {getIcon(item)}
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-6 pb-4">
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
    </aside>
  );
}