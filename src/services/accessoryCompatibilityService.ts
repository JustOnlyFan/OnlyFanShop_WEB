import { apiClient } from '@/lib/api'
import { ApiResponse, AccessoryCompatibilityDTO, Product } from '@/types'

// Use relative URL - Next.js rewrites will proxy to backend in dev, and in production should use same domain or reverse proxy
const API_URL = ''

/**
 * Service for managing accessory compatibility information.
 * Provides methods for CRUD operations on compatibility entries and
 * querying accessories by compatible fan type.
 * 
 * Requirements: 9.1, 9.2, 9.3
 */
class AccessoryCompatibilityService {
  // ==================== PUBLIC ENDPOINTS ====================

  /**
   * Get compatibility information for an accessory product.
   * Requirements: 8.3 - Show which fan types and models the accessory is compatible with
   * 
   * @param accessoryProductId the accessory product ID
   * @returns list of compatibility entries
   */
  static async getCompatibilityByProduct(accessoryProductId: number): Promise<AccessoryCompatibilityDTO[]> {
    const response = await apiClient.get<ApiResponse<AccessoryCompatibilityDTO[]>>(
      `${API_URL}/accessory-compatibility/public/product/${accessoryProductId}`
    )
    return response.data?.data || []
  }

  /**
   * Get accessories compatible with a specific fan type.
   * Requirements: 8.4 - Filter accessories by compatible fan type
   * 
   * @param fanTypeId the fan type category ID
   * @returns list of accessory products
   */
  static async getAccessoriesByFanType(fanTypeId: number): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${API_URL}/accessory-compatibility/public/fan-type/${fanTypeId}/accessories`
    )
    return response.data?.data || []
  }

  /**
   * Get accessories compatible with a specific brand.
   * 
   * @param brandId the brand ID
   * @returns list of accessory products
   */
  static async getAccessoriesByBrand(brandId: number): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${API_URL}/accessory-compatibility/public/brand/${brandId}/accessories`
    )
    return response.data?.data || []
  }

  /**
   * Get accessories compatible with a specific fan type and brand.
   * 
   * @param fanTypeId the fan type category ID
   * @param brandId the brand ID
   * @returns list of accessory products
   */
  static async getAccessoriesByFanTypeAndBrand(fanTypeId: number, brandId: number): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${API_URL}/accessory-compatibility/public/fan-type/${fanTypeId}/brand/${brandId}/accessories`
    )
    return response.data?.data || []
  }

  /**
   * Search compatibility entries by model pattern.
   * 
   * @param modelPattern the model pattern to search for
   * @returns list of compatibility entries
   */
  static async searchByModel(modelPattern: string): Promise<AccessoryCompatibilityDTO[]> {
    const response = await apiClient.get<ApiResponse<AccessoryCompatibilityDTO[]>>(
      `${API_URL}/accessory-compatibility/public/search?modelPattern=${encodeURIComponent(modelPattern)}`
    )
    return response.data?.data || []
  }

  /**
   * Get a compatibility entry by ID.
   * 
   * @param id the compatibility entry ID
   * @returns the compatibility entry
   */
  static async getCompatibilityById(id: number): Promise<AccessoryCompatibilityDTO> {
    const response = await apiClient.get<ApiResponse<AccessoryCompatibilityDTO>>(
      `${API_URL}/accessory-compatibility/public/${id}`
    )
    return response.data?.data as AccessoryCompatibilityDTO
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Create a new compatibility entry.
   * Requirements: 9.1, 9.2 - Specify compatible fan types and models/brands
   * 
   * @param compatibility the compatibility data to create
   * @returns the created compatibility entry
   */
  static async createCompatibility(compatibility: Partial<AccessoryCompatibilityDTO>): Promise<AccessoryCompatibilityDTO> {
    const response = await apiClient.post<ApiResponse<AccessoryCompatibilityDTO>>(
      `${API_URL}/accessory-compatibility/admin/create`,
      compatibility
    )
    return response.data?.data as AccessoryCompatibilityDTO
  }

  /**
   * Update an existing compatibility entry.
   * Requirements: 9.4 - Reflect changes immediately
   * 
   * @param id the compatibility entry ID
   * @param compatibility the updated compatibility data
   * @returns the updated compatibility entry
   */
  static async updateCompatibility(id: number, compatibility: Partial<AccessoryCompatibilityDTO>): Promise<AccessoryCompatibilityDTO> {
    const response = await apiClient.put<ApiResponse<AccessoryCompatibilityDTO>>(
      `${API_URL}/accessory-compatibility/admin/${id}`,
      compatibility
    )
    return response.data?.data as AccessoryCompatibilityDTO
  }

  /**
   * Delete a compatibility entry.
   * 
   * @param id the compatibility entry ID to delete
   */
  static async deleteCompatibility(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${API_URL}/accessory-compatibility/admin/${id}`)
  }

  /**
   * Add multiple compatibility entries for an accessory product.
   * Requirements: 9.1, 9.2 - Specify compatible fan types and models/brands
   * 
   * @param accessoryProductId the accessory product ID
   * @param compatibilities list of compatibility entries to add
   * @returns list of created compatibility entries
   */
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

  /**
   * Replace all compatibility entries for an accessory product.
   * Requirements: 9.3 - Store relationship in dedicated table
   * 
   * @param accessoryProductId the accessory product ID
   * @param compatibilities list of new compatibility entries
   * @returns list of created compatibility entries
   */
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

  /**
   * Delete all compatibility entries for an accessory product.
   * 
   * @param accessoryProductId the accessory product ID
   */
  static async deleteAllByAccessoryProduct(accessoryProductId: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(
      `${API_URL}/accessory-compatibility/admin/product/${accessoryProductId}`
    )
  }

  /**
   * Check if an accessory has any compatibility entries.
   * 
   * @param accessoryProductId the accessory product ID
   * @returns true if the accessory has compatibility entries
   */
  static async hasCompatibilityEntries(accessoryProductId: number): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `${API_URL}/accessory-compatibility/admin/product/${accessoryProductId}/has-entries`
    )
    return response.data?.data || false
  }

  /**
   * Get the count of compatibility entries for an accessory product.
   * 
   * @param accessoryProductId the accessory product ID
   * @returns the number of compatibility entries
   */
  static async getCompatibilityCount(accessoryProductId: number): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>(
      `${API_URL}/accessory-compatibility/admin/product/${accessoryProductId}/count`
    )
    return response.data?.data || 0
  }
}

export default AccessoryCompatibilityService
