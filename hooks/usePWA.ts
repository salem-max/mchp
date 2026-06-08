/**
 * usePWA Hook
 * Manage PWA functionality like installation, online/offline status, etc.
 */

'use client';

import { useEffect, useState } from 'react';
import { registerServiceWorker, onNetworkChange, isOffline } from '@/lib/pwa-utils';

interface PWAState {
    isOnline: boolean;
    isInstalled: boolean;
    canInstall: boolean;
    isUpdating: boolean;
}

export function usePWA() {
    const [state, setState] = useState<PWAState>({
        isOnline: true,
        isInstalled: false,
        canInstall: false,
        isUpdating: false,
    });

    let deferredPrompt: any = null;

    useEffect(() => {
        // Register service worker
        registerServiceWorker();

        // Set initial online status
        setState((prev) => ({
            ...prev,
            isOnline: !isOffline(),
        }));

        // Listen for online/offline changes
        const unsubscribe = onNetworkChange((isOnline) => {
            setState((prev) => ({ ...prev, isOnline }));
        });

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            deferredPrompt = e;
            setState((prev) => ({ ...prev, canInstall: true }));
        };

        // Listen for app installed
        const handleAppInstalled = () => {
            setState((prev) => ({ ...prev, isInstalled: true, canInstall: false }));
        };

        // Listen for SW updates
        const handleSWUpdated = () => {
            setState((prev) => ({ ...prev, isUpdating: true }));
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        window.addEventListener('sw-updated', handleSWUpdated);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setState((prev) => ({ ...prev, isInstalled: true }));
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            window.removeEventListener('sw-updated', handleSWUpdated);
            unsubscribe?.();
        };
    }, []);

    const installApp = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;

        if (result.outcome === 'accepted') {
            setState((prev) => ({ ...prev, canInstall: false }));
        }

        deferredPrompt = null;
    };

    const updateApp = () => {
        window.location.reload();
    };

    return {
        ...state,
        installApp,
        updateApp,
    };
}

export default usePWA;
