'use client';

import React from 'react';
import {
    MobileLayout,
    MobileHeader,
    MobileCard,
    MobileCardTitle,
    MobileCardDescription,
} from '@/components/mobile';
import { useIsMobile } from '@/hooks/mobile';
import { cn } from '@/lib/utils';
import { Home, Briefcase, Users, Settings } from 'lucide-react';

interface MobileDashboardLayoutProps {
    title: string;
    children: React.ReactNode;
    showHeader?: boolean;
    headerVariant?: 'default' | 'primary' | 'transparent';
    className?: string;
}

/**
 * Mobile Dashboard Layout
 * Template layout for dashboard pages with mobile-optimized navigation
 */
export function MobileDashboardLayout({
    title,
    children,
    showHeader = true,
    headerVariant = 'primary',
    className,
}: MobileDashboardLayoutProps) {
    const isMobile = useIsMobile();

    const navigationTabs = [
        { icon: <Home size={24} />, label: 'Home', href: '/' },
        { icon: <Briefcase size={24} />, label: 'Jobs', href: '/jobs' },
        { icon: <Users size={24} />, label: 'Customers', href: '/customers' },
        { icon: <Settings size={24} />, label: 'Settings', href: '/settings' },
    ];

    const header = showHeader ? (
        <MobileHeader
            title={title}
            variant={headerVariant}
            showMenuButton={isMobile}
            showBackButton={false}
        />
    ) : null;

    return (
        <MobileLayout
            tabs={navigationTabs}
            header={header}
            className={className}
            showTabs={isMobile}
        >
            <div className={cn('px-4 py-4 space-y-4', !isMobile && 'max-w-7xl mx-auto px-6 py-8')}>
                {children}
            </div>
        </MobileLayout>
    );
}

/**
 * Mobile Dashboard Welcome Card
 * Quick stats and greeting card
 */
export function MobileDashboardWelcome({
    greeting = 'Welcome back',
    userName = 'User',
    stats,
}: {
    greeting?: string;
    userName?: string;
    stats?: Array<{ label: string; value: string | number; icon?: React.ReactNode }>;
}) {
    return (
        <div className="space-y-4">
            <MobileCard variant="elevated">
                <h2 className="text-2xl font-bold text-white dark:text-white">
                    {greeting}, {userName}!
                </h2>
                <p className="text-blue-100 dark:text-blue-200 text-sm mt-1">
                    Here's what's happening today
                </p>
            </MobileCard>

            {stats && (
                <div className="grid grid-cols-2 gap-3">
                    {stats.map((stat, idx) => (
                        <MobileCard key={idx} variant="outlined">
                            <div className="text-center">
                                {stat.icon && <div className="mb-2 flex justify-center">{stat.icon}</div>}
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {stat.label}
                                </div>
                            </div>
                        </MobileCard>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Mobile Dashboard Action Card
 * Card for quick actions
 */
export function MobileDashboardActionCard({
    icon,
    title,
    description,
    onAction,
    variant = 'primary',
}: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    onAction: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'warning';
}) {
    const variantStyles = {
        primary: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        secondary: 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700',
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    };

    return (
        <div
            className={cn(
                'p-4 rounded-lg border cursor-pointer transition-all active:scale-95',
                variantStyles[variant]
            )}
            onClick={onAction}
        >
            <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MobileDashboardLayout;
