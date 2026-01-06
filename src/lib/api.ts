import axios, { InternalAxiosRequestConfig } from 'axios'
import { ApiResponse } from '@/types'
import { tokenStorage } from '@/utils/tokenStorage'

const baseURL = ''

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

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

// Response interceptor để cập nhật token mới từ backend header
apiClient.interceptors.response.use(
  (response) => {
    // Backend tự động refresh token và trả về trong header X-New-Access-Token
    const newAccessToken = response.headers['x-new-access-token'] || response.headers['X-New-Access-Token']
    if (newAccessToken) {
      tokenStorage.setAccessToken(newAccessToken)
    }
    return response
  },
  async (error) => {
    // Nếu lỗi 401, redirect về login
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
    await useAuthStore.getState().logout()
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

