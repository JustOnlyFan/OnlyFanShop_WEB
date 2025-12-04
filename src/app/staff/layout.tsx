'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/services/authService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    
    const token = AuthService.getToken();
    if (!token) {
      useAuthStore.getState().logout();
      router.push('/auth/staff-login?message=' + encodeURIComponent('Vui lòng đăng nhập lại'));
      return;
    }
    
    if (!isAuthenticated) {
      router.push('/auth/staff-login?message=' + encodeURIComponent('Vui lòng đăng nhập lại'));
      return;
    }
    
    if (user?.role !== 'STAFF') {
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
    if (pathname === '/staff') return 'Dashboard';
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600 mt-1">
            {pathname === '/staff' 
              ? 'Chào mừng trở lại! Đây là trang quản lý của nhân viên.' 
              : `Quản lý ${getPageTitle().toLowerCase()}`}
          </p>
        </div>
        
        {/* Page Content */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
