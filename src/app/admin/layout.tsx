'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/services/authService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    
    const token = AuthService.getToken();
    if (!token) {
      useAuthStore.getState().logout();
      router.push('/auth/login?message=' + encodeURIComponent('Vui lòng đăng nhập lại'));
      return;
    }
    
    if (!isAuthenticated) {
      router.push('/auth/login?message=' + encodeURIComponent('Vui lòng đăng nhập lại'));
      return;
    }
    
    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    
    setLoading(false);
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden w-full">
      <AdminSidebar />
      <main className="flex-1 ml-[280px] transition-all duration-300 overflow-hidden w-full max-w-[calc(100vw-280px)] flex flex-col">
        {/* Page Header - Fixed */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600 mt-1">
            {pathname === '/admin' 
              ? 'Chào mừng trở lại! Đây là tổng quan về cửa hàng của bạn.' 
              : `Quản lý ${getPageTitle().toLowerCase()}`}
          </p>
        </div>
        
        {/* Page Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
