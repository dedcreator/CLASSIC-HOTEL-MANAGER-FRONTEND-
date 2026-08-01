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
  XMarkIcon,
  PresentationChartBarIcon,
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
  { name: 'Financial Reports', href: '/reports', icon: PresentationChartBarIcon, roles: ['CEO', 'MANAGER', 'ADMIN'] },
];

const NavSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <li key={i}>
        <div className="h-10 bg-[#F7F1E4] rounded-lg animate-pulse mx-2" />
      </li>
    ))}
  </>
);

const NavLinks = ({ pathname, onClickLink }: { pathname: string; onClickLink?: () => void }) => {
  const { user, loading } = useAuth();

  const filteredNavigation = navigation.filter(
    item => !item.roles || (user?.role && item.roles.includes(user.role.toUpperCase()))
  );

  if (loading) return <ul role="list" className="-mx-2 space-y-1"><NavSkeleton /></ul>;

  return (
    <ul role="list" className="-mx-2 space-y-1">
      {filteredNavigation.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              onClick={onClickLink}
              className={`
                group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm leading-6 font-medium transition-all duration-200
                ${isActive
                  ? 'bg-[#16302B] text-[#F7F1E4] shadow-sm'
                  : 'text-[#5B564B] hover:text-[#16302B] hover:bg-[#F7F1E4]'
                }
              `}
            >
              <item.icon
                className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? 'text-[#C9A468]' : 'text-[#8A8377] group-hover:text-[#16302B]'
                }`}
                aria-hidden="true"
              />
              {item.name}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C9A468]" />
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

const Logo = () => (
  <div className="flex h-16 shrink-0 items-center border-b border-[#DDD5C4]">
    <div className="flex items-center gap-x-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#16302B]">
        <span className="font-display text-lg font-semibold text-[#C9A468]">H</span>
      </div>
      <div>
        <h1 className="font-display text-lg font-semibold text-[#2A2622] tracking-tight">
          Hotel <span className="text-[#C9A468]">Manager</span>
        </h1>
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#8A8377]">
          Management System
        </p>
      </div>
    </div>
  </div>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.first_name || !user?.last_name) return 'U';
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#FAF6EF]">
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
            <div className="fixed inset-0 bg-[#2A2622]/80 backdrop-blur-sm" />
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
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-4 pb-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#DDD5C4] py-4">
                    <Logo />
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="rounded-lg p-1.5 text-[#8A8377] hover:bg-[#F7F1E4] hover:text-[#16302B] transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-3">
                      <li>
                        <NavLinks
                          pathname={pathname}
                          onClickLink={() => setSidebarOpen(false)}
                        />
                      </li>
                      
                      {/* User section at bottom of mobile sidebar */}
                      <li className="mt-auto pt-4 border-t border-[#DDD5C4]">
                        <div className="flex items-center gap-x-3 px-3 py-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16302B] text-sm font-medium text-[#F7F1E4]">
                            {getInitials()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#2A2622] truncate">
                              {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-[#8A8377] truncate">
                              {user?.role?.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-[#DDD5C4] bg-white px-3 pb-4">
          <Logo />
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-3">
              <li className="flex-1">
                <NavLinks pathname={pathname} />
              </li>
              
              {/* User section at bottom of sidebar */}
              <li className="pt-4 border-t border-[#DDD5C4]">
                <div className="flex items-center gap-x-3 rounded-lg px-3 py-2 bg-[#F7F1E4]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16302B] text-sm font-medium text-[#F7F1E4]">
                    {getInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2A2622] truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-[#8A8377] truncate">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}