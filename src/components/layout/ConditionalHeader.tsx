'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Ẩn header trong các trang auth và admin/staff
  if (!pathname) return null;
  
  const hideHeader = pathname.startsWith('/auth') || 
                     pathname.startsWith('/admin') || 
                     pathname.startsWith('/staff');
  
  if (hideHeader) {
    return null;
  }
  
  return <Header />;
}
