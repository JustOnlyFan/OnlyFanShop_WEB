import axios from 'axios'

import { apiClient } from '@/lib/api'
import { User } from '@/types'
import { tokenStorage } from '@/utils/tokenStorage'

const API_URL = ''

export interface LoginRequest {
  email: string
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
  roleName: any
  userID: number
  username: string
  fullName: string
  email: string
  phoneNumber?: string
  phone?: string
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF'
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
  private static sanitizeUserForStorage(user: User | UserDTO): UserDTO {
    const { token: _token, refreshToken: _refreshToken, ...rest } = user as any
    return rest as UserDTO
  }

  // Login
  static async login(credentials: LoginRequest): Promise<ApiResponse<UserDTO>> {
    try {
      const response = await axios.post(`${API_URL}/login/signin`, credentials, { withCredentials: true })
      
      if (response.data && response.data.statusCode === 200 && response.data.data) {
        const { token } = response.data.data
        if (token) {
          tokenStorage.setAccessToken(token)
        }
        const sanitizedUser = this.sanitizeUserForStorage(response.data.data)
        response.data.data = sanitizedUser
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(sanitizedUser))
        }
      }
      
      return response.data as ApiResponse<UserDTO>
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

  // Check email and role
  static async checkEmailRole(email: string): Promise<{ exists: boolean, role: string | null }> {
    try {
      const response = await axios.get(`${API_URL}/login/check-email-role`, {
        params: { email }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email check failed')
    }
  }

  // Reset password
  static async resetPassword(email: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      const params = new URLSearchParams()
      params.append('email', email)
      params.append('newPassword', newPassword)

      const response = await axios.post(
        `${API_URL}/login/reset-password`,
        params,
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
            },
            withCredentials: true
          } 
        )
        
        if (response.data.data) {
          const { token } = response.data.data
          if (token) {
            tokenStorage.setAccessToken(token)
          }
          const sanitizedUser = this.sanitizeUserForStorage(response.data.data)
          response.data.data = sanitizedUser
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(sanitizedUser))
          }
        }
        
        return response.data as ApiResponse<UserDTO>
      }
      
      // Otherwise, this is the Android version with raw token
      const response = await axios.post(`${API_URL}/api/auth/google/login`, 
        { email: '' }, // Will be extracted from token
        { 
          headers: { 
            'X-Custom-Token': emailOrToken,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      )
      
      if (response.data.data) {
        const { token } = response.data.data
        if (token) {
          tokenStorage.setAccessToken(token)
        }
        const sanitizedUser = this.sanitizeUserForStorage(response.data.data)
        response.data.data = sanitizedUser
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(sanitizedUser))
        }
      }
      
      return response.data as ApiResponse<UserDTO>
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google login failed')
    }
  }

  // Get current user
  static getCurrentUser(): UserDTO | null {
    try {
      if (typeof window === 'undefined') return null
      const userStr = localStorage.getItem('user')
      if (!userStr) return null
      const parsed = JSON.parse(userStr)
      const sanitized = this.sanitizeUserForStorage(parsed)
      // Rewrite if legacy token fields exist
      if (sanitized && JSON.stringify(sanitized) !== userStr) {
        localStorage.setItem('user', JSON.stringify(sanitized))
      }
      return sanitized
    } catch {
      return null
    }
  }

  // Refresh token from cookie
  static async refreshToken(): Promise<ApiResponse<UserDTO> | null> {
    try {
      const response = await axios.post(`${API_URL}/login/refresh`, {}, { withCredentials: true })
      
      if (response.data && response.data.statusCode === 200 && response.data.data) {
        const { token } = response.data.data
        if (token) {
          tokenStorage.setAccessToken(token)
        }
        const sanitizedUser = this.sanitizeUserForStorage(response.data.data)
        response.data.data = sanitizedUser
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(sanitizedUser))
        }
        return response.data as ApiResponse<UserDTO>
      }
      
      return null
    } catch (error: any) {
      // If refresh fails, clear auth data
      this.clearAuth()
      return null
    }
  }

  // Get token
  static getToken(): string | null {
    return tokenStorage.getAccessToken()
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  // Set user data
  static setUser(user: User | UserDTO): void {
    const sanitizedUser = this.sanitizeUserForStorage(user)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(sanitizedUser))
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
  static async logout(redirect: boolean = true): Promise<void> {
    try {
      await axios.post(`${API_URL}/login/logout`, {}, { withCredentials: true })
    } catch (error) {
      console.warn('Logout request failed:', (error as any)?.message)
    } finally {
      this.clearAuth()
      if (redirect && typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
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

  // Update user (alias for updateProfile)
  static async updateUser(userData: Partial<User>): Promise<ApiResponse<UserDTO>> {
    return this.updateProfile(userData as Partial<UserDTO>)
  }
}
