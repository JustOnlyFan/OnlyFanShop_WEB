'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { AuthService } from '@/services/authService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface RouteGuardProps {
  children: React.ReactNode
}

// Helper to get subdomain
function getSubdomain() {
  if (typeof window === 'undefined') return null
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  if (parts.length >= 2 && parts[0] !== 'localhost' && parts[0] !== 'onlyfan') {
    return parts[0]
  }
  return null
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    const checkAccess = async () => {
      const subdomain = getSubdomain()

      // Public routes - always allow
      const publicRoutes = ['/auth/login', '/auth/register', '/auth/staff-login', '/', '/products', '/brands', '/contact', '/search']
      const isPublicRoute = publicRoutes.some(route => {
        if (route === '/') return pathname === '/'
        return pathname?.startsWith(route)
      })

      if (isPublicRoute) {
        setIsChecking(false)
        return
      }

      // Protected routes
      const isAdminRoute = pathname?.startsWith('/admin')
      const isStaffRoute = pathname?.startsWith('/staff')
      const isProtectedCustomerRoute = ['/cart', '/checkout', '/orders', '/profile', '/chat', '/wishlist', '/payment-result'].some(route => pathname?.startsWith(route))

      // Check if route needs authentication
      if (isAdminRoute || isStaffRoute || isProtectedCustomerRoute) {
        const token = AuthService.getToken()
        
        if (!token || !isAuthenticated || !user) {
          setIsChecking(false)
          // Redirect to appropriate login based on subdomain
          if (subdomain === 'admin' || isAdminRoute) {
            router.replace('/auth/login?message=' + encodeURIComponent('Vui lòng đăng nhập'))
          } else if (subdomain === 'staff' || isStaffRoute) {
            router.replace('/auth/staff-login?message=' + encodeURIComponent('Vui lòng đăng nhập'))
          } else {
            router.replace('/auth/login?message=' + encodeURIComponent('Vui lòng đăng nhập'))
          }
          return
        }

        // Check role access
        const userRole = user.role

        if (isAdminRoute && userRole !== 'ADMIN') {
          setIsChecking(false)
          router.replace('/')
          return
        }

        if (isStaffRoute && userRole !== 'STAFF') {
          setIsChecking(false)
          router.replace('/')
          return
        }

        if (isProtectedCustomerRoute && userRole !== 'CUSTOMER') {
          setIsChecking(false)
          if (userRole === 'ADMIN') {
            router.replace('/admin')
          } else if (userRole === 'STAFF') {
            router.replace('/staff')
          }
          return
        }
      }

      setIsChecking(false)
    }

    checkAccess()
  }, [hasHydrated, isAuthenticated, user, pathname, router])

  if (!hasHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
