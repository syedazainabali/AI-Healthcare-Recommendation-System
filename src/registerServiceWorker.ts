import { Patient } from './types';
import { cachePatientTriageData } from './utils/offlineTriageCache';

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

let activeRegistration: ServiceWorkerRegistration | null = null;

export function registerServiceWorker(config?: ServiceWorkerConfig): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.info('[MedAI SW] Service workers are not supported in this environment.');
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        activeRegistration = registration;
        console.log('[MedAI SW] Service Worker registered successfully with scope:', registration.scope);

        if (config?.onSuccess) {
          config.onSuccess(registration);
        }

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[MedAI SW] New content is available and will be used once tabs close or reload.');
                if (config?.onUpdate) {
                  config.onUpdate(registration);
                }
              } else {
                console.log('[MedAI SW] Content is cached for offline patient lookup & triage.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn('[MedAI SW] Service worker registration note (handled gracefully):', error.message || error);
      });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('[MedAI Network] Connection restored. App is back online.');
      if (config?.onOnline) config.onOnline();
      window.dispatchEvent(new CustomEvent('medai-network-online'));
    });

    window.addEventListener('offline', () => {
      console.warn('[MedAI Network] Internet connection lost. Switched to offline patient triage cache mode.');
      if (config?.onOffline) config.onOffline();
      window.dispatchEvent(new CustomEvent('medai-network-offline'));
    });
  });
}

/**
 * Synchronize patient list into both LocalStorage and Service Worker data cache
 */
export function syncPatientTriageCache(patients: Patient[]): void {
  if (!patients || patients.length === 0) return;
  cachePatientTriageData(patients);
}

/**
 * Unregister service worker (if required during testing)
 */
export function unregisterServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
