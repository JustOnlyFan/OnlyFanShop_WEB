import axios from 'axios'

import { ApiResponse, ProductRequest, ProductDTO, HomepageResponse } from '@/types'
import { tokenStorage } from '@/utils/tokenStorage'

const API_URL = ''

export interface GetProductListParams {
  page?: number
  size?: number
  sortBy?: string
  order?: string
  keyword?: string
  categoryId?: number | null
  brandId?: number | null
  includeInactive?: boolean
}

class ProductAdminService {
  private static getAuthHeaders() {
    const token = tokenStorage.getAccessToken()
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Get product list for admin
  static async getProductList(params: GetProductListParams = {}): Promise<HomepageResponse> {
    try {
      const token = tokenStorage.getAccessToken()
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
            brandId: params.brandId,
            includeInactive: params.includeInactive
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

  // Add product with categories and tags
  static async addProduct(product: ProductRequest & { categoryIds?: number[]; tagIds?: number[] }): Promise<ProductDTO> {
    try {
      const token = tokenStorage.getAccessToken()
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }

      const { categoryIds, tagIds, ...productData } = product
      
      const response = await axios.post(`${API_URL}/product`, productData, {
        headers: this.getAuthHeaders()
      })
      let createdProduct: ProductDTO
      if (response.data && response.data.data) {
        createdProduct = response.data.data
      } else {
        createdProduct = response.data
      }
      
      const productId = createdProduct.productID || createdProduct.id
      
      // Assign categories if provided
      if (categoryIds && categoryIds.length > 0 && productId) {
        await this.assignCategoriesToProduct(productId, categoryIds)
      }
      
      // Assign tags if provided
      if (tagIds && tagIds.length > 0 && productId) {
        await this.assignTagsToProduct(productId, tagIds)
      }
      
      return createdProduct
    } catch (error: any) {
      console.error('Error adding product:', error.response?.status, error.response?.data)

      if (error.response?.status === 403 || error.response?.data?.statusCode === 403) {
        const message = error.response?.data?.message || 'Access Denied. Please ensure you are logged in as an admin or staff.'
        throw new Error(message)
      }
      if (error.response?.status === 401 || error.response?.data?.statusCode === 401) {
        const message = error.response?.data?.message || 'Session expired. Please login again.'
        throw new Error(message)
      }

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

      console.error('Full error details:', {
        status: error.response?.status,
        statusCode: error.response?.data?.statusCode,
        message: error.response?.data?.message,
        data: error.response?.data
      })
      
      throw new Error(errorMessage)
    }
  }

  static async updateProduct(productID: number, product: ProductRequest & { categoryIds?: number[]; tagIds?: number[] }): Promise<ProductDTO> {
    try {
      const token = tokenStorage.getAccessToken()
      if (!token) {
        throw new Error('No authentication token found. Please login again.')
      }

      const { categoryIds, tagIds, ...productData } = product
      
      const response = await axios.put(`${API_URL}/product/${productID}`, productData, {
        headers: this.getAuthHeaders()
      })

      if (categoryIds && categoryIds.length > 0) {
        await this.replaceProductCategories(productID, categoryIds)
      }

      if (tagIds) {
        await this.replaceProductTags(productID, tagIds)
      }
      
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

      const token = tokenStorage.getAccessToken()
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await axios.post(`${API_URL}/api/upload/image`, formData, {
        headers
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload image')
    }
  }

  static async assignCategoriesToProduct(productId: number, categoryIds: number[]): Promise<void> {
    try {
      await axios.post(`${API_URL}/product/${productId}/categories`, categoryIds, {
        headers: this.getAuthHeaders()
      })
    } catch (error: any) {
      console.error('Error assigning categories:', error.response?.data)
      // Don't throw - categories assignment is secondary
    }
  }

  static async replaceProductCategories(productId: number, categoryIds: number[]): Promise<void> {
    try {
      await axios.put(`${API_URL}/product/${productId}/categories`, categoryIds, {
        headers: this.getAuthHeaders()
      })
    } catch (error: any) {
      console.error('Error replacing categories:', error.response?.data)
    }
  }

  static async assignTagsToProduct(productId: number, tagIds: number[]): Promise<void> {
    try {
      await axios.post(`${API_URL}/product/${productId}/tags`, tagIds, {
        headers: this.getAuthHeaders()
      })
    } catch (error: any) {
      console.error('Error assigning tags:', error.response?.data)
    }
  }

  // Replace product tags
  static async replaceProductTags(productId: number, tagIds: number[]): Promise<void> {
    try {
      await axios.put(`${API_URL}/product/${productId}/tags`, tagIds, {
        headers: this.getAuthHeaders()
      })
    } catch (error: any) {
      console.error('Error replacing tags:', error.response?.data)
    }
  }
}

export { ProductAdminService as default }

