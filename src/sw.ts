/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Ativar o worker imediatamente
clientsClaim();

// Pré-cache de arquivos estáticos
precacheAndRoute(self.__WB_MANIFEST);

// Lidar com navegação SPA
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  allowlist: [new RegExp('^/(?!api)')],
});
registerRoute(navigationRoute);

// Cache de dados offline
const dbCacheName = 'offline-db-cache';
const dbVersion = 1;

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
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      data: data.data,
      actions: data.actions
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Ação de notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Lidar com ações específicas
    switch (event.action) {
      case 'view':
        event.waitUntil(
          clients.openWindow(event.notification.data?.url)
        );
        break;
    }
  } else {
    // Ação padrão ao clicar na notificação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});