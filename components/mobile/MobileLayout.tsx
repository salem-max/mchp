'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/mobile/useMobileBreakpoint';
import { MobileBottomTabs, MobileSafeAreaContainer } from '@/components/mobile';
import { cn } from '@/lib/utils';

export interface MobileLayoutTab {
    icon: React.ReactNode;
    label: string;
    href: string;
    badge?: number;
}

interface MobileLayoutProps {
    children: React.ReactNode;
    tabs: MobileLayoutTab[];
    header?: React.ReactNode;
    showTabs?: boolean;
    className?: string;
    onTabChange?: (href: string) => void;
}

/**
 * Mobile Layout
 * Main layout wrapper for mobile apps with bottom navigation
 */
export function MobileLayout({
    children,
    tabs,
    header,
    showTabs = true,
    className,
    onTabChange,
}: MobileLayoutProps) {
    const isMobile = useIsMobile();

    // Only show mobile layout on actual mobile devices
    if (!isMobile) {
        return (
            <div className={className}>
                {header}
                <main>{children}</main>
            </div>
        );
    }

    return (
        <MobileSafeAreaContainer className={className}>
            {header && <div className="sticky top-0 z-30">{header}</div>}

            <main className="flex-1 overflow-y-auto pb-20">
                {children}
            </main>

            {showTabs && <MobileBottomTabs tabs={tabs} onTabChange={onTabChange} />}
        </MobileSafeAreaContainer>
    );
}

export default MobileLayout;
