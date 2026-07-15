'use client';

import { useEffect } from 'react';

// Version key — increment to force cache clear on all clients
const SW_VERSION = 'v2';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // On version change, clear all caches and unregister old SW immediately
    const lastVersion = localStorage.getItem('qrtag_sw_version');
    if (lastVersion !== SW_VERSION) {
      console.log('[SW] Version mismatch, clearing caches...', lastVersion, '→', SW_VERSION);
      localStorage.setItem('qrtag_sw_version', SW_VERSION);

      // Clear all caches
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
          console.log('[SW] All caches cleared');
        });
      }

      // Unregister old SW before registering new one
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => {
          reg.unregister().then(() => console.log('[SW] Old SW unregistered'));
        });
      });
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none',
        });

        console.log('[SW] Registered:', registration.scope);

        // When a new SW is found, tell it to activate immediately
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            // Tell the new SW to skip waiting
            newWorker.postMessage({ type: 'SKIP_WAITING' });

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('[SW] New version activated, clearing caches...');
                caches.keys().then((names) => {
                  names.forEach((name) => caches.delete(name));
                });
              }
            });
          }
        });
      } catch (error) {
        // Service worker is not critical — fail silently
        console.warn('[SW] Registration skipped:', error);
      }
    };

    // Register after page load
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW, { once: true });
    }

    const handleOnline = () => console.log('Back online');
    const handleOffline = () => console.log('Gone offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
}

// Hook to check PWA install status
export function usePWAInstall() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = ('standalone' in window.navigator) && (window.navigator as Navigator & { standalone: boolean }).standalone;

    if (isStandalone || isInWebAppiOS) {
      console.log('App is running as PWA');
      document.body.classList.add('pwa-mode');
    }
  }, []);
}

// Component to prompt PWA installation
export function PWAInstallPrompt() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('PWA install prompt available');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  return null;
}

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}