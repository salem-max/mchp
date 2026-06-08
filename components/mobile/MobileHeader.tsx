'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, Menu, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'transparent';
}

/**
 * Mobile Header Component
 * Simple, clean header for mobile screens
 */
export function MobileHeader({
  title,
  subtitle,
  onBack,
  showBackButton = false,
  showMenuButton = true,
  rightAction,
  className,
  variant = 'default',
}: MobileHeaderProps) {
  const router = useRouter();
  const { mobileMenuOpen, toggleMobileMenu } = useAppStore();

  const handleBack = () => {
    onBack ? onBack() : router.back();
  };

  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700',
    primary: 'bg-blue-600 text-white',
    transparent: 'bg-transparent',
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30',
        'flex items-center justify-between',
        'h-16 px-4',
        'pt-[env(safe-area-inset-top)]',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        {showBackButton && (
          <button
            onClick={handleBack}
            className={cn(
              'p-2 -ml-2 rounded-lg transition-colors',
              variant === 'primary'
                ? 'hover:bg-blue-700'
                : 'hover:bg-gray-100 dark:hover:bg-slate-800'
            )}
            aria-label="Go back"
          >
            <ChevronLeft
              size={24}
              className={variant === 'primary' ? 'text-white' : ''}
            />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <h1
            className={cn(
              'text-lg font-bold truncate',
              variant === 'primary'
                ? 'text-white'
                : 'text-gray-900 dark:text-white'
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                'text-xs truncate',
                variant === 'primary'
                  ? 'text-blue-100'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightAction}

        {showMenuButton && (
          <button
            onClick={toggleMobileMenu}
            className={cn(
              'p-2 rounded-lg transition-colors',
              variant === 'primary'
                ? 'hover:bg-blue-700'
                : 'hover:bg-gray-100 dark:hover:bg-slate-800'
            )}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X
                size={24}
                className={variant === 'primary' ? 'text-white' : ''}
              />
            ) : (
              <Menu
                size={24}
                className={variant === 'primary' ? 'text-white' : ''}
              />
            )}
          </button>
        )}
      </div>
    </header>
  );
}

export default MobileHeader;
