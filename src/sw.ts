/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Ativar o worker imediatamente
clientsClaim();

// Nome das caches
const CACHE_NAMES = {
  static: 'static-cache-v1',
  dynamic: 'dynamic-cache-v1',
  offline: 'offline-cache-v1',
  api: 'api-cache-v1',
};

// Pré-cache de arquivos estáticos
precacheAndRoute(self.__WB_MANIFEST);

// Cache de assets estáticos
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
        maxEntries: 60,
      }),
    ],
  })
);

// Cache de imagens
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
        maxEntries: 100,
      }),
    ],
  })
);

// Cache de APIs
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 24 * 60 * 60, // 24 horas
        maxEntries: 100,
      }),
    ],
  })
);

// Lidar com navegação SPA
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  allowlist: [new RegExp('^/(?!api)')],
});
registerRoute(navigationRoute);

// Cache de dados offline
const dbCacheName = CACHE_NAMES.offline;
const dbVersion = 1;

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  const cache = await caches.open(dbCacheName);
  const pendingRequests = await cache.keys();

  for (const request of pendingRequests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
    }
  }
}

// Notificações push
self.addEventListener('push', (event) => {
  const data = event.data?.json();

  if (data) {
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data.data,
      actions: data.actions,
      vibrate: [100, 50, 100],
      tag: data.tag || 'default',
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Ação de notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Lidar com ações específicas
    switch (event.action) {
      case 'view':
        event.waitUntil(clients.openWindow(event.notification.data?.url));
        break;
      case 'dismiss':
        // Apenas fecha a notificação
        break;
    }
  } else {
    // Ação padrão ao clicar na notificação
    event.waitUntil(clients.openWindow('/'));
  }
});

// Limpeza periódica de caches antigas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Verifica se o cache não está na lista de caches atuais
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fallback offline
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});
