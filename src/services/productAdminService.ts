import axios from 'axios'
import { ApiResponse, ProductRequest, ProductDTO, HomepageResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface GetProductListParams {
  page?: number
  size?: number
  sortBy?: string
  order?: string
  keyword?: string
  categoryId?: number | null
  brandId?: number | null
}

class ProductAdminService {
  private static getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Get product list for admin
  static async getProductList(params: GetProductListParams = {}): Promise<HomepageResponse> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }
      
      const response = await axios.post(
        `${API_URL}/product/productList`,
        null,
        {
          params: {
            page: params.page ?? 1,
            size: params.size ?? 10,
            sortBy: params.sortBy ?? 'id',
            order: params.order ?? 'DESC',
            keyword: params.keyword,
            categoryId: params.categoryId,
            brandId: params.brandId
          },
          headers: this.getAuthHeaders()
        }
      )
      return response.data.data
    } catch (error: any) {
      console.error('Error loading products:', error.response?.status, error.response?.data)
      if (error.response?.status === 403) {
        throw new Error('Access denied. Please ensure you are logged in as an admin.')
      }
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.')
      }
      throw new Error(error.response?.data?.message || 'Failed to load products')
    }
  }

  // Add product
  static async addProduct(product: ProductRequest): Promise<ProductDTO> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }
      
      const response = await axios.post(`${API_URL}/product`, product, {
        headers: this.getAuthHeaders()
      })
      // Backend may return Product directly or wrapped in ApiResponse
      // Check if response.data has data field (ApiResponse) or is Product directly
      if (response.data && response.data.data) {
        return response.data.data
      }
      return response.data
    } catch (error: any) {
      console.error('Error adding product:', error.response?.status, error.response?.data)
      
      // Handle different HTTP status codes
      if (error.response?.status === 403 || error.response?.data?.statusCode === 403) {
        const message = error.response?.data?.message || 'Access Denied. Please ensure you are logged in as an admin or staff.'
        throw new Error(message)
      }
      if (error.response?.status === 401 || error.response?.data?.statusCode === 401) {
        const message = error.response?.data?.message || 'Session expired. Please login again.'
        throw new Error(message)
      }
      
      // Extract error message from ApiResponse
      let errorMessage = 'Failed to add product'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Log full error for debugging
      console.error('Full error details:', {
        status: error.response?.status,
        statusCode: error.response?.data?.statusCode,
        message: error.response?.data?.message,
        data: error.response?.data
      })
      
      throw new Error(errorMessage)
    }
  }

  // Update product
  static async updateProduct(productID: number, product: ProductRequest): Promise<ProductDTO> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }
      
      const response = await axios.put(`${API_URL}/product/${productID}`, product, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      console.error('Error updating product:', error.response?.status, error.response?.data)
      if (error.response?.status === 403) {
        throw new Error('Access Denied. Please ensure you are logged in as an admin.')
      }
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.')
      }
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update product'
      throw new Error(errorMessage)
    }
  }

  // Toggle active status
  static async toggleActive(productID: number, active: boolean): Promise<void> {
    try {
      const response = await axios.put(
        `${API_URL}/product/active/${productID}`,
        null,
        {
          params: { active },
          headers: this.getAuthHeaders()
        }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle product status')
    }
  }

  // Upload image
  static async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${API_URL}/api/upload/image`, formData, {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : null}`
        }
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  }
}

export { ProductAdminService as default }

