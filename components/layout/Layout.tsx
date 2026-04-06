// frontend/components/layout/Layout.tsx
'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/api/hooks/useAuth';
import Header from './Header';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['CEO', 'MANAGER', 'ADMIN', 'RECEPTIONIST', 'BAR_STAFF'] },
  { name: 'Rooms', href: '/rooms', icon: BuildingOfficeIcon, roles: ['CEO', 'MANAGER', 'ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING'] },
  { name: 'Bookings', href: '/bookings', icon: ClipboardDocumentListIcon, roles: ['CEO', 'MANAGER', 'ADMIN', 'RECEPTIONIST'] },
  { name: 'Inventory', href: '/inventory', icon: ShoppingBagIcon, roles: ['CEO', 'MANAGER', 'ADMIN', 'BAR_STAFF'] },
  { name: 'POS', href: '/sales', icon: ChartBarIcon, roles: ['CEO', 'MANAGER', 'ADMIN', 'BAR_STAFF'] },
  { name: 'Staff', href: '/staff', icon: UserGroupIcon, roles: ['CEO', 'MANAGER', 'ADMIN'] },
  { name: 'Expenses', href: '/consumables', icon: CurrencyDollarIcon, roles: ['CEO', 'MANAGER', 'ADMIN'] },
];

const NavSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <li key={i}>
        <div className="h-10 bg-gray-100 rounded-md animate-pulse mx-2" />
      </li>
    ))}
  </>
);

const NavLinks = ({ pathname, onClickLink }: { pathname: string; onClickLink?: () => void }) => {
  const { user, loading } = useAuth();

  const filteredNavigation = navigation.filter(
  item => !item.roles || (user && item.roles.includes(user.role.toUpperCase()))
);

  if (loading) return <ul role="list" className="-mx-2 space-y-1"><NavSkeleton /></ul>;

  return (
    <ul role="list" className="-mx-2 space-y-1">
      {filteredNavigation.map((item) => (
        <li key={item.name}>
          <Link
            href={item.href}
            onClick={onClickLink}
            className={`
              group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
              ${pathname === item.href
                ? 'bg-red-50 text-red-600'
                : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
              }
            `}
          >
            <item.icon
              className={`h-6 w-6 shrink-0 ${
                pathname === item.href ? 'text-red-600' : 'text-gray-400 group-hover:text-red-600'
              }`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const Logo = () => (
  <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
    <h1 className="text-2xl font-bold">
      <span className="text-red-600">TSG Hotel </span>
      <span className="text-dark-500">Manager</span>
    </h1>
  </div>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-dark-500/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <Logo />
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <NavLinks
                          pathname={pathname}
                          onClickLink={() => setSidebarOpen(false)}
                        />
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <Logo />
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <NavLinks pathname={pathname} />
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}