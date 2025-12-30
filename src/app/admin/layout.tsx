'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { hasHydrated, isAuthenticated, user } = useAuthStore();

  // Wait for hydration and auth check (RouteGuard handles redirects)
  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Get page title from pathname
  const getPageTitle = () => {
    if (!pathname || pathname === '/admin') return 'Dashboard';
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) return 'Dashboard';
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  // Pages that should hide the default layout header
  const hideHeaderPages = [
    '/admin/stores/new',
    '/admin/stores/edit',
    '/admin/products',
    '/admin/warehouses', // warehouse flows have their own page headers
  ]
  const shouldHideHeader = hideHeaderPages.some(page => pathname?.startsWith(page))

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      <AdminSidebar />
      <main className="flex-1 ml-[72px] lg:ml-[260px] transition-all duration-200 overflow-hidden flex flex-col">
        {/* Page Header - Hidden for specific pages */}
        {!shouldHideHeader && (
          <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {pathname === '/admin'
                ? 'Chào mừng trở lại! Đây là tổng quan về cửa hàng của bạn.'
                : `Quản lý ${getPageTitle().toLowerCase()}`}
            </p>
          </div>
        )}
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
