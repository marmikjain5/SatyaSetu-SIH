import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ScanLine,
  ShieldAlert,
  Building2,
  MessageSquareWarning,
  LineChart,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  BookOpen,
  Factory,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useComplianceStore } from '../../store/complianceStore';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuthStore();
  const { violations, complaints } = useComplianceStore();
  const navigate = useNavigate();

  const openViolationsCount = violations.filter((v) => v.status === 'Open' || v.status === 'Notice Issued').length;
  const newComplaintsCount = complaints.filter((c) => c.status === 'New' || c.status === 'Triaged').length;

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      to: '/dashboard/products',
      label: 'Products',
      icon: Package,
      badge: 'Live',
    },
    {
      to: '/dashboard/scanner',
      label: 'Product Scanner',
      icon: ScanLine,
      badge: 'New',
    },
    {
      to: '/dashboard/violations',
      label: 'Violations',
      icon: ShieldAlert,
      badge: openViolationsCount > 0 ? `${openViolationsCount}` : undefined,
      badgeVariant: 'danger' as const,
    },
    {
      to: '/dashboard/manufacturers',
      label: 'Manufacturers',
      icon: Building2,
      badge: '1.2K',
    },
    {
      to: '/dashboard/complaints',
      label: 'Complaints',
      icon: MessageSquareWarning,
      badge: newComplaintsCount > 0 ? `${newComplaintsCount}` : undefined,
      badgeVariant: 'warning' as const,
    },
    {
      to: '/dashboard/analytics',
      label: 'Analytics',
      icon: LineChart,
      badge: undefined,
    },
    {
      to: '/dashboard/regulatory-rag',
      label: 'Regulatory RAG',
      icon: BookOpen,
      badge: 'RAG',
      badgeVariant: 'warning' as const,
    },
    {
      to: '/dashboard/factory-hygiene',
      label: 'Factory Hygiene',
      icon: Factory,
      badge: undefined,
    },
    {
      to: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      badge: undefined,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-[#0F172A] text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>SatyaDrishti</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                  Compliance Intel
                </div>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Shield className="h-5 w-5" />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Role Card */}
        {!isCollapsed && user && (
          <div className="p-3.5 m-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
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
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.designation}</p>
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
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                          item.badgeVariant === 'danger'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : item.badgeVariant === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300'
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
      <div className="p-3 border-t border-slate-800 space-y-2">
        <NavLink
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
          title="Public Portal"
        >
          <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
          {!isCollapsed && <span>Public Portal</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-950/40 hover:text-red-300 text-xs transition-colors ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
          title="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
