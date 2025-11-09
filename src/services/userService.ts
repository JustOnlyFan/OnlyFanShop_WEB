import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface UserProfile {
  id: number
  username: string
  email: string
  fullName: string
  phoneNumber?: string
  avatar?: string
  role: 'CUSTOMER' | 'ADMIN'
  isActive: boolean
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  address?: string
  city?: string
  district?: string
  ward?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  fullName?: string
  phoneNumber?: string
  avatar?: string
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  address?: string
  city?: string
  district?: string
  ward?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserStatistics {
  totalOrders: number
  totalSpent: number
  favoriteCategories: Array<{ category: string, count: number }>
  favoriteBrands: Array<{ brand: string, count: number }>
  averageOrderValue: number
  lastOrderDate?: string
  memberSince: string
}

export interface UserActivity {
  id: number
  activityType: 'LOGIN' | 'LOGOUT' | 'ORDER' | 'PAYMENT' | 'PROFILE_UPDATE' | 'PASSWORD_CHANGE'
  description: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export interface UserActivityResponse {
  activities: UserActivity[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class UserService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Get user profile
  static async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await axios.get(`${API_URL}/users/getUser`, {
        headers: this.getAuthHeaders()
      })
      // Map backend UserDTO to frontend UserProfile
      const userDTO = response.data.data
      const userProfile: UserProfile = {
        id: userDTO.userID,
        username: userDTO.username || '',
        email: userDTO.email || '',
        fullName: userDTO.username || '',
        phoneNumber: userDTO.phoneNumber || '',
        address: userDTO.address || '',
        role: userDTO.role || 'CUSTOMER',
        isActive: true,
        createdAt: '',
        updatedAt: ''
      }
      return {
        statusCode: response.data.statusCode,
        message: response.data.message,
        data: userProfile
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get profile')
    }
  }

  // Update user profile
  static async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      // Map frontend UpdateProfileRequest to backend UserDTO
      const userDTO = {
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || ''
      }
      const response = await axios.put(`${API_URL}/users/updateUser`, userDTO, {
        headers: this.getAuthHeaders()
      })
      // Map backend UserDTO to frontend UserProfile
      const updatedUserDTO = response.data.data
      const userProfile: UserProfile = {
        id: updatedUserDTO.userID,
        username: updatedUserDTO.username || '',
        email: updatedUserDTO.email || '',
        fullName: updatedUserDTO.username || '',
        phoneNumber: updatedUserDTO.phoneNumber || '',
        address: updatedUserDTO.address || '',
        role: updatedUserDTO.role || 'CUSTOMER',
        isActive: true,
        createdAt: '',
        updatedAt: ''
      }
      return {
        statusCode: response.data.statusCode,
        message: response.data.message,
        data: userProfile
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile')
    }
  }

  // Change password
  static async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      const response = await axios.put(`${API_URL}/api/users/change-password`, passwordData, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password')
    }
  }

  // Upload avatar
  static async uploadAvatar(file: File): Promise<ApiResponse<string>> {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await axios.post(`${API_URL}/api/users/avatar`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload avatar')
    }
  }

  // Delete avatar
  static async deleteAvatar(): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(`${API_URL}/api/users/avatar`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete avatar')
    }
  }

  // Get user statistics
  static async getUserStatistics(): Promise<ApiResponse<UserStatistics>> {
    try {
      const response = await axios.get(`${API_URL}/api/users/statistics`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user statistics')
    }
  }

  // Get user activity
  static async getUserActivity(page: number = 0, size: number = 20): Promise<ApiResponse<UserActivityResponse>> {
    try {
      const response = await axios.get(`${API_URL}/api/users/activity?page=${page}&size=${size}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user activity')
    }
  }

  // Deactivate account
  static async deactivateAccount(): Promise<ApiResponse<void>> {
    try {
      const response = await axios.put(`${API_URL}/api/users/deactivate`, {}, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to deactivate account')
    }
  }

  // Reactivate account
  static async reactivateAccount(): Promise<ApiResponse<void>> {
    try {
      const response = await axios.put(`${API_URL}/api/users/reactivate`, {}, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reactivate account')
    }
  }

  // Get all users (Admin only)
  static async getAllUsers(page: number = 0, size: number = 20, search?: string): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('size', size.toString())
      if (search) params.append('search', search)

      const response = await axios.get(`${API_URL}/api/users?${params}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get users')
    }
  }

  // Update user status (Admin only)
  static async updateUserStatus(userId: number, isActive: boolean): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await axios.put(`${API_URL}/api/users/${userId}/status`, 
        { isActive },
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user status')
    }
  }

  // Get user by ID (Admin only)
  static async getUserById(userId: number): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await axios.get(`${API_URL}/api/users/${userId}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user')
    }
  }

  // Get gender options
  static getGenderOptions() {
    return [
      { value: 'MALE', label: 'Nam' },
      { value: 'FEMALE', label: 'Nữ' },
      { value: 'OTHER', label: 'Khác' }
    ]
  }

  // Get Vietnamese cities
  static getVietnameseCities() {
    return [
      'Hà Nội',
      'TP. Hồ Chí Minh',
      'Đà Nẵng',
      'Hải Phòng',
      'Cần Thơ',
      'An Giang',
      'Bà Rịa - Vũng Tàu',
      'Bắc Giang',
      'Bắc Kạn',
      'Bạc Liêu',
      'Bắc Ninh',
      'Bến Tre',
      'Bình Định',
      'Bình Dương',
      'Bình Phước',
      'Bình Thuận',
      'Cà Mau',
      'Cao Bằng',
      'Đắk Lắk',
      'Đắk Nông',
      'Điện Biên',
      'Đồng Nai',
      'Đồng Tháp',
      'Gia Lai',
      'Hà Giang',
      'Hà Nam',
      'Hà Tĩnh',
      'Hải Dương',
      'Hậu Giang',
      'Hòa Bình',
      'Hưng Yên',
      'Khánh Hòa',
      'Kiên Giang',
      'Kon Tum',
      'Lai Châu',
      'Lâm Đồng',
      'Lạng Sơn',
      'Lào Cai',
      'Long An',
      'Nam Định',
      'Nghệ An',
      'Ninh Bình',
      'Ninh Thuận',
      'Phú Thọ',
      'Phú Yên',
      'Quảng Bình',
      'Quảng Nam',
      'Quảng Ngãi',
      'Quảng Ninh',
      'Quảng Trị',
      'Sóc Trăng',
      'Sơn La',
      'Tây Ninh',
      'Thái Bình',
      'Thái Nguyên',
      'Thanh Hóa',
      'Thừa Thiên Huế',
      'Tiền Giang',
      'Trà Vinh',
      'Tuyên Quang',
      'Vĩnh Long',
      'Vĩnh Phúc',
      'Yên Bái'
    ]
  }

  // Format user name
  static formatUserName(user: UserProfile): string {
    return user.fullName || user.username || user.email
  }

  // Get user initials
  static getUserInitials(user: UserProfile): string {
    const name = user.fullName || user.username || user.email
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  // Validate profile data
  static validateProfileData(profileData: UpdateProfileRequest): { isValid: boolean, errors: string[] } {
    const errors: string[] = []

    if (profileData.fullName && profileData.fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters')
    }

    if (profileData.phoneNumber && !/^[0-9+\-\s()]+$/.test(profileData.phoneNumber)) {
      errors.push('Invalid phone number format')
    }

    if (profileData.dateOfBirth) {
      const birthDate = new Date(profileData.dateOfBirth)
      const today = new Date()
      if (birthDate > today) {
        errors.push('Date of birth cannot be in the future')
      }
    }

    if (profileData.gender && !['MALE', 'FEMALE', 'OTHER'].includes(profileData.gender)) {
      errors.push('Invalid gender selection')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validate password change
  static validatePasswordChange(passwordData: ChangePasswordRequest): { isValid: boolean, errors: string[] } {
    const errors: string[] = []

    if (!passwordData.currentPassword) {
      errors.push('Current password is required')
    }

    if (!passwordData.newPassword) {
      errors.push('New password is required')
    } else if (passwordData.newPassword.length < 6) {
      errors.push('New password must be at least 6 characters')
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('New password and confirm password do not match')
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push('New password must be different from current password')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get activity type label
  static getActivityTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      'LOGIN': 'Đăng nhập',
      'LOGOUT': 'Đăng xuất',
      'ORDER': 'Đặt hàng',
      'PAYMENT': 'Thanh toán',
      'PROFILE_UPDATE': 'Cập nhật thông tin',
      'PASSWORD_CHANGE': 'Đổi mật khẩu'
    }
    return typeMap[type] || type
  }

  // Get activity type color
  static getActivityTypeColor(type: string): string {
    const colorMap: Record<string, string> = {
      'LOGIN': 'bg-green-100 text-green-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'ORDER': 'bg-blue-100 text-blue-800',
      'PAYMENT': 'bg-purple-100 text-purple-800',
      'PROFILE_UPDATE': 'bg-yellow-100 text-yellow-800',
      'PASSWORD_CHANGE': 'bg-red-100 text-red-800'
    }
    return colorMap[type] || 'bg-gray-100 text-gray-800'
  }
}