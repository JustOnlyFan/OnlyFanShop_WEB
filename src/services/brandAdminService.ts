import axios from 'axios'

import { ApiResponse, BrandManagement } from '@/types'
import { tokenStorage } from '@/utils/tokenStorage'

// Use relative URL - Next.js rewrites will proxy to backend in dev, and in production should use same domain or reverse proxy
const API_URL = ''

class BrandAdminService {
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

  // Get all brands
  static async getAllBrands(): Promise<BrandManagement[]> {
    try {
      const response = await axios.get(`${API_URL}/brands/public`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load brands')
    }
  }

  // Create brand
  static async createBrand(brand: { name: string; country: string; description: string; imageURL?: string }): Promise<BrandManagement> {
    try {
      // Backend không sử dụng country field, chỉ gửi các field cần thiết
      const requestData: { name: string; description: string; imageURL?: string } = {
        name: brand.name,
        description: brand.description
      }
      
      if (brand.imageURL) {
        requestData.imageURL = brand.imageURL
      }
      
      const response = await axios.post(`${API_URL}/brands/create`, requestData, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      // Xử lý lỗi validation từ backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      if (error.response?.status === 400) {
        throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.')
      }
      throw new Error(error.message || 'Failed to create brand')
    }
  }

  // Upload image
  static async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = tokenStorage.getAccessToken()
      if (!token || token.trim() === '') {
        throw new Error('No authentication token found. Please login again.')
      }

      const response = await axios.post(`${API_URL}/api/upload/brand-image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - axios will set it automatically with boundary for FormData
        }
      })
      
      if (response.data && response.data.data) {
        return response.data.data
      } else if (response.data) {
        // Some APIs return the URL directly
        return typeof response.data === 'string' ? response.data : response.data
      }
      
      throw new Error('Invalid response format from server')
    } catch (error: any) {
      console.error('Upload image error:', error)
      if (error.response) {
        // Handle 403 Forbidden - token invalid or expired
        if (error.response.status === 403) {
          // Clear invalid token
          tokenStorage.clearAll()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
          }
          throw new Error('Phiên đăng nhập đã hết hạn hoặc token không hợp lệ. Vui lòng đăng nhập lại.')
        }
        // Handle 401 Unauthorized
        if (error.response.status === 401) {
          tokenStorage.clearAll()
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
          }
          throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.')
        }
        const errorMessage = error.response.data?.message || error.response.data?.error || `HTTP ${error.response.status}: ${error.response.statusText}`
        throw new Error(errorMessage)
      } else if (error.request) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
      } else {
        throw new Error(error.message || 'Failed to upload image')
      }
    }
  }

  // Update brand
  static async updateBrand(brandID: number, brand: Partial<BrandManagement>): Promise<BrandManagement> {
    try {
      // Backend không sử dụng country field
      const requestData: { name?: string; description?: string; imageURL?: string } = {}
      
      if (brand.name !== undefined) {
        requestData.name = brand.name
      }
      if (brand.description !== undefined) {
        requestData.description = brand.description
      }
      if (brand.imageURL !== undefined) {
        requestData.imageURL = brand.imageURL
      }
      
      const response = await axios.put(`${API_URL}/brands/${brandID}`, requestData, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      // Xử lý lỗi validation từ backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      if (error.response?.status === 400) {
        throw new Error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.')
      }
      throw new Error(error.message || 'Failed to update brand')
    }
  }

  // Toggle active status
  static async toggleActive(brandID: number, active: boolean): Promise<BrandManagement> {
    try {
      const response = await axios.put(
        `${API_URL}/brands/switchActive/${brandID}`,
        null,
        {
          params: { active },
          headers: this.getAuthHeaders()
        }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle brand status')
    }
  }
}

export { BrandAdminService as default }

