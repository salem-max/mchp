/**
 * PWA Utilities
 * Service worker registration and offline mode detection
 */

export async function registerServiceWorker() {
    if (typeof window === 'undefined') return;

    if (!('serviceWorker' in navigator)) {
        console.warn('Service Workers are not supported in this browser');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
        });

        console.log('Service Worker registered successfully:', registration);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available, notify user
                    console.log('New version available');
                    // Dispatch custom event for app notification
                    window.dispatchEvent(new CustomEvent('sw-updated'));
                }
            });
        });

        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
    }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker() {
    if (typeof window === 'undefined') return;

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.unregister();
        console.log('Service Worker unregistered');
    } catch (error) {
        console.error('Service Worker unregistration failed:', error);
    }
}

/**
 * Request periodic background sync
 */
export async function requestPeriodicSync(tag: string, minInterval: number = 24 * 60 * 60 * 1000) {
    if (typeof window === 'undefined') return;

    if (!('periodicSync' in navigator.serviceWorker)) {
        console.warn('Periodic Background Sync is not supported');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore
        await registration.periodicSync.register(tag, {
            minInterval,
        });
        console.log('Periodic sync registered:', tag);
    } catch (error) {
        console.error('Periodic sync registration failed:', error);
    }
}

/**
 * Check if app is in offline mode
 */
export function isOffline(): boolean {
    if (typeof window === 'undefined') return false;
    return !navigator.onLine;
}

/**
 * Listen for online/offline changes
 */
export function onNetworkChange(callback: (isOnline: boolean) => void) {
    if (typeof window === 'undefined') return;

    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}

/**
 * Queue an action for when device is online
 */
export async function queueOfflineAction(
    action: () => Promise<any>,
    key: string
) {
    if (typeof window === 'undefined') return;

    if (navigator.onLine) {
        return action();
    }

    // Store action for later
    const queue = JSON.parse(localStorage.getItem('offline-queue') || '[]');
    queue.push({ key, timestamp: Date.now() });
    localStorage.setItem('offline-queue', JSON.stringify(queue));

    // Retry when online
    const unsubscribe = onNetworkChange(async (isOnline) => {
        if (isOnline) {
            try {
                await action();
                // Remove from queue if successful
                const updatedQueue = queue.filter((item: any) => item.key !== key);
                localStorage.setItem('offline-queue', JSON.stringify(updatedQueue));
            } finally {
                unsubscribe?.();
            }
        }
    });
}

export default {
    registerServiceWorker,
    unregisterServiceWorker,
    requestPeriodicSync,
    isOffline,
    onNetworkChange,
    queueOfflineAction,
};
