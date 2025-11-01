import axios from 'axios'
import { ApiResponse, BrandManagement } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class BrandAdminService {
  private static getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
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
  static async createBrand(brand: { name: string; country: string; description: string }): Promise<BrandManagement> {
    try {
      const response = await axios.post(`${API_URL}/brands/create`, brand, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create brand')
    }
  }

  // Update brand
  static async updateBrand(brandID: number, brand: Partial<BrandManagement>): Promise<BrandManagement> {
    try {
      const response = await axios.put(`${API_URL}/brands/${brandID}`, brand, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update brand')
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

