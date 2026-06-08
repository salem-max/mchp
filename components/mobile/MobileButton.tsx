'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MobileButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    isLoading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

/**
 * Mobile Button Component
 * Touch-optimized button with minimum 44x44px touch target
 */
export function MobileButton(
    {
        children,
        variant = 'primary',
        size = 'md',
        fullWidth = false,
        isLoading = false,
        icon,
        iconPosition = 'left',
        className,
        disabled,
        ...props
    }: MobileButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>
) {
    const variantStyles = {
        primary:
            'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300',
        secondary:
            'bg-gray-200 text-gray-900 dark:bg-slate-700 dark:text-white hover:bg-gray-300 dark:hover:bg-slate-600 active:bg-gray-400 dark:active:bg-slate-500 disabled:bg-gray-100 dark:disabled:bg-slate-800',
        ghost:
            'bg-transparent text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 active:bg-gray-200 dark:active:bg-slate-700',
        danger:
            'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
    };

    const sizeStyles = {
        sm: 'min-h-10 px-3 text-sm rounded-lg',
        md: 'min-h-12 px-4 text-base rounded-lg',
        lg: 'min-h-14 px-6 text-lg rounded-lg',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center gap-2',
                'font-semibold transition-colors duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'active:scale-95 transition-transform',
                variantStyles[variant],
                sizeStyles[size],
                fullWidth && 'w-full',
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {icon && iconPosition === 'left' && !isLoading && icon}
            <span>{children}</span>
            {icon && iconPosition === 'right' && !isLoading && icon}
        </button>
    );
}

export default React.forwardRef(MobileButton);
