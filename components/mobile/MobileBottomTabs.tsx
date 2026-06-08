'use client';

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export interface TabItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
  testId?: string;
}

interface MobileBottomTabsProps {
  tabs: TabItem[];
  className?: string;
  onTabChange?: (href: string) => void;
}

/**
 * Mobile Bottom Tab Navigation
 * Primary navigation for mobile apps - typically for 3-5 main sections
 */
export function MobileBottomTabs({
  tabs,
  className,
  onTabChange,
}: MobileBottomTabsProps) {
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useAppStore();

  const handleTabClick = (href: string) => {
    setActiveTab(href);
    onTabChange?.(href);
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-white dark:bg-slate-900',
        'border-t border-gray-200 dark:border-slate-700',
        'safe-area-bottom',
        className
      )}
      role="tablist"
    >
      <div className="flex items-center justify-around h-16 md:h-20 px-2">
        {tabs.map(({ icon, label, href, badge, testId }) => {
          const isActive = pathname === href || activeTab === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2 px-3',
                'relative transition-colors duration-200',
                'text-xs md:text-sm font-medium',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              )}
              onClick={() => handleTabClick(href)}
              role="tab"
              data-testid={testId}
              aria-selected={isActive}
            >
              <span className="relative mb-1">
                {icon}
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </span>
              <span className="line-clamp-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomTabs;
