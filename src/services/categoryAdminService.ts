import axios from 'axios'
import { ApiResponse, CategoryManagement } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class CategoryAdminService {
  private static getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
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
      const response = await axios.post(`${API_URL}/category/create`, category, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create category')
    }
  }

  // Update category
  static async updateCategory(categoryID: number, category: Partial<CategoryManagement>): Promise<CategoryManagement> {
    try {
      const response = await axios.put(`${API_URL}/category/${categoryID}`, category, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update category')
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

