/**
 * useMobileBreakpoint Hook
 * Detects mobile device and screen size breakpoints
 */

'use client';

import { useEffect, useState } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointConfig {
  xs: number;  // 0px
  sm: number;  // 640px
  md: number;  // 768px
  lg: number;  // 1024px
  xl: number;  // 1280px
  '2xl': number; // 1536px
}

const breakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

interface MobileBreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: Breakpoint;
  width: number;
  height: number;
}

export function useMobileBreakpoint(): MobileBreakpointState {
  const [state, setState] = useState<MobileBreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    currentBreakpoint: 'xs',
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let currentBreakpoint: Breakpoint = 'xs';
      if (width >= breakpoints['2xl']) currentBreakpoint = '2xl';
      else if (width >= breakpoints.xl) currentBreakpoint = 'xl';
      else if (width >= breakpoints.lg) currentBreakpoint = 'lg';
      else if (width >= breakpoints.md) currentBreakpoint = 'md';
      else if (width >= breakpoints.sm) currentBreakpoint = 'sm';

      setState({
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg,
        currentBreakpoint,
        width,
        height,
      });
    };

    // Call once on mount
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return state;
}

/**
 * useIsMobile Hook
 * Simple hook to check if device is mobile
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobileBreakpoint();
  return isMobile;
}

/**
 * useIsTablet Hook
 * Simple hook to check if device is tablet
 */
export function useIsTablet(): boolean {
  const { isTablet } = useMobileBreakpoint();
  return isTablet;
}

/**
 * useIsDesktop Hook
 * Simple hook to check if device is desktop
 */
export function useIsDesktop(): boolean {
  const { isDesktop } = useMobileBreakpoint();
  return isDesktop;
}
