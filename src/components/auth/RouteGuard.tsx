'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { AuthService } from '@/services/authService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: ('ADMIN' | 'CUSTOMER' | 'STAFF')[]
  requireAuth?: boolean
}

// Define route patterns
const ADMIN_ROUTES = ['/admin']
const STAFF_ROUTES = ['/staff']
// Customer routes that require authentication
const CUSTOMER_PROTECTED_ROUTES = [
  '/cart',
  '/checkout',
  '/orders',
  '/profile',
  '/chat',
  '/wishlist',
  '/payment-result'
]
// Public customer routes (can access without login)
const CUSTOMER_PUBLIC_ROUTES = [
  '/',
  '/products',
  '/brands',
  '/contact',
  '/search',
  '/products/'
]
const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/staff-login']

export function RouteGuard({ children, allowedRoles, requireAuth = true }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!hasHydrated) {
      setIsChecking(true)
      return
    }

    const checkAccess = () => {
      setIsChecking(false)

      // Check if route is public
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))
      if (isPublicRoute) {
        // If already authenticated, redirect based on role
        if (isAuthenticated && user) {
          if (user.role === 'ADMIN') {
            router.replace('/admin')
            return
          } else if (user.role === 'STAFF') {
            router.replace('/staff')
            return
          } else if (user.role === 'CUSTOMER') {
            router.replace('/')
            return
          }
        }
        return // Allow access to public routes
      }

      // Check if route requires authentication
      const isCustomerProtectedRoute = CUSTOMER_PROTECTED_ROUTES.some(route => pathname?.startsWith(route))
      const isAdminRoute = ADMIN_ROUTES.some(route => pathname?.startsWith(route))
      const isStaffRoute = STAFF_ROUTES.some(route => pathname?.startsWith(route))
      const isCustomerPublicRoute = CUSTOMER_PUBLIC_ROUTES.some(route => {
        if (route === '/') {
          return pathname === '/'
        }
        return pathname?.startsWith(route)
      })

      // If route requires authentication, check token
      if (isCustomerProtectedRoute || isAdminRoute || isStaffRoute) {
        const token = AuthService.getToken()
        if (!token) {
          // No token - clear auth and redirect to login
          useAuthStore.getState().logout()
          router.replace('/auth/login?message=' + encodeURIComponent('Vui lòng đăng nhập để tiếp tục'))
          return
        }

        // Check if authenticated
        if (!isAuthenticated || !user) {
          router.replace('/auth/login?message=' + encodeURIComponent('Vui lòng đăng nhập để tiếp tục'))
          return
        }

        // Check role-based access for protected routes
        const userRole = user.role

        // Admin trying to access customer or staff routes
        if (userRole === 'ADMIN') {
          if (isCustomerProtectedRoute || isStaffRoute) {
            router.replace('/admin')
            return
          }
        }

        // Customer trying to access admin or staff routes
        if (userRole === 'CUSTOMER') {
          if (isAdminRoute || isStaffRoute) {
            router.replace('/')
            return
          }
        }

        // Staff trying to access admin or customer routes
        if (userRole === 'STAFF') {
          if (isAdminRoute || isCustomerProtectedRoute) {
            router.replace('/staff')
            return
          }
        }
      } else {
        // Public customer route - allow access even without login
        // But if logged in, check role restrictions
        if (isAuthenticated && user) {
          const userRole = user.role
          // Admin/Staff cannot access customer public routes
          if (userRole === 'ADMIN' || userRole === 'STAFF') {
            if (userRole === 'ADMIN') {
              router.replace('/admin')
            } else {
              router.replace('/staff')
            }
            return
          }
        }
        // Allow access to public customer routes
        return
      }

      // Check if specific roles are allowed (for protected routes)
      if (allowedRoles && allowedRoles.length > 0 && user) {
        const userRole = user.role
        if (!allowedRoles.includes(userRole)) {
          // Redirect based on role
          if (userRole === 'ADMIN') {
            router.replace('/admin')
          } else if (userRole === 'STAFF') {
            router.replace('/staff')
          } else {
            router.replace('/')
          }
          return
        }
      }
    }

    checkAccess()
  }, [hasHydrated, isAuthenticated, user, pathname, router, allowedRoles])

  // Show loading while checking
  if (!hasHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If not authenticated and route requires auth, show loading (will redirect)
  if (requireAuth && !isAuthenticated) {
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))
    if (!isPublicRoute) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )
    }
  }

  return <>{children}</>
}

