/**
 * Mobile Utilities
 * Helper functions for mobile-specific features and optimizations
 */

/**
 * Detect if device is touch-enabled
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    'ontouchstart' in window ||
    // @ts-ignore
    (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)
  );
}

/**
 * Detect if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
}

/**
 * Get safe area insets (for notch/status bar awareness)
 */
export function getSafeAreaInsets(): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const root = document.documentElement;
  return {
    top: parseInt(getComputedStyle(root).getPropertyValue('env(safe-area-inset-top)')) || 0,
    bottom: parseInt(getComputedStyle(root).getPropertyValue('env(safe-area-inset-bottom)')) || 0,
    left: parseInt(getComputedStyle(root).getPropertyValue('env(safe-area-inset-left)')) || 0,
    right: parseInt(getComputedStyle(root).getPropertyValue('env(safe-area-inset-right)')) || 0,
  };
}

/**
 * Check if device is in portrait orientation
 */
export function isPortraitOrientation(): boolean {
  if (typeof window === 'undefined') return true;

  return window.innerHeight > window.innerWidth;
}

/**
 * Check if device is in landscape orientation
 */
export function isLandscapeOrientation(): boolean {
  if (typeof window === 'undefined') return false;

  return window.innerWidth > window.innerHeight;
}

/**
 * Get viewport dimensions with safe area consideration
 */
export function getViewportDimensions() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, safeWidth: 0, safeHeight: 0 };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const insets = getSafeAreaInsets();

  return {
    width,
    height,
    safeWidth: width - insets.left - insets.right,
    safeHeight: height - insets.top - insets.bottom,
  };
}

/**
 * Delay function for mobile debouncing
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Haptic feedback (vibration)
 */
export function hapticFeedback(pattern: 'light' | 'medium' | 'heavy' = 'medium'): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
  };

  navigator.vibrate(patterns[pattern]);
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Send notification
 */
export function sendNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return;
  }

  new Notification(title, options);
}

/**
 * Deep link handler
 */
export function handleDeepLink(link: string): void {
  if (typeof window === 'undefined') return;

  // Handle both internal and external links
  if (link.startsWith('/')) {
    window.location.href = link;
  } else if (link.startsWith('http')) {
    window.open(link, '_blank');
  }
}

/**
 * Prevent pull-to-refresh on mobile
 */
export function preventPullToRefresh(): void {
  if (typeof window === 'undefined') return;

  document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop === 0) {
      e.preventDefault();
    }
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
