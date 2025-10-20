import { apiClient } from '@/lib/api'
import { User, LoginRequest, RegisterRequest, ApiResponse } from '@/types'

export class AuthService {
  // Login
  static async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
    return apiClient.post('/login/signin', credentials)
  }

  // Register
  static async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return apiClient.post('/login/register', userData)
  }

  // Google Login
  static async googleLogin(email: string, username: string): Promise<ApiResponse<User>> {
    return apiClient.post('/api/auth/google/login', { email, username })
  }

  // Send OTP
  static async sendOTP(email: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/login/send-otp?email=${email}`)
  }

  // Verify OTP
  static async verifyOTP(email: string, otp: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/login/verify-otp?email=${email}&otp=${otp}`)
  }

  // Reset Password
  static async resetPassword(email: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/login/reset-password?email=${email}&newPassword=${newPassword}`)
  }

  // Check if account exists
  static async checkAccount(username?: string, email?: string): Promise<{
    usernameExists?: boolean
    emailExists?: boolean
  }> {
    const params = new URLSearchParams()
    if (username) params.append('username', username)
    if (email) params.append('email', email)
    
    const response = await apiClient.get(`/login/check-account?${params.toString()}`)
    return response.data as {
      usernameExists?: boolean
      emailExists?: boolean
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get('/users/getUser')
  }

  // Update user
  static async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put('/users/updateUser', userData)
  }

  // Change password
  static async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.put('/users/changePassword', { oldPassword, newPassword })
  }

  // Change address
  static async changeAddress(address: string): Promise<ApiResponse<void>> {
    return apiClient.put(`/users/changeAddress?address=${address}`)
  }

  // Logout
  static async logout(): Promise<ApiResponse<void>> {
    return apiClient.post('/users/logout')
  }

  // Local storage helpers
  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }
}
