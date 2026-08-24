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

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[#DDD5C4] bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:px-6 lg:px-8">
        {/* Left section: Mobile Hamburger Toggle + Brand */}
        <div className="flex items-center gap-x-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden -ml-1.5 p-2 rounded-lg text-[#5B564B] hover:text-[#16302B] hover:bg-[#F7F1E4] focus:outline-none focus:ring-2 focus:ring-[#C9A468] transition-colors"
            aria-label="Open navigation sidebar"
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Mobile brand logo */}
          <Link href="/" className="flex items-center gap-x-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16302B] shadow-sm">
              <span className="font-display text-base font-semibold text-[#C9A468]">H</span>
            </div>
            <div>
              <span className="font-display text-base font-semibold text-[#2A2622] tracking-tight">
                Hotel <span className="text-[#C9A468]">Manager</span>
              </span>
            </div>
          </Link>
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