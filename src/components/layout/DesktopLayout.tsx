'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DesktopBackground } from './DesktopBackground'
import { MacBookScreen } from '@/components/ui/MacBookScreen'
import { LandingPage } from '@/components/sections/LandingPage'
import { ProductsPage } from '@/components/sections/ProductsPage'
import { BrandsPage } from '@/components/sections/BrandsPage'
import { ContactPage } from '@/components/sections/ContactPage'
import { CartPage } from '@/components/sections/CartPage'
import { Header } from './Header'
import { useAuthStore } from '@/store/authStore'

interface DesktopLayoutProps {
  children: ReactNode
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdminPath = pathname?.startsWith('/admin')
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  // Auto-redirect admin users from homepage to admin dashboard
  useEffect(() => {
    if (!hasHydrated) return
    if (isAuthenticated && user?.role === 'ADMIN' && pathname === '/') {
      router.push('/admin')
    }
  }, [hasHydrated, isAuthenticated, user, pathname, router])

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 overflow-hidden"
    >
      {/* Desktop Particles Background */}
      
      {/* Header (always visible; Header self-adjusts on admin) */}
      <Header />
      
      {/* Desktop Background with Banner */}
      <DesktopBackground />
      
      {/* Taskbar removed to avoid conflict with Header */}
      
      {/* MacBook Screen with Dynamic Content - Always render for all routes */}
      <div className="absolute top-0 left-0 right-0 bottom-0">
        <MacBookScreen>
          <div className={`w-full h-full ${['/profile', '/auth/login'].includes(pathname || '') ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            {pathname === '/' && <LandingPage />}
            {pathname === '/products' && <ProductsPage />}
            {pathname === '/brands' && <BrandsPage />}
            {pathname === '/contact' && <ContactPage />}
            {pathname === '/cart' && <CartPage />}
            {!['/', '/products', '/brands', '/contact', '/cart'].includes(pathname) && children}
          </div>
        </MacBookScreen>
      </div>
    </div>
  )
}
