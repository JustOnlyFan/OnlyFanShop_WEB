'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { AuthService } from '@/services/authService'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setHasHydrated } = useAuthStore()

  useEffect(() => {
    // Check if user is actually authenticated on app start
    const checkAuthState = () => {
      const token = AuthService.getToken()
      const user = AuthService.getCurrentUser()
      
      if (!token || !user) {
        // Clear any stale auth data
        AuthService.clearAuth()
        setUser(null)
        return
      }

      // Validate token by checking if it exists and user data is valid
      if (token && user && (user.userID || (user as any).id)) {
        setUser(user)
      } else {
        // Invalid auth data, clear everything
        AuthService.clearAuth()
        setUser(null)
      }
    }

    checkAuthState()
    // mark hydration complete after initial auth check
    setHasHydrated(true)
  }, [setUser, setHasHydrated])

  return <>{children}</>
}

