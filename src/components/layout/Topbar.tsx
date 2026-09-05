import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  FileCheck2,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useComplianceStore } from '../../store/complianceStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AnimatedThemeToggler } from '../ui/AnimatedThemeToggler';

interface TopbarProps {
  onOpenCommandPalette: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommandPalette }) => {
  const { user, logout } = useAuthStore();
  const { violations } = useComplianceStore();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isConsumer = user?.role === 'consumer';

  const officerNotifications = [
    {
      id: 1,
      title: 'Critical Disparity Detected',
      message: 'OptiMax Whey 2kg weight shortfall (8% deficit). Section 36 SCN proposed.',
      time: '12m ago',
      type: 'critical',
    },
    {
      id: 2,
      title: 'Hearing Scheduled',
      message: 'Case #CCPA/ENF/2025/SZ-0418 hearing listed for 28 Feb 2025.',
      time: '45m ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'New Consumer Grievance',
      message: 'Citizen filed Dual MRP complaint for Flipkart order #771-0029311.',
      time: '2h ago',
      type: 'warning',
    },
  ];

  const consumerNotifications = [
    {
      id: 1,
      title: 'Grievance Under Investigation',
      message: 'Your deceptive packaging complaint #GRV-2025-001 was assigned to Zonal Legal Metrology Inspector.',
      time: '15m ago',
      type: 'info',
    },
    {
      id: 2,
      title: 'Packaging Evidence Verified',
      message: 'AI OCR verified 18% overprinted MRP violation on invoice #INV-9921.',
      time: '1h ago',
      type: 'info',
    },
    {
      id: 3,
      title: 'Statutory Notice Dispatched',
      message: 'CCPA has served statutory inquiry notice to manufacturer with 14-day compliance window.',
      time: '3h ago',
      type: 'warning',
    },
  ];

  const notifications = isConsumer ? consumerNotifications : officerNotifications;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left Search Bar Trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100/80 hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200/80 text-xs transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
            <span className="text-slate-500 group-hover:text-slate-800">
              {isConsumer
                ? 'Search Grievances, Products, or Brands...'
                : 'Quick Search (Products, Violations, Entities, Rules)...'}
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 font-mono text-[10px] bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-500 font-semibold shadow-xs">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live System Status Pill */}
        <div className={`hidden lg:flex items-center gap-2 px-2.5 py-1 border rounded-md text-[11px] font-mono ${
          isConsumer
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <span className={`h-2 w-2 rounded-full animate-pulse ${
            isConsumer ? 'bg-emerald-600' : 'bg-blue-600'
          }`} />
          <span>{isConsumer ? 'Consumer Portal: Online' : 'Rules Active: v4.2'}</span>
        </div>

        {/* Animated Theme Toggler */}
        <AnimatedThemeToggler />

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-modal border border-slate-200 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isConsumer ? 'Grievance Progress Alerts' : 'Live Compliance Alerts'} ({notifications.length})
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {isConsumer ? 'Consumer Desk' : 'Real-Time Ingestion'}
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-50 text-xs transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate(isConsumer ? '/dashboard/complaints' : '/dashboard/violations');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {isConsumer ? 'Track All My Grievances →' : 'View All Active Violations →'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <div className={`h-8 w-8 rounded-lg text-white flex items-center justify-center text-xs font-bold font-mono ${
              isConsumer ? 'bg-emerald-700' : 'bg-[#0F172A]'
            }`}>
              {user?.name.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-slate-900 truncate max-w-[120px]">{user?.name}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user?.role}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-modal border border-slate-200 py-2 z-30 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="font-bold text-slate-900">{user?.name}</div>
                <div className="text-[11px] text-slate-500 font-mono">{user?.email}</div>
                <div className="mt-1.5">
                  <Badge variant={isConsumer ? 'success' : 'primary'} size="sm" className="font-mono text-[9px] uppercase font-bold">
                    {user?.department}
                  </Badge>
                </div>
              </div>

              <div className="py-1">
                <div className="px-4 py-2 text-[11px] text-slate-500 font-mono">
                  {isConsumer ? 'Citizen ID' : 'Badge'}: <strong className="text-slate-800">{user?.badgeNumber}</strong>
                </div>

                {isConsumer ? (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/dashboard/complaints');
                    }}
                    className="w-full px-4 py-2 text-left text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>My Lodged Complaints</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/dashboard/settings');
                    }}
                    className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                    <span>Platform Settings & Rules</span>
                  </button>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout from Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
