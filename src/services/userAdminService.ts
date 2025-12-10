import { apiClient } from '@/lib/api'
import { tokenStorage } from '@/utils/tokenStorage'
import type { StoreStatus } from './storeLocationService'

const API_URL = typeof process.env.NEXT_PUBLIC_API_URL !== 'undefined'
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  : 'http://localhost:8080'

export interface UserDTO {
  userID: number
  username: string
  fullName: string
  email: string
  phoneNumber?: string
  phone?: string
  status: 'active' | 'inactive' | 'banned'
  role?: {
    id: number
    name: string
  }
  roleName?: string
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
}

export interface UserListResponse {
  content: UserDTO[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class UserAdminService {

  static async getAllUsers(
    keyword?: string,
    role?: string,
    page: number = 0,
    size: number = 10,
    sortField: string = 'fullname',
    sortDirection: string = 'ASC'
  ): Promise<ApiResponse<UserListResponse>> {
    try {
      const token = tokenStorage.getAccessToken()
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }

      const params = new URLSearchParams()
      if (keyword) params.append('keyword', keyword)
      if (role) params.append('role', role)
      params.append('page', page.toString())
      params.append('size', size.toString())
      params.append('sortField', sortField)
      params.append('sortDirection', sortDirection)

      const response = await apiClient.get<ApiResponse<UserListResponse>>(
        `/users/getAllUsers?${params.toString()}`
      )
      // apiClient.get returns AxiosResponse, so we need response.data which is already ApiResponse<UserListResponse>
      return response.data as ApiResponse<UserListResponse>
    } catch (error: any) {
      console.error('Error getting users:', error.response?.status, error.response?.data)
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || 'Session expired. Please login again.'
        throw new Error(message)
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied. Admin access required.')
      }
      if (error.response?.status === 404) {
        throw new Error('Endpoint not found. Please check API URL configuration.')
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to get users')
    }
  }

  static async getStaffManagementAccounts(
    keyword?: string,
    storeLocationId?: number,
    page: number = 0,
    size: number = 20,
    sortField: string = 'fullname',
    sortDirection: string = 'ASC'
  ): Promise<ApiResponse<UserListResponse>> {
    try {
      const token = tokenStorage.getAccessToken()
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }

      const params = new URLSearchParams()
      if (keyword) params.append('keyword', keyword)
      if (typeof storeLocationId === 'number') {
        params.append('storeLocationId', storeLocationId.toString())
      }
      params.append('page', page.toString())
      params.append('size', size.toString())
      params.append('sortField', sortField)
      params.append('sortDirection', sortDirection)

      const response = await apiClient.get<ApiResponse<UserListResponse>>(
        `/users/staff-management/accounts?${params.toString()}`
      )
      return response.data as ApiResponse<UserListResponse>
    } catch (error: any) {
      console.error('Error getting staff accounts:', error.response?.status, error.response?.data)
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || 'Session expired. Please login again.'
        throw new Error(message)
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied. Admin access required.')
      }
      if (error.response?.status === 404) {
        throw new Error('Endpoint not found. Please check API URL configuration.')
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to get staff accounts')
    }
  }

  // Note: These endpoints may not exist in backend yet
  // static async updateUserStatus(userId: number, status: 'active' | 'inactive' | 'banned'): Promise<ApiResponse<UserDTO>> {
  //   try {
  //     const response = await axios.put(
  //       `${API_URL}/users/${userId}/status`,
  //       { status },
  //       { headers: this.getAuthHeaders() }
  //     )
  //     return response.data
  //   } catch (error: any) {
  //     throw new Error(error.response?.data?.message || 'Failed to update user status')
  //   }
  // }

  // static async deleteUser(userId: number): Promise<ApiResponse<void>> {
  //   try {
  //     const response = await axios.delete(
  //       `${API_URL}/users/${userId}`,
  //       { headers: this.getAuthHeaders() }
  //     )
  //     return response.data
  //   } catch (error: any) {
  //     throw new Error(error.response?.data?.message || 'Failed to delete user')
  //   }
  // }
}

