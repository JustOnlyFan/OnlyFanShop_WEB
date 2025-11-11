import axios from 'axios'
import { apiClient } from '@/lib/api'
import { tokenStorage } from '@/utils/tokenStorage'

// Respect empty string from next.config rewrites (same-origin proxy in dev)
const API_URL = typeof process.env.NEXT_PUBLIC_API_URL !== 'undefined'
  ? process.env.NEXT_PUBLIC_API_URL as string
  : 'http://localhost:8080'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  phoneNumber?: string
  address?: string
}

export interface UserDTO {
    roleName: any;
  userID: number
  username: string
  email: string
  phoneNumber?: string
  address?: string
  role: 'CUSTOMER' | 'ADMIN'
  authProvider: 'LOCAL' | 'GOOGLE' | 'FACEBOOK'
  token?: string
  refreshToken?: string
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class AuthService {

  // Login
  static async login(credentials: LoginRequest): Promise<ApiResponse<UserDTO>> {
    try {
      const response = await axios.post(`${API_URL}/login/signin`, credentials)
      
      // Only save to localStorage if login is successful
      if (response.data && response.data.statusCode === 200 && response.data.data) {
        const { token, refreshToken } = response.data.data
        if (token) {
          tokenStorage.setAccessToken(token)
        }
        if (refreshToken) {
          tokenStorage.setRefreshToken(refreshToken, true)
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.data))
        }
      }
      
      return response.data
    } catch (error: any) {
      // Clear any existing auth data on login failure
      tokenStorage.clearAll()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
      }
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  // Register
  static async register(userData: RegisterRequest): Promise<ApiResponse<void>> {
    try {
      console.log('Register API call with data:', userData);
      const response = await axios.post(`${API_URL}/login/register`, userData)
      console.log('Register API response:', response.data);
      return response.data
    } catch (error: any) {
      console.error('Register API error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      const statusCode = error.response?.data?.statusCode || error.response?.status || 500;
      // Create error object that matches ApiResponse structure
      const errorResponse: ApiResponse<void> = {
        statusCode: statusCode,
        message: errorMessage,
        data: undefined as any
      };
      // Throw error with response data for better handling
      const err = new Error(errorMessage);
      (err as any).response = { data: errorResponse };
      throw err;
    }
  }

  // Send OTP
  static async sendOtp(email: string): Promise<ApiResponse<void>> {
    try {
      const params = new URLSearchParams()
      params.append('email', email)
      const response = await axios.post(`${API_URL}/login/send-otp`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP')
    }
  }

  // Verify OTP
  static async verifyOtp(email: string, otp: string): Promise<ApiResponse<void>> {
    try {
      const params = new URLSearchParams()
      params.append('email', email)
      params.append('otp', otp)
      const response = await axios.post(`${API_URL}/login/verify-otp`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'OTP verification failed')
    }
  }

  // Check account availability
  static async checkAccount(username: string, email: string): Promise<{ usernameAvailable: boolean, emailAvailable: boolean }> {
    try {
      const response = await axios.get(`${API_URL}/login/check-account`, {
        params: { username, email }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Account check failed')
    }
  }

  // Reset password
  static async resetPassword(email: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${API_URL}/login/reset-password`, 
        { email, newPassword }, 
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  }

  // Google Login - supports both Android (token) and web (email, username)
  static async googleLogin(emailOrToken: string, username?: string): Promise<ApiResponse<UserDTO>> {
    try {
      // If username is provided, this is the web version
      if (username !== undefined) {
        const payloadJson = JSON.stringify({
          role: 'CUSTOMER',
          email: emailOrToken,
          username: username || ''
        })
        // Convert to base64url format for browser
        const base64 = btoa(unescape(encodeURIComponent(payloadJson)))
        const customToken = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
        
        const response = await axios.post(`${API_URL}/api/auth/google/login`, 
          { email: '' }, // Will be extracted from token
          { 
            headers: { 
              'X-Custom-Token': customToken,
              'Content-Type': 'application/json'
            } 
          }
        )
        
        if (response.data.data) {
          const { token, refreshToken } = response.data.data
          if (token) {
            tokenStorage.setAccessToken(token)
          }
          if (refreshToken) {
            tokenStorage.setRefreshToken(refreshToken, true)
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data.data))
          }
        }
        
        return response.data
      }
      
      // Otherwise, this is the Android version with raw token
      const response = await axios.post(`${API_URL}/api/auth/google/login`, 
        { email: '' }, // Will be extracted from token
        { 
          headers: { 
            'X-Custom-Token': emailOrToken,
            'Content-Type': 'application/json'
          } 
        }
      )
      
      if (response.data.data) {
        const { token, refreshToken } = response.data.data
        if (token) {
          tokenStorage.setAccessToken(token)
        }
        if (refreshToken) {
          tokenStorage.setRefreshToken(refreshToken, true)
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.data.data))
        }
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google login failed')
    }
  }

  // Get current user
  static getCurrentUser(): UserDTO | null {
    try {
      if (typeof window === 'undefined') return null
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  }

  // Get token
  static getToken(): string | null {
    return tokenStorage.getAccessToken()
  }

  static getRefreshToken(): string | null {
    return tokenStorage.getRefreshToken()
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  // Set user data
  static setUser(user: UserDTO): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
    if (user.token) {
      tokenStorage.setAccessToken(user.token)
    }
    if (user.refreshToken) {
      tokenStorage.setRefreshToken(user.refreshToken, true)
    }
  }

  // Set token
  static setToken(token: string): void {
    tokenStorage.setAccessToken(token)
  }

  // Remove token
  static removeToken(): void {
    tokenStorage.setAccessToken(null)
  }

  // Remove user
  static removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }

  // Clear all auth data
  static clearAuth(): void {
    tokenStorage.clearAll()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
    }
  }

  // Logout
  static logout(): void {
    this.clearAuth()
    window.location.href = '/auth/login'
  }

  // Update profile
  static async updateProfile(userData: Partial<UserDTO>): Promise<ApiResponse<UserDTO>> {
    try {
      const response = await apiClient.put<ApiResponse<UserDTO>>(`/api/users/profile`, userData)
      
      if (response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed')
    }
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.put<ApiResponse<void>>(`/api/users/change-password`, 
        { currentPassword, newPassword }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed')
    }
  }
}