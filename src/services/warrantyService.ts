import axios from 'axios'
import { Warranty } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

class WarrantyService {
  private static getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Get all warranties (public endpoint, no auth required)
  static async getAllWarranties(): Promise<Warranty[]> {
    try {
      const response = await axios.get(`${API_URL}/warranties/public`)
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load warranties'
      throw new Error(errorMessage)
    }
  }

  // Create warranty
  static async createWarranty(warranty: { 
    name: string
    durationMonths: number
    description?: string
    termsAndConditions?: string
    coverage?: string
  }): Promise<Warranty> {
    try {
      const response = await axios.post(`${API_URL}/warranties/create`, warranty, {
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
      throw new Error(error.message || 'Failed to create warranty')
    }
  }

  // Update warranty
  static async updateWarranty(warrantyID: number, warranty: Partial<Warranty>): Promise<Warranty> {
    try {
      const response = await axios.put(`${API_URL}/warranties/${warrantyID}`, warranty, {
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
      throw new Error(error.message || 'Failed to update warranty')
    }
  }

  // Delete warranty
  static async deleteWarranty(warrantyID: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/warranties/${warrantyID}`, {
        headers: this.getAuthHeaders()
      })
    } catch (error: any) {
      // Xử lý lỗi từ backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw new Error(error.message || 'Failed to delete warranty')
    }
  }
}

export { WarrantyService as default }

