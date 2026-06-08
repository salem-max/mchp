'use client';

import React, { Suspense } from 'react';
import { cn } from '@/lib/utils';

/**
 * 3D Canvas Container
 * Wrapper for Three.js/React Three Fiber scenes
 * Can be used for product visualizations, data visualizations, animations
 */
export function ThreeCanvas({
    children,
    className,
    fallback = <Canvas3DLoading />,
}: {
    children: React.ReactNode;
    className?: string;
    fallback?: React.ReactNode;
}) {
    return (
        <div className={cn('w-full h-full relative bg-gray-900', className)}>
            <Suspense fallback={fallback}>
                {children}
            </Suspense>
        </div>
    );
}

/**
 * 3D Loading Skeleton
 */
export function Canvas3DLoading() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
                <div className="animate-spin mr-2 inline-block">
                    <svg
                        className="w-8 h-8 text-blue-400"
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
                </div>
                <p className="text-gray-300 text-sm mt-4">Loading 3D Scene...</p>
            </div>
        </div>
    );
}

/**
 * 3D Card Container
 * Card wrapper for displaying 3D content
 */
export function Card3D({
    children,
    title,
    className,
    height = '400px',
}: {
    children: React.ReactNode;
    title?: string;
    className?: string;
    height?: string;
}) {
    return (
        <div className={cn('rounded-lg overflow-hidden shadow-lg', className)}>
            {title && (
                <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
                    <h3 className="text-white font-semibold">{title}</h3>
                </div>
            )}
            <div style={{ height }} className="bg-gray-900">
                {children}
            </div>
        </div>
    );
}

export default ThreeCanvas;
