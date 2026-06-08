'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * 3D Data Visualization
 * Placeholder for Three.js based data visualizations
 * Can be used for time-series data, network graphs, heatmaps in 3D
 */
export function DataVisualization3D({
  title,
  description,
  className,
  children,
  height = '600px',
}: {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  height?: string;
}) {
  return (
    <div className={cn('rounded-lg bg-white dark:bg-slate-900 shadow-lg overflow-hidden', className)}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      <div
        style={{ height }}
        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 relative"
      >
        {children || (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                3D Visualization
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Ready for data rendering
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Interactive 3D Element
 * Base component for interactive 3D elements
 */
export function Interactive3D({
  className,
  onInteraction,
  children,
}: {
  className?: string;
  onInteraction?: (event: React.MouseEvent) => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative rounded-lg cursor-pointer transition-transform hover:scale-105',
        'bg-gradient-to-br from-blue-500 to-purple-600',
        'shadow-lg hover:shadow-xl',
        className
      )}
      onClick={onInteraction}
      role="button"
      tabIndex={0}
    >
      <div className="aspect-square flex items-center justify-center text-white">
        {children || (
          <div className="text-center">
            <div className="text-4xl mb-2">🎨</div>
            <p className="text-sm font-medium">Interactive 3D</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataVisualization3D;
