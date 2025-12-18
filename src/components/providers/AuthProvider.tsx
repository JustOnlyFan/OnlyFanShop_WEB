'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { AuthService } from '@/services/authService'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only run once
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Check if user is actually authenticated on app start
    const checkAuthState = () => {
      const token = AuthService.getToken()
      const user = AuthService.getCurrentUser()
      
      if (!token || !user) {
        // Clear any stale auth data
        AuthService.clearAuth()
        useAuthStore.getState().setUser(null)
      } else if (token && user && (user.userID || (user as any).id)) {
        // Valid auth data
        useAuthStore.getState().setUser(user)
      } else {
        // Invalid auth data, clear everything
        AuthService.clearAuth()
        useAuthStore.getState().setUser(null)
      }
      
      // Mark hydration complete
      useAuthStore.getState().setHasHydrated(true)
    }

    checkAuthState()
  }, [])

  return <>{children}</>
}

