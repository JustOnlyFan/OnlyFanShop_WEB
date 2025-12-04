'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
    <div className={`bg-white overflow-x-hidden w-full ${isAdminOrStaffPath ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className={`w-full overflow-x-hidden ${isAdminOrStaffPath ? 'h-[calc(100vh-4rem)] overflow-hidden' : ''}`}>
        {children}
      </main>
    </div>
  )
}
