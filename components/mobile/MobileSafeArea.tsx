'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MobileSafeAreaProps {
  children: React.ReactNode;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  pb?: boolean; // Add padding-bottom for fixed bottom nav
}

/**
 * Mobile Safe Area Wrapper
 * Respects notches and safe area insets on mobile devices
 * Uses CSS env() variables for viewport-fit=cover
 */
export function MobileSafeArea({
  children,
  className,
  edges = ['top', 'bottom', 'left', 'right'],
  pb = false,
}: MobileSafeAreaProps) {
  const paddingClasses = cn(
    edges.includes('top') && 'pt-[env(safe-area-inset-top)]',
    edges.includes('bottom') && pb && 'pb-[calc(64px+env(safe-area-inset-bottom))]',
    edges.includes('left') && 'pl-[env(safe-area-inset-left)]',
    edges.includes('right') && 'pr-[env(safe-area-inset-right)]'
  );

  return (
    <div className={cn(paddingClasses, className)}>
      {children}
    </div>
  );
}

/**
 * Mobile Safe Area Container
 * Full-screen container that respects safe areas
 */
export function MobileSafeAreaContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        'pt-[env(safe-area-inset-top)]',
        'pl-[env(safe-area-inset-left)]',
        'pr-[env(safe-area-inset-right)]',
        className
      )}
    >
      {children}
    </div>
  );
}

export default MobileSafeArea;
