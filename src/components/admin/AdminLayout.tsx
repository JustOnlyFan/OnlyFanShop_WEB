'use client';

import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 ml-[280px] transition-all duration-300 bg-gray-50">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
