/**
 * useMobileSafe Hook
 * Provides mobile-safe utilities like detecting touch capability, orientation, etc.
 */

'use client';

import { useEffect, useState } from 'react';

interface MobileSafeState {
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  isOnline: boolean;
  hasNotificationPermission: boolean;
}

export function useMobileSafe(): MobileSafeState {
  const [state, setState] = useState<MobileSafeState>({
    isTouchDevice: false,
    orientation: 'portrait',
    isOnline: true,
    hasNotificationPermission: false,
  });

  useEffect(() => {
    // Check if touch device
    const isTouchDevice = () => {
      return (
        (typeof window !== 'undefined' &&
          ('ontouchstart' in window ||
            // @ts-ignore
            (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)))
      );
    };

    // Check notification permission
    const checkNotificationPermission = async () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = Notification.permission === 'granted';
        setState((prev) => ({ ...prev, hasNotificationPermission: permission }));
      }
    };

    // Handle orientation change
    const handleOrientationChange = () => {
      const orientation = window.innerHeight > window.innerWidth
        ? 'portrait'
        : 'landscape';
      setState((prev) => ({ ...prev, orientation }));
    };

    // Handle online/offline
    const handleOnlineStatus = () => {
      setState((prev) => ({ ...prev, isOnline: navigator.onLine }));
    };

    // Set initial state
    const orientation = window.innerHeight > window.innerWidth
      ? 'portrait'
      : 'landscape';
    setState((prev) => ({
      ...prev,
      isTouchDevice: isTouchDevice(),
      orientation,
      isOnline: navigator.onLine,
    }));

    checkNotificationPermission();

    // Add listeners
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  return state;
}

/**
 * useOrientation Hook
 * Get device orientation
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const { orientation } = useMobileSafe();
  return orientation;
}

/**
 * useNetworkStatus Hook
 * Get network online/offline status
 */
export function useNetworkStatus(): boolean {
  const { isOnline } = useMobileSafe();
  return isOnline;
}
