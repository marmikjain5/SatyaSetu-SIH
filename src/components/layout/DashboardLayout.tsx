import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { useAuthStore } from '../../store/authStore';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Protected route check
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 flex flex-col min-h-screen ${
          isSidebarCollapsed ? 'pl-18' : 'pl-64'
        }`}
      >
        {/* Topbar */}
        <Topbar onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

        {/* Page View Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
