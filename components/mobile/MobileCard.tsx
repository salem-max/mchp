'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Mobile Card Component
 * Flexible card for displaying content with proper mobile spacing
 */
export function MobileCard({
  children,
  className,
  onClick,
  interactive = false,
  variant = 'default',
  padding = 'md',
}: MobileCardProps) {
  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700',
    elevated: 'bg-white dark:bg-slate-900 shadow-md dark:shadow-lg',
    outlined: 'border-2 border-gray-300 dark:border-slate-600',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'rounded-lg transition-all',
        variantStyles[variant],
        paddingStyles[padding],
        interactive &&
          'cursor-pointer active:opacity-80 hover:shadow-lg dark:hover:shadow-xl',
        className
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Mobile Card Header
 */
export function MobileCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      {children}
    </div>
  );
}

/**
 * Mobile Card Title
 */
export function MobileCardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn('font-semibold text-gray-900 dark:text-white', className)}>
      {children}
    </h3>
  );
}

/**
 * Mobile Card Description
 */
export function MobileCardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-sm text-gray-600 dark:text-gray-400', className)}>
      {children}
    </p>
  );
}

/**
 * Mobile Card Content
 */
export function MobileCardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

/**
 * Mobile Card Footer
 */
export function MobileCardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700', className)}>
      {children}
    </div>
  );
}

export default MobileCard;
