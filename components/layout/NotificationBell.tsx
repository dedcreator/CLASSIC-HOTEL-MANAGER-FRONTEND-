// frontend/components/layout/NotificationBell.tsx
'use client';

import { Fragment, useState, useEffect } from 'react';
import { Popover, Transition } from '@headlessui/react';
import {
  BellIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/lib/api/hooks/useNotifications';
import {
  subscribeToPushNotifications,
  getPushSubscriptionState,
} from '@/lib/pushNotifications';
import { InAppNotification } from '@/lib/api/types';
import toast from 'react-hot-toast';

function formatTimeAgo(dateString: string): string {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    return `${diffDay}d ago`;
  } catch (e) {
    return dateString;
  }
}

export default function NotificationBell() {
  const router = useRouter();
  const { data: notifications, isLoading } = useNotifications();
  const { data: countData } = useUnreadNotificationsCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const [pushState, setPushState] = useState<{
    supported: boolean;
    permission: NotificationPermission;
    subscribed: boolean;
  }>({
    supported: false,
    permission: 'default',
    subscribed: false,
  });

  const [isSubscribingPush, setIsSubscribingPush] = useState(false);

  useEffect(() => {
    getPushSubscriptionState().then(setPushState);
  }, []);

  const unreadCount = countData?.unread_count || 0;

  const handleEnablePush = async () => {
    setIsSubscribingPush(true);
    try {
      const res = await subscribeToPushNotifications();
      if (res.success) {
        toast.success('PWA Push Notifications enabled!');
        const updated = await getPushSubscriptionState();
        setPushState(updated);
      } else {
        toast.error(res.message || 'Could not enable push notifications.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error subscribing to push.');
    } finally {
      setIsSubscribingPush(false);
    }
  };

  const handleNotificationClick = async (notif: InAppNotification, close: () => void) => {
    if (!notif.is_read_by_me) {
      markAsRead.mutate(notif.id);
    }
    close();
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'room_checkout':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E3F2FD] text-[#0D47A1]">
            <SparklesIcon className="h-4 w-4" />
          </div>
        );
      case 'website_booking':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8F5E9] text-[#2E7D32]">
            <ClipboardDocumentCheckIcon className="h-4 w-4" />
          </div>
        );
      case 'stock_added':
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3E5F5] text-[#6A1B9A]">
            <CubeIcon className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F1E4] text-[#16302B]">
            <BellIcon className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={`relative p-2 rounded-lg text-[#5B564B] hover:text-[#16302B] hover:bg-[#F7F1E4] focus:outline-none focus:ring-2 focus:ring-[#C9A468] transition-colors ${
              open ? 'bg-[#F7F1E4] text-[#16302B]' : ''
            }`}
            aria-label="View notifications"
          >
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#C62828] text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-1 scale-95"
          >
            <Popover.Panel className="absolute right-0 z-50 mt-2 w-80 sm:w-96 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-[#DDD5C4] focus:outline-none overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#DDD5C4] px-4 py-3 bg-[#FAF6EF]">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-[#2A2622]">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-[#16302B] px-2 py-0.5 text-[10px] font-medium text-[#F7F1E4]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAsRead.mutate()}
                    className="text-xs font-medium text-[#C9A468] hover:text-[#B8924F] transition-colors flex items-center gap-1"
                  >
                    <CheckIcon className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Push Permission Prompt if not yet subscribed */}
              {pushState.supported && !pushState.subscribed && (
                <div className="border-b border-[#DDD5C4] bg-[#FEF3C7]/40 px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <DevicePhoneMobileIcon className="h-4 w-4 text-[#92400E] shrink-0" />
                    <p className="text-xs text-[#92400E] font-medium truncate">
                      Enable push alerts for this device
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEnablePush}
                    disabled={isSubscribingPush}
                    className="shrink-0 text-xs px-2.5 py-1 bg-[#16302B] text-[#F7F1E4] rounded-md font-medium hover:bg-[#1D3B34] transition-colors disabled:opacity-50"
                  >
                    {isSubscribingPush ? 'Enabling...' : 'Enable'}
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F7F1E4]">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex gap-3 animate-pulse">
                        <div className="h-8 w-8 rounded-full bg-[#F7F1E4]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 rounded bg-[#F7F1E4]" />
                          <div className="h-2 w-1/2 rounded bg-[#F7F1E4]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !notifications || notifications.length === 0 ? (
                  <div className="py-8 text-center px-4">
                    <BellIcon className="mx-auto h-8 w-8 text-[#DDD5C4]" />
                    <p className="mt-2 text-sm font-medium text-[#2A2622]">No notifications yet</p>
                    <p className="text-xs text-[#8A8377] mt-0.5">
                      You will be notified about check-outs, bookings, and inventory updates.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif, close)}
                      className={`group flex items-start gap-3 p-3.5 hover:bg-[#FAF6EF] transition-colors cursor-pointer relative ${
                        !notif.is_read_by_me ? 'bg-[#F7F1E4]/50' : ''
                      }`}
                    >
                      <div className="shrink-0 pt-0.5">
                        {getNotificationIcon(notif.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${
                              !notif.is_read_by_me
                                ? 'font-semibold text-[#2A2622]'
                                : 'font-medium text-[#5B564B]'
                            }`}
                          >
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[#8A8377] shrink-0">
                            {formatTimeAgo(notif.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[#5B564B] line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.link && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-[#C9A468] group-hover:underline">
                            View details
                            <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      {!notif.is_read_by_me && (
                        <span className="absolute top-4 right-2 h-2 w-2 rounded-full bg-[#C9A468]" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[#DDD5C4] px-4 py-2.5 bg-[#FAF6EF] text-center">
                <p className="text-[11px] text-[#8A8377]">
                  Notifications are synced in real-time with PWA Push
                </p>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
