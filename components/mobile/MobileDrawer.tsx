'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  snapPoints?: number[];
  defaultSnapPoint?: number;
}

/**
 * Mobile Drawer / Sheet Component
 * Bottom sheet drawer for mobile modals and menus
 */
export function MobileDrawer({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  snapPoints = [0, 0.5, 1],
  defaultSnapPoint = 0.75,
}: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white dark:bg-slate-900',
          'rounded-t-2xl',
          'max-h-[90vh] overflow-y-auto',
          'animate-in slide-in-from-bottom-96',
          className
        )}
      >
        {/* Handle / Drag indicator */}
        <div className="flex justify-center pt-2 pb-3">
          <div className="h-1 w-10 rounded-full bg-gray-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        {title && (
          <div className="sticky top-0 bg-white dark:bg-slate-900 px-4 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close drawer"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-6 pb-24">
          {children}
        </div>
      </div>
    </>
  );
}

/**
 * Mobile Modal Component
 * Centered modal dialog for mobile
 */
export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true,
  size = 'md',
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
        <div
          className={cn(
            'w-full bg-white dark:bg-slate-900 rounded-2xl',
            'shadow-xl dark:shadow-2xl',
            'max-h-[90vh] overflow-y-auto',
            'animate-in zoom-in-95',
            sizeStyles[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileDrawer;
