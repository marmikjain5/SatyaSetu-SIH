import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Bot,
  ScanLine,
  ShieldAlert,
  Building2,
  MessageSquareWarning,
  LineChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  BookOpen,
  Scale,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useComplianceStore } from '../../store/complianceStore';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user, logout } = useAuthStore();
  const { violations, complaints, manufacturers } = useComplianceStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  }, [location.pathname]);

  // Prevent background body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  const openViolationsCount = violations.filter((v) => v.status === 'Open' || v.status === 'Notice Issued').length;
  const newComplaintsCount = complaints.filter((c) => c.status === 'New' || c.status === 'Triaged').length;
  const userRole = user?.role || 'consumer';

  const allNavItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'inspector'],
    },
    {
      to: '/dashboard/products',
      label: 'Products',
      icon: Package,
      badge: 'Live',
      roles: ['admin', 'inspector'],
    },
    {
      to: '/dashboard/crawler',
      label: 'E-Commerce Crawler',
      icon: Bot,
      badge: 'Auto',
      badgeVariant: 'warning' as const,
      roles: ['admin', 'inspector'],
    },
    {
      to: '/dashboard/scanner',
      label: 'Product Scanner',
      icon: ScanLine,
      badge: undefined,
      roles: ['admin', 'inspector'],
    },
    {
      to: '/dashboard/violations',
      label: 'Violations',
      icon: ShieldAlert,
      badge: openViolationsCount > 0 ? `${openViolationsCount}` : undefined,
      badgeVariant: 'danger' as const,
      roles: ['admin', 'inspector'],
    },
    {
      to: '/dashboard/manufacturers',
      label: 'Manufacturers',
      icon: Building2,
      badge: manufacturers?.length > 0 ? `${manufacturers.length}` : '1.2K',
      roles: ['admin', 'inspector'],
    },
    {
      to: '/dashboard/complaints',
      label:
        userRole === 'consumer'
          ? 'File & Track Complaints'
          : userRole === 'inspector'
          ? 'Assigned Grievances'
          : 'Grievance Adjudication',
      icon: MessageSquareWarning,
      badge: newComplaintsCount > 0 ? `${newComplaintsCount}` : undefined,
      badgeVariant: 'warning' as const,
      roles: ['admin', 'inspector', 'consumer'], // Exclude manufacturer
    },
    {
      to: '/dashboard/analytics',
      label: 'Analytics',
      icon: LineChart,
      roles: ['admin'],
    },
    {
      to: '/dashboard/regulatory-rag',
      label: 'Regulatory RAG',
      icon: BookOpen,
      badge: 'RAG',
      badgeVariant: 'warning' as const,
      roles: ['admin', 'inspector'],
    },
    {
      to: '/dashboard/legal-review',
      label: 'AI Legal Review',
      icon: Scale,
      badge: 'AI',
      badgeVariant: 'warning' as const,
      roles: ['admin', 'inspector'],
    },

  ];

  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Off-canvas Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-18' : 'w-72 lg:w-64'}`}
      >
        {/* Top Header */}
        <div className="overflow-y-auto flex-1 scrollbar-thin">
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    <span>SatyaDrishti</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                    {userRole === 'consumer'
                      ? 'Consumer Portal'
                      : 'Compliance Intel'}
                  </div>
                </div>
              </div>
            )}

            {isCollapsed && !isMobileOpen && (
              <div
                className={`mx-auto h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                  userRole === 'consumer'
                    ? 'bg-emerald-600'
                    : 'bg-blue-600'
                }`}
              >
                S
              </div>
            )}

            {/* Mobile Close Button (<lg) */}
            <div className="flex items-center gap-1">
              {isMobileOpen && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close navigation drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Desktop Collapse Toggle (lg+) */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* User Role Card */}
          {(!isCollapsed || isMobileOpen) && user && (
            <div className="p-3.5 m-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</div>
                <Badge
                  variant={
                    user.role === 'admin'
                      ? 'primary'
                      : user.role === 'inspector'
                      ? 'warning'
                      : 'success'
                  }
                  size="sm"
                  className="uppercase text-[9px] font-bold px-1.5 py-0.2"
                >
                  {user.role}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.designation}</p>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors min-h-[44px] ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`
                  }
                  title={isCollapsed && !isMobileOpen ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold shrink-0 ml-1.5 ${
                            item.badgeVariant === 'danger'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : item.badgeVariant === 'warning'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
          <NavLink
            to="/"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs min-h-[44px] ${
              isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
            }`}
            title="Public Portal"
          >
            <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
            {(!isCollapsed || isMobileOpen) && <span>Public Portal</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300 text-xs transition-colors min-h-[44px] ${
              isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
            }`}
            title="Logout"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

