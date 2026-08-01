// frontend/components/layout/Header.tsx
'use client';

import { Fragment, useState } from 'react';
import { Menu, Transition, Dialog } from '@headlessui/react';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/api/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Sample notifications - replace with real data
  const notifications = [
    { id: 1, title: 'New booking', message: 'Room 204 booked for 3 nights', time: '5 min ago', read: false },
    { id: 2, title: 'Low stock alert', message: 'Coffee beans running low', time: '1 hour ago', read: false },
    { id: 3, title: 'Check-in reminder', message: 'Guest arriving at 3 PM', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[#DDD5C4] bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center gap-x-4">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-[#8A8377] hover:text-[#16302B] lg:hidden transition-colors rounded-lg hover:bg-[#F7F1E4]"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Search - optional */}
          <div className="hidden md:flex items-center gap-x-2 text-sm text-[#8A8377]">
            <span className="hidden lg:inline">Welcome back,</span>
            <span className="font-medium text-[#2A2622] hidden lg:inline">
              {user?.first_name}
            </span>
          </div>

          {/* Notifications */}
          <Menu as="div" className="relative">
            {({ open }) => (
              <>
                <Menu.Button
                  className={`relative p-2 rounded-lg transition-all ${
                    open ? 'bg-[#F7F1E4] text-[#16302B]' : 'text-[#8A8377] hover:text-[#16302B] hover:bg-[#F7F1E4]'
                  }`}
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-5 w-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9A468] text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-lg bg-white py-1 shadow-xl ring-1 ring-[#DDD5C4] focus:outline-none max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-[#F7F1E4]">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-sm font-medium text-[#2A2622]">Notifications</h3>
                        <button className="text-xs text-[#C9A468] hover:text-[#B8905B] font-medium">
                          Mark all read
                        </button>
                      </div>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-[#8A8377]">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <Menu.Item key={notification.id}>
                          {({ active }) => (
                            <div
                              className={`px-4 py-3 cursor-pointer transition-colors ${
                                active ? 'bg-[#F7F1E4]' : ''
                              } ${!notification.read ? 'border-l-2 border-[#C9A468]' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-[#2A2622]">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-[#8A8377] mt-0.5">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-[#DDD5C4] mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <span className="mt-1 h-2 w-2 rounded-full bg-[#C9A468] flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          )}
                        </Menu.Item>
                      ))
                    )}

                    <div className="border-t border-[#F7F1E4] p-2">
                      <Link
                        href="/notifications"
                        className="block text-center text-sm text-[#16302B] hover:text-[#1D3B34] font-medium py-1.5 rounded-md hover:bg-[#F7F1E4] transition-colors"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            {({ open }) => (
              <>
                <Menu.Button
                  className={`flex items-center gap-x-2 rounded-lg px-2 py-1.5 transition-colors ${
                    open ? 'bg-[#F7F1E4]' : 'hover:bg-[#F7F1E4]'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16302B] text-[#F7F1E4]">
                    <span className="text-sm font-medium font-display">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-[#2A2622] leading-tight">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-[#8A8377] leading-tight">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDownIcon
                    className={`h-4 w-4 text-[#8A8377] transition-transform duration-200 ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-lg bg-white py-1 shadow-xl ring-1 ring-[#DDD5C4] focus:outline-none">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-[#F7F1E4]">
                      <p className="text-sm font-medium text-[#2A2622]">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-[#8A8377]">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-[#F7F1E4] text-[#16302B] rounded-full">
                        {user?.role?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/profile"
                            className={`flex items-center gap-x-3 px-4 py-2 text-sm transition-colors ${
                              active ? 'bg-[#F7F1E4] text-[#16302B]' : 'text-[#2A2622]'
                            }`}
                          >
                            <UserCircleIcon className="h-4 w-4 text-[#8A8377]" />
                            Profile
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/settings"
                            className={`flex items-center gap-x-3 px-4 py-2 text-sm transition-colors ${
                              active ? 'bg-[#F7F1E4] text-[#16302B]' : 'text-[#2A2622]'
                            }`}
                          >
                            <Cog6ToothIcon className="h-4 w-4 text-[#8A8377]" />
                            Settings
                          </Link>
                        )}
                      </Menu.Item>
                    </div>

                    {/* Sign out */}
                    <div className="border-t border-[#F7F1E4] py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`flex w-full items-center gap-x-3 px-4 py-2 text-sm transition-colors ${
                              active ? 'bg-[#FEF2F2] text-[#991B1B]' : 'text-[#2A2622]'
                            }`}
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </>
            )}
          </Menu>
        </div>
      </header>
    </>
  );
}