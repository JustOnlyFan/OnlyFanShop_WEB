'use client'

import { useEffect, useRef } from 'react'

import { useAuthStore } from '@/store/authStore'
import { AuthService } from '@/services/authService'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current) return
    hasInitialized.current = true

    // Check if user is actually authenticated on app start
    const checkAuthState = async () => {
      const token = AuthService.getToken()
      const user = AuthService.getCurrentUser()
      
      // If we have user but no token, try to refresh from cookie
      if (!token && user) {
        try {
          const refreshResponse = await AuthService.refreshToken()
          if (refreshResponse && refreshResponse.statusCode === 200 && refreshResponse.data) {
            // Successfully refreshed token
            useAuthStore.getState().setUser(refreshResponse.data)
            useAuthStore.getState().setHasHydrated(true)
            return
          }
        } catch (error) {
          console.warn('Failed to refresh token:', error)
        }
        // Refresh failed, clear auth data
        AuthService.clearAuth()
        useAuthStore.getState().setUser(null)
        useAuthStore.getState().setHasHydrated(true)
        return
      }
      
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

