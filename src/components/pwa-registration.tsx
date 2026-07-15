'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          // Force update check on every page load
          updateViaCache: 'none',
        });

        console.log('SW registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New content available — skip auto-reload to prevent loop.');
              }
            });
          }
        });
      } catch (error) {
        // Silently fail - service worker is not critical for app functionality
        console.warn('SW registration skipped:', error);
      }
    };

    // Register after page load to not block rendering
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW, { once: true });
    }

    // Handle offline/online status
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