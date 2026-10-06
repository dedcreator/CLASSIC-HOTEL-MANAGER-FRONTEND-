// Classic Hotel Management System Service Worker for PWA Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'Classic Hotel Alert',
        body: event.data.text(),
      };
    }
  }

  const title = data.title || 'Classic Hotel Alert';
  const options = {
    body: data.body || 'You have a new update from Classic Hotel.',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    data: {
      url: data.url || '/',
      extra: data.data || {},
    },
    vibrate: [200, 100, 200],
    tag: data.tag || 'classic-hotel-alert',
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) {
            return client.navigate(targetUrl);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  // Re-subscribe if browser refreshes subscription
  event.waitUntil(
    self.registration.pushManager.getSubscription().then((subscription) => {
      // The application will sync the new subscription on next launch
      console.log('[SW] Push subscription changed:', subscription);
    })
  );
});
