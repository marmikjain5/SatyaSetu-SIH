import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'segmented',
  className,
}) => {
  if (variant === 'segmented') {
    return (
      <div className={cn('inline-flex p-1 bg-slate-100/90 rounded-lg border border-slate-200/80', className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.2 rounded-full',
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex border-b border-slate-200 space-x-6', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors -mb-px',
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
