'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { DesktopBackground } from './DesktopBackground'
import { MacBookScreen } from '@/components/ui/MacBookScreen'
import { Header } from './Header'
import { useAuthStore } from '@/store/authStore'
import { AuthService } from '@/services/authService'

interface DesktopLayoutProps {
  children: ReactNode
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isAdminPath = pathname?.startsWith('/admin')
  const isStaffPath = pathname?.startsWith('/staff')
  const isAdminOrStaffPath = isAdminPath || isStaffPath
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore()

  // Auto-redirect admin/staff users from homepage to their dashboard
  useEffect(() => {
    if (!hasHydrated) return
    if (isAuthenticated && user?.role === 'ADMIN' && pathname === '/') {
      router.push('/admin')
    } else if (isAuthenticated && user?.role === 'STAFF' && pathname === '/') {
      router.push('/staff')
    }
  }, [hasHydrated, isAuthenticated, user, pathname, router])

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

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
          <div className={`relative w-full h-full ${['/profile', '/auth/login', '/auth/register'].includes(pathname || '') ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            {children}
          </div>
        </MacBookScreen>
      </div>
    </div>
  )
}
