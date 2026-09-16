import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ScanLine,
  Factory,
  ShieldAlert,
  MessageSquareWarning,
  Building2,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useComplianceStore } from '../../store/complianceStore';
import { cn } from '../../lib/utils';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenMobileMenu,
  isMobileMenuOpen,
}) => {
  const { user } = useAuthStore();
  const { violations, complaints } = useComplianceStore();
  const location = useLocation();
  const userRole = user?.role || 'consumer';

  const openViolationsCount = violations.filter(
    (v) => v.status === 'Open' || v.status === 'Notice Issued'
  ).length;
  const newComplaintsCount = complaints.filter(
    (c) => c.status === 'New' || c.status === 'Triaged'
  ).length;

  interface NavItemDef {
    to: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  let roleItems: NavItemDef[] = [];

  if (userRole === 'inspector') {
    // 4 destinations + More = 5 items maximum
    roleItems = [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/dashboard/products', label: 'Products', icon: Package },
      { to: '/dashboard/scanner', label: 'Scan', icon: ScanLine },
      {
        to: '/dashboard/violations',
        label: 'Violations',
        icon: ShieldAlert,
        badge: openViolationsCount > 0 ? openViolationsCount : undefined,
      },
    ];
  } else if (userRole === 'manufacturer') {
    roleItems = [
      { to: '/dashboard/scanner', label: 'Packaging', icon: ScanLine },
      { to: '/dashboard/factory-certification', label: 'Hygiene', icon: Factory },
    ];
  } else if (userRole === 'consumer') {
    roleItems = [
      {
        to: '/dashboard/complaints',
        label: 'Grievances',
        icon: MessageSquareWarning,
        badge: newComplaintsCount > 0 ? newComplaintsCount : undefined,
      },
      { to: '/directory', label: 'Directory', icon: Building2 },
    ];
  } else {
    // admin: 4 destinations + More = 5 items maximum
    roleItems = [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/dashboard/products', label: 'Products', icon: Package },
      { to: '/dashboard/scanner', label: 'Scan', icon: ScanLine },
      {
        to: '/dashboard/violations',
        label: 'Violations',
        icon: ShieldAlert,
        badge: openViolationsCount > 0 ? openViolationsCount : undefined,
      },
    ];
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-1 py-1 max-w-lg mx-auto">
        {roleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex-1 flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1 rounded-xl transition-all relative select-none',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                {typeof item.badge === 'number' && (
                  <span className="absolute -top-1 -right-2 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium mt-0.5 tracking-tight whitespace-nowrap leading-none text-center">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 h-0.5 w-6 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </NavLink>
          );
        })}

        {/* More / Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          className={cn(
            'flex-1 flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1 rounded-xl transition-all text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 select-none'
          )}
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium mt-0.5 tracking-tight whitespace-nowrap leading-none text-center">More</span>
        </button>
      </div>
    </nav>
  );
};
