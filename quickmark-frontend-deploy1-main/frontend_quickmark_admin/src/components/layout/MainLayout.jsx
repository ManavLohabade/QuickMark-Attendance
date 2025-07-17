import React from 'react';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function MainLayout({ children, onLogout, showBackButton, onBack, title, navigateTo, currentPage }) {
  return (
    <div className="flex h-screen bg-white font-sans">
      <Sidebar onLogout={onLogout} navigateTo={navigateTo} currentPage={currentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          onLogout={onLogout} 
          showBackButton={showBackButton} 
          onBack={onBack}
          title={title}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}