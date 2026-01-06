import axios from 'axios'

import { ApiResponse, CategoryManagement } from '@/types'
import { tokenStorage } from '@/utils/tokenStorage'

const API_URL = ''

class CategoryAdminService {
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

  // Get all categories
  static async getAllCategories(): Promise<CategoryManagement[]> {
    try {
      const response = await axios.get(`${API_URL}/category/public`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load categories')
    }
  }

  // Create category
  static async createCategory(category: { categoryName: string; active: boolean }): Promise<CategoryManagement> {
    try {
      // Backend nhận Category entity với field 'name', map từ categoryName
      const requestData: { name: string; description?: string; parentId?: number } = {
        name: category.categoryName
      }
      
      const response = await axios.post(`${API_URL}/category/create`, requestData, {
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
      throw new Error(error.message || 'Failed to create category')
    }
  }

  // Update category
  static async updateCategory(categoryID: number, category: Partial<CategoryManagement>): Promise<CategoryManagement> {
    try {
      // Backend nhận Category entity với field 'name', map từ categoryName
      const requestData: { name?: string } = {}
      
      if (category.categoryName !== undefined) {
        requestData.name = category.categoryName
      }
      
      const response = await axios.put(`${API_URL}/category/${categoryID}`, requestData, {
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
      throw new Error(error.message || 'Failed to update category')
    }
  }

  // Delete category
  static async deleteCategory(categoryID: number): Promise<void> {
    try {
      const response = await axios.delete(`${API_URL}/category/delete/${categoryID}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  // Toggle active status
  static async toggleActive(categoryID: number, active: boolean): Promise<CategoryManagement> {
    try {
      const response = await axios.put(
        `${API_URL}/category/switchActive/${categoryID}`,
        null,
        {
          params: { active },
          headers: this.getAuthHeaders()
        }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle category status')
    }
  }
}

export { CategoryAdminService as default }

