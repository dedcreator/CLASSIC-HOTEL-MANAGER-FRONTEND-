// frontend/lib/pushNotifications.ts
import api from './api/client';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('[Push] Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[Push] Service Worker registration failed:', error);
    return null;
  }
}

export async function isPushNotificationSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function getPushSubscriptionState(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
}> {
  const supported = await isPushNotificationSupported();
  if (!supported) {
    return { supported: false, permission: 'denied', subscribed: false };
  }

  const permission = Notification.permission;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return {
      supported: true,
      permission,
      subscribed: !!subscription,
    };
  } catch (error) {
    return {
      supported: true,
      permission,
      subscribed: false,
    };
  }
}

export async function subscribeToPushNotifications(): Promise<{
  success: boolean;
  message?: string;
  subscription?: PushSubscription;
}> {
  const supported = await isPushNotificationSupported();
  if (!supported) {
    return { success: false, message: 'Push notifications are not supported by this browser.' };
  }

  try {
    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Notification permission was denied.' };
    }

    // 2. Ensure Service Worker is registered and ready
    await registerServiceWorker();
    const registration = await navigator.serviceWorker.ready;

    // 3. Fetch VAPID public key from backend
    const vapidRes = await api.get('/notifications/vapid-public-key/');
    const vapidPublicKey = vapidRes.data?.publicKey;
    if (!vapidPublicKey) {
      throw new Error('VAPID public key not found on server.');
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // 4. Subscribe to push manager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });
    }

    // 5. Send subscription to backend
    const subJson = subscription.toJSON();
    await api.post('/notifications/subscribe/', {
      endpoint: subJson.endpoint,
      keys: {
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
      },
    });

    console.log('[Push] Successfully subscribed and synced with server.');
    return { success: true, subscription };
  } catch (error: any) {
    console.error('[Push] Failed to subscribe to push notifications:', error);
    return {
      success: false,
      message: error?.response?.data?.error || error.message || 'Failed to subscribe to push notifications.',
    };
  }
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!(await isPushNotificationSupported())) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await api.post('/notifications/unsubscribe/', {
        endpoint: subscription.endpoint,
      });
      await subscription.unsubscribe();
    }
    return true;
  } catch (error) {
    console.error('[Push] Failed to unsubscribe:', error);
    return false;
  }
}
