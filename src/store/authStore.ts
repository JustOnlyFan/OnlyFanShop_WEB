import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { AuthService } from '@/services/authService'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  hasHydrated?: boolean
}

interface AuthActions {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setHasHydrated: (hydrated: boolean) => void
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    username: string
    email: string
    password: string
    confirmPassword: string
    phoneNumber?: string
    address?: string
  }) => Promise<void>
  googleLogin: (email: string, username: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      // Actions
      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
        if (user) {
          AuthService.setUser(user)
        } else {
          AuthService.clearAuth()
        }
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      clearError: () => set({ error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await AuthService.login({ email, password })
          if (response.statusCode === 200 && response.data) {
            AuthService.setToken(response.data.token || '')
            AuthService.setUser(response.data)
            set({ 
              user: response.data, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            })
          } else {
            // Clear auth data on failure
            AuthService.clearAuth()
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: response.message || 'Đăng nhập thất bại'
            })
            throw new Error(response.message || 'Đăng nhập thất bại')
          }
        } catch (error: any) {
          // Clear auth data on error
          AuthService.clearAuth()
          set({ 
            user: null,
            isAuthenticated: false,
            error: error.message || 'Đăng nhập thất bại', 
            isLoading: false 
          })
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await AuthService.register(userData)
          if (response.statusCode === 200) {
            // Registration successful - user should login separately
            set({ isLoading: false })
          } else {
            throw new Error(response.message || 'Đăng ký thất bại')
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Đăng ký thất bại', 
            isLoading: false 
          })
          throw error
        }
      },

      googleLogin: async (email, username) => {
        set({ isLoading: true, error: null })
        try {
          const response = await AuthService.googleLogin(email, username)
          if (response.statusCode === 200 && response.data) {
            AuthService.setToken(response.data.token || '')
            AuthService.setUser(response.data)
            set({ 
              user: response.data, 
              isAuthenticated: true, 
              isLoading: false 
            })
          } else {
            throw new Error(response.message || 'Đăng nhập Google thất bại')
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Đăng nhập Google thất bại', 
            isLoading: false 
          })
          throw error
        }
      },

      logout: () => {
        AuthService.clearAuth()
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        })
      },

      updateUser: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await AuthService.updateUser(userData)
          if (response.statusCode === 200 && response.data) {
            AuthService.setUser(response.data)
            set({ 
              user: response.data, 
              isLoading: false 
            })
          } else {
            throw new Error(response.message || 'Cập nhật thông tin thất bại')
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Cập nhật thông tin thất bại', 
            isLoading: false 
          })
          throw error
        }
      },
    }),
    {
      name: 'auth-storage',
      version: 2,
      migrate: (persistedState: any, version) => {
        // Drop stale isAuthenticated flag; recompute from token + user
        if (version < 2) {
          const token = AuthService.getToken()
          const user = persistedState.user || null
          return {
            user,
            isAuthenticated: !!(token && user)
          }
        }
        return persistedState
      },
      // Only persist user; derive isAuthenticated at runtime
      partialize: (state) => ({
        user: state.user
      }),
      onRehydrateStorage: () => (state) => {
        const token = AuthService.getToken()
        const user = state?.user || null
        if (!token || !user) {
          AuthService.clearAuth()
          state?.setUser(null)
          state?.setHasHydrated?.(true)
          return
        }
        state?.setUser(user)
        state?.setHasHydrated?.(true)
      }
    }
  )
)





