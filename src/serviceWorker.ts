// Simple service worker registration
export function registerServiceWorker() {
  // Skip registration in StackBlitz and development environments
  if (window.location.hostname.includes('stackblitz') || import.meta.env.DEV) {
    console.log('Service Worker registration skipped in development environment');
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(error => {
        console.error('Error registering service worker:', error);
      });
    });
  }
}