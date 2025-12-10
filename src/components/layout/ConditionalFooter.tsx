'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Ẩn footer trong các trang auth, admin và staff
  const hideFooter = 
    pathname?.startsWith('/auth/') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/staff');
  
  if (hideFooter) {
    return null;
  }
  
  return <Footer />;
}
