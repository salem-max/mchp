'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface MobileInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'filled';
}

/**
 * Mobile Input Component
 * Optimized text input for mobile with proper spacing and touch targets
 */
export function MobileInput(
    {
        label,
        error,
        helperText,
        icon,
        variant = 'default',
        className,
        ...props
    }: MobileInputProps,
    ref: React.ForwardedRef<HTMLInputElement>
) {
    const variantStyles = {
        default:
            'border border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400',
        filled:
            'bg-gray-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 dark:focus:border-blue-400',
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}

                <input
                    ref={ref}
                    className={cn(
                        'w-full min-h-12 px-4 py-3 rounded-lg',
                        'text-base font-normal',
                        'bg-white dark:bg-slate-900',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                        'transition-colors duration-200',
                        'disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed',
                        icon && 'pl-10',
                        error && 'border-red-500 dark:border-red-400',
                        variantStyles[variant],
                        className
                    )}
                    {...props}
                />
            </div>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            )}

            {helperText && !error && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {helperText}
                </p>
            )}
        </div>
    );
}

/**
 * Mobile Textarea Component
 */
export function MobileTextarea(
    {
        label,
        error,
        helperText,
        className,
        ...props
    }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
        label?: string;
        error?: string;
        helperText?: string;
    },
    ref: React.ForwardedRef<HTMLTextAreaElement>
) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {label}
                </label>
            )}

            <textarea
                ref={ref}
                className={cn(
                    'w-full min-h-24 px-4 py-3 rounded-lg',
                    'text-base font-normal',
                    'bg-white dark:bg-slate-900',
                    'border border-gray-300 dark:border-slate-600',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                    'transition-colors duration-200',
                    'disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed',
                    error && 'border-red-500 dark:border-red-400',
                    className
                )}
                {...props}
            />

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            )}

            {helperText && !error && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {helperText}
                </p>
            )}
        </div>
    );
}

export default React.forwardRef(MobileInput);
