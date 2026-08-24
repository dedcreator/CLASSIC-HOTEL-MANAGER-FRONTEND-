// frontend/components/layout/BottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  QueueListIcon,
  ShoppingBagIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/api/hooks/useAuth';

interface BottomNavProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function BottomNav({ setSidebarOpen }: BottomNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role?.toUpperCase() || '';

  // Define candidate tabs for bottom navigation
  const allCandidateTabs = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['CEO', 'MANAGER', 'ADMIN', 'RECEPTIONIST', 'BAR_STAFF', 'HOUSEKEEPING'] },
    { name: 'Rooms', href: '/rooms', icon: BuildingOfficeIcon, roles: ['CEO', 'MANAGER', 'ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING'] },
    { name: 'Bookings', href: '/bookings', icon: ClipboardDocumentListIcon, roles: ['CEO', 'MANAGER', 'ADMIN', 'RECEPTIONIST'] },
    { name: 'POS', href: '/sales', icon: ChartBarIcon, roles: ['CEO', 'MANAGER', 'ADMIN', 'BAR_STAFF'] },
    { name: 'Orders', href: '/menu/orders', icon: QueueListIcon, roles: ['BAR_STAFF'] },
    { name: 'Inventory', href: '/inventory', icon: ShoppingBagIcon, roles: ['CEO', 'MANAGER', 'ADMIN', 'BAR_STAFF'] },
  ];

  // Filter candidate tabs by user role and pick top 4
  const userTabs = allCandidateTabs.filter(tab => !tab.roles || tab.roles.includes(role)).slice(0, 4);

  // Check if current path matches any of the primary 4 tabs
  const isPrimaryTabActive = userTabs.some(tab => 
    tab.href === '/' ? pathname === '/' : pathname === tab.href || pathname?.startsWith(tab.href + '/')
  );

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DDD5C4] lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {userTabs.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1 transition-all duration-150 relative ${
                isActive ? 'text-[#16302B]' : 'text-[#8A8377] hover:text-[#16302B]'
              }`}
            >
              {isActive && (
                <span className="absolute top-1.5 w-6 h-1 bg-[#C9A468] rounded-full" />
              )}
              <item.icon
                className={`h-5 w-5 mb-1 transition-transform ${
                  isActive ? 'text-[#16302B] scale-110' : 'text-[#8A8377]'
                }`}
                aria-hidden="true"
              />
              <span className={`text-[10px] truncate max-w-full leading-tight ${isActive ? 'font-semibold text-[#16302B]' : 'font-medium'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* More / All Tabs Button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-1 transition-all duration-150 relative ${
            !isPrimaryTabActive ? 'text-[#16302B]' : 'text-[#8A8377] hover:text-[#16302B]'
          }`}
          aria-label="Open all navigation tabs"
        >
          {!isPrimaryTabActive && (
            <span className="absolute top-1.5 w-6 h-1 bg-[#C9A468] rounded-full" />
          )}
          <Bars3Icon
            className={`h-5 w-5 mb-1 transition-transform ${
              !isPrimaryTabActive ? 'text-[#16302B] scale-110' : 'text-[#8A8377]'
            }`}
            aria-hidden="true"
          />
          <span className={`text-[10px] truncate max-w-full leading-tight ${!isPrimaryTabActive ? 'font-semibold text-[#16302B]' : 'font-medium'}`}>
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
