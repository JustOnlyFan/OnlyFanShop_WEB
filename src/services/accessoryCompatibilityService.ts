import { apiClient } from '@/lib/api'
import { ApiResponse, AccessoryCompatibilityDTO, Product } from '@/types'

const API_URL = ''

class AccessoryCompatibilityService {

  static async getCompatibilityByProduct(accessoryProductId: number): Promise<AccessoryCompatibilityDTO[]> {
    const response = await apiClient.get<ApiResponse<AccessoryCompatibilityDTO[]>>(
      `${API_URL}/accessory-compatibility/public/product/${accessoryProductId}`
    )
    return response.data?.data || []
  }

  static async getAccessoriesByFanType(fanTypeId: number): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${API_URL}/accessory-compatibility/public/fan-type/${fanTypeId}/accessories`
    )
    return response.data?.data || []
  }

  static async updateCompatibility(id: number, compatibility: Partial<AccessoryCompatibilityDTO>): Promise<AccessoryCompatibilityDTO> {
    const response = await apiClient.put<ApiResponse<AccessoryCompatibilityDTO>>(
      `${API_URL}/accessory-compatibility/admin/${id}`,
      compatibility
    )
    return response.data?.data as AccessoryCompatibilityDTO
  }

  static async deleteCompatibility(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${API_URL}/accessory-compatibility/admin/${id}`)
  }

  static async addCompatibilities(
    accessoryProductId: number,
    compatibilities: Partial<AccessoryCompatibilityDTO>[]
  ): Promise<AccessoryCompatibilityDTO[]> {
    const response = await apiClient.post<ApiResponse<AccessoryCompatibilityDTO[]>>(
      `${API_URL}/accessory-compatibility/admin/product/${accessoryProductId}/bulk`,
      compatibilities
    )
    return response.data?.data || []
  }

  static async replaceCompatibilities(
    accessoryProductId: number,
    compatibilities: Partial<AccessoryCompatibilityDTO>[]
  ): Promise<AccessoryCompatibilityDTO[]> {
    const response = await apiClient.put<ApiResponse<AccessoryCompatibilityDTO[]>>(
      `${API_URL}/accessory-compatibility/admin/product/${accessoryProductId}/replace`,
      compatibilities
    )
    return response.data?.data || []
  }

  static async deleteAllByAccessoryProduct(accessoryProductId: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(
      `${API_URL}/accessory-compatibility/admin/product/${accessoryProductId}`
    )
  }

  static async hasCompatibilityEntries(accessoryProductId: number): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `${API_URL}/accessory-compatibility/admin/product/${accessoryProductId}/has-entries`
    )
    return response.data?.data || false
  }

  static async getCompatibilityCount(accessoryProductId: number): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>(
      `${API_URL}/accessory-compatibility/admin/product/${accessoryProductId}/count`
    )
    return response.data?.data || 0
  }
}

export default AccessoryCompatibilityService
