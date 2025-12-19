import axios, { InternalAxiosRequestConfig } from 'axios'
import { ApiResponse } from '@/types'
import { tokenStorage } from '@/utils/tokenStorage'

// Create a shared axios instance with interceptors
export const apiClient = axios.create({
  baseURL: typeof process.env.NEXT_PUBLIC_API_URL !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    : 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor để thêm token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor để xử lý lỗi 401
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (error?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = tokenStorage.getRefreshToken()
      if (!refreshToken) {
        processQueue(error, null)
        isRefreshing = false
        await handleUnauthorizedRedirect(error)
        return Promise.reject(error)
      }

      try {
         const refreshResponse = await axios.post(
           `${apiClient.defaults.baseURL || ''}/login/refresh`,
           { refreshToken }
         )
 
         const refreshData: ApiResponse<any> = refreshResponse.data
         const refreshedUser = refreshData.data
         const newAccessToken = refreshedUser?.token || null
         const newRefreshToken = refreshedUser?.refreshToken || refreshToken

         if (!newAccessToken) {
           throw new Error('Invalid refresh response: missing access token')
         }

         tokenStorage.setAccessToken(newAccessToken)
         if (newRefreshToken) {
           tokenStorage.setRefreshToken(newRefreshToken, true)
         }

         if (typeof window !== 'undefined' && refreshedUser) {
           localStorage.setItem('user', JSON.stringify(refreshedUser))
         }

         if (refreshedUser) {
           try {
             const { useAuthStore } = await import('@/store/authStore')
             useAuthStore.getState().setUser(refreshedUser)
           } catch (storeError) {
             console.error('Failed to update auth store after refresh', storeError)
           }
         }

         processQueue(null, newAccessToken)
         if (originalRequest.headers) {
           originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
         }

         return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        await handleUnauthorizedRedirect(refreshError)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // If 401 after retry or no refresh token, handle immediately
    if (error.response?.status === 401) {
      await handleUnauthorizedRedirect(error)
    }
 
    return Promise.reject(error)
  }
)

const handleUnauthorizedRedirect = async (error: any) => {
  // Clear all auth data
  tokenStorage.clearAll()

  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }

  try {
    const { useAuthStore } = await import('@/store/authStore')
    useAuthStore.getState().logout()
  } catch (storeError) {
    console.error('Error clearing auth store:', storeError)
  }

  // Redirect to login page if not already there
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname
    if (!currentPath.includes('/auth/login') && !currentPath.includes('/login') && !currentPath.includes('/auth/staff-login')) {
      const message = error?.response?.data?.message || error?.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      // Use window.location.href for full page reload to clear any cached state
      window.location.href = '/auth/login?message=' + encodeURIComponent(message)
    }
  }
}






