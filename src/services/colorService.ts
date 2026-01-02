import axios from 'axios'

import { Color } from '@/types'
import { tokenStorage } from '@/utils/tokenStorage'

// Use relative URL - Next.js rewrites will proxy to backend in dev, and in production should use same domain or reverse proxy
const API_URL = ''

class ColorService {
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

  // Get all colors (public endpoint, no auth required)
  static async getAllColors(): Promise<Color[]> {
    try {
      const response = await axios.get(`${API_URL}/colors/public`)
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to load colors'
      throw new Error(errorMessage)
    }
  }

  // Create color
  static async createColor(color: { name: string; hexCode?: string; description?: string }): Promise<Color> {
    try {
      const response = await axios.post(`${API_URL}/colors/create`, color, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create color')
    }
  }

  // Update color
  static async updateColor(colorID: number, color: Partial<Color>): Promise<Color> {
    try {
      const response = await axios.put(`${API_URL}/colors/${colorID}`, color, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update color')
    }
  }

  // Delete color
  static async deleteColor(colorID: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/colors/${colorID}`, {
        headers: this.getAuthHeaders()
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete color')
    }
  }
}

export { ColorService as default }

