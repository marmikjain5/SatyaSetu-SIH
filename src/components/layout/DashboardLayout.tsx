import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { CommandPalette } from './CommandPalette';
import { useAuthStore } from '../../store/authStore';
import { GridPattern } from '../ui/GridPattern';
import { cn } from '../../lib/utils';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Protected route check
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-x-hidden">
      {/* Global Background Grid Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <GridPattern
          width={48}
          height={48}
          squares={[
            [4, 3],
            [12, 6],
            [18, 2],
            [6, 14],
            [22, 10],
            [15, 18],
            [28, 14],
            [8, 24],
            [24, 22],
            [30, 8],
            [3, 30],
          ]}
          className={cn(
            '[mask-image:radial-gradient(1200px_circle_at_50%_200px,white,transparent_85%)]',
            'opacity-70 fill-blue-600/[0.04] stroke-slate-900/[0.04] dark:fill-blue-400/[0.08] dark:stroke-white/[0.05]'
          )}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 flex flex-col min-h-screen relative z-10 ${
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
