'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DesktopBackground } from './DesktopBackground'
import { MacBookScreen } from '@/components/ui/MacBookScreen'
import { DesktopWeather } from '@/components/ui/DesktopWeather'
import { LandingPage } from '@/components/sections/LandingPage'
import { ProductsPage } from '@/components/sections/ProductsPage'
import { BrandsPage } from '@/components/sections/BrandsPage'
import { ContactPage } from '@/components/sections/ContactPage'
import { CartPage } from '@/components/sections/CartPage'
import { Header } from './Header'

interface DesktopLayoutProps {
  children: ReactNode
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const pathname = usePathname()
  const isAdminPath = pathname?.startsWith('/admin')

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
      
        
        {/* MacBook Screen with Dynamic Content */}
      <div className="absolute top-0 left-0 right-0 bottom-0">
        <MacBookScreen>
          <div className="w-full h-full overflow-y-auto">
            {pathname === '/' && <LandingPage />}
            {pathname === '/products' && <ProductsPage />}
            {pathname === '/brands' && <BrandsPage />}
            {pathname === '/contact' && <ContactPage />}
            {pathname === '/cart' && <CartPage />}
            {!['/', '/products', '/brands', '/contact', '/cart'].includes(pathname) && children}
          </div>
        </MacBookScreen>
      </div>

      
      {/* Desktop Weather (visible on all routes including admin) */}
      <DesktopWeather />
    </div>
  )
}
