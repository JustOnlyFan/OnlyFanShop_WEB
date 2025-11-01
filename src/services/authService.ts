import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

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
  userID: number
  username: string
  email: string
  phoneNumber?: string
  address?: string
  role: 'CUSTOMER' | 'ADMIN'
  authProvider: 'LOCAL' | 'GOOGLE' | 'FACEBOOK'
  token?: string
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class AuthService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Login
  static async login(credentials: LoginRequest): Promise<ApiResponse<UserDTO>> {
    try {
      const response = await axios.post(`${API_URL}/login/signin`, credentials)
      
      // Only save to localStorage if login is successful
      if (response.data && response.data.statusCode === 200 && response.data.data) {
        localStorage.setItem('token', response.data.data.token || '')
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
      
      return response.data
    } catch (error: any) {
      // Clear any existing auth data on login failure
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  // Register
  static async register(userData: RegisterRequest): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${API_URL}/login/register`, userData)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  // Send OTP
  static async sendOtp(email: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${API_URL}/login/send-otp`, 
        { email }, 
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP')
    }
  }

  // Verify OTP
  static async verifyOtp(email: string, otp: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${API_URL}/login/verify-otp`, 
        { email, otp }, 
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
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
          localStorage.setItem('token', response.data.data.token || '')
          localStorage.setItem('user', JSON.stringify(response.data.data))
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
        localStorage.setItem('token', response.data.data.token || '')
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google login failed')
    }
  }

  // Get current user
  static getCurrentUser(): UserDTO | null {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  }

  // Get token
  static getToken(): string | null {
    return localStorage.getItem('token')
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken()
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  // Set user data
  static setUser(user: UserDTO): void {
    localStorage.setItem('user', JSON.stringify(user))
  }

  // Set token
  static setToken(token: string): void {
    localStorage.setItem('token', token)
  }

  // Remove token
  static removeToken(): void {
    localStorage.removeItem('token')
  }

  // Remove user
  static removeUser(): void {
    localStorage.removeItem('user')
  }

  // Clear all auth data
  static clearAuth(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Logout
  static logout(): void {
    this.clearAuth()
    window.location.href = '/auth/login'
  }

  // Update profile
  static async updateProfile(userData: Partial<UserDTO>): Promise<ApiResponse<UserDTO>> {
    try {
      const response = await axios.put(`${API_URL}/api/users/profile`, userData, {
        headers: this.getAuthHeaders()
      })
      
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
      const response = await axios.put(`${API_URL}/api/users/change-password`, 
        { currentPassword, newPassword },
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed')
    }
  }
}