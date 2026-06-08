'use client';

import React from 'react';
import { useMobileBreakpoint } from '@/hooks/mobile/useMobileBreakpoint';

interface ResponsiveLayoutProps {
    mobileLayout: React.ReactNode;
    desktopLayout: React.ReactNode;
}

/**
 * Responsive Layout
 * Automatically switches between mobile and desktop layouts based on screen size
 */
export function ResponsiveLayout({
    mobileLayout,
    desktopLayout,
}: ResponsiveLayoutProps) {
    const { isMobile } = useMobileBreakpoint();

    return <>{isMobile ? mobileLayout : desktopLayout}</>;
}

export default ResponsiveLayout;
