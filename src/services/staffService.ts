import axios from 'axios'

import { tokenStorage } from '@/utils/tokenStorage'
import type { StoreStatus } from './storeLocationService'

// Use relative URL - Next.js rewrites will proxy to backend in dev, and in production should use same domain or reverse proxy
const API_URL = ''

export interface Staff {
  userID: number
  username: string
  email: string
  phoneNumber?: string
  address?: string
  role: 'STAFF' | string
  storeLocationId?: number
  storeLocation?: {
    locationID: number
    name: string
    address: string
    ward?: string
    city?: string
    phone?: string
    status?: StoreStatus
  }
  status: 'active' | 'inactive' | 'banned'
  createdAt?: string
  lastLoginAt?: string
}

export interface CreateStaffRequest {
  username: string
  email: string
  password: string
  phoneNumber?: string
  address?: string
  storeLocationId?: number
}

export interface UpdateStaffRequest {
  username?: string
  email?: string
  phoneNumber?: string
  address?: string
  storeLocationId?: number
  status?: 'active' | 'inactive' | 'banned'
}

export interface StaffResponse {
  content?: Staff[]  // Spring Boot Page structure
  staff?: Staff[]    // Fallback for custom response
  totalPages: number
  totalElements: number
  number?: number    // Current page (0-indexed)
  currentPage?: number
  size?: number      // Page size
  pageSize?: number
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class StaffService {
  private static getAuthHeaders() {
    const token = tokenStorage.getAccessToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  // Get all staff (Admin only)
  static async getAllStaff(
    page: number = 0,
    size: number = 20,
    storeLocationId?: number
  ): Promise<ApiResponse<StaffResponse>> {
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('size', size.toString())
      if (storeLocationId) {
        params.append('storeLocationId', storeLocationId.toString())
      }

      const response = await axios.get(
        `${API_URL}/api/admin/staff?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get staff')
    }
  }

  // Get staff by ID
  static async getStaffById(staffId: number): Promise<ApiResponse<Staff>> {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/staff/${staffId}`,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get staff')
    }
  }

  // Create staff (Admin only)
  static async createStaff(staffData: CreateStaffRequest): Promise<ApiResponse<Staff>> {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/staff`,
        staffData,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create staff')
    }
  }

  // Update staff (Admin only)
  static async updateStaff(
    staffId: number,
    staffData: UpdateStaffRequest
  ): Promise<ApiResponse<Staff>> {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/staff/${staffId}`,
        staffData,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update staff')
    }
  }

  // Delete staff (Admin only)
  static async deleteStaff(staffId: number): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/staff/${staffId}`,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete staff')
    }
  }

  // Get staff by store location
  static async getStaffByStoreLocation(storeLocationId: number): Promise<ApiResponse<Staff[]>> {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/staff/store/${storeLocationId}`,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get staff by store location')
    }
  }

  // Reset staff password to default (Admin only)
  static async resetStaffPassword(staffId: number): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/staff/${staffId}/reset-password`,
        {},
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset staff password')
    }
  }

  // Get current staff profile (Staff only)
  static async getMyProfile(): Promise<ApiResponse<Staff>> {
    try {
      const response = await axios.get(
        `${API_URL}/api/staff/profile`,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get staff profile')
    }
  }

  // Update current staff profile (Staff only)
  static async updateMyProfile(staffData: Partial<UpdateStaffRequest>): Promise<ApiResponse<Staff>> {
    try {
      const response = await axios.put(
        `${API_URL}/api/staff/profile`,
        staffData,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update staff profile')
    }
  }

  // Validate staff data
  static validateStaffData(staffData: CreateStaffRequest): { isValid: boolean, errors: string[] } {
    const errors: string[] = []

    if (!staffData.username?.trim()) {
      errors.push('Username is required')
    }

    if (!staffData.email?.trim()) {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffData.email)) {
      errors.push('Invalid email format')
    }

    if (!staffData.password || staffData.password.length < 6) {
      errors.push('Password must be at least 6 characters')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}





