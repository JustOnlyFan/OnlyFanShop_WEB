import { apiClient } from '@/lib/api'
import { ApiResponse, TagDTO } from '@/types'

// Use relative URL - Next.js rewrites will proxy to backend in dev, and in production should use same domain or reverse proxy
const API_URL = ''

/**
 * Service for managing product tags.
 * Tags are used for marketing purposes to highlight products as new, bestseller, on-sale, etc.
 * 
 * Requirements: 3.1
 */
class TagService {
  // ==================== PUBLIC ENDPOINTS ====================

  /**
   * Get all tags.
   * 
   * @returns list of all tags ordered by display order
   */
  static async getAllTags(): Promise<TagDTO[]> {
    const response = await apiClient.get<ApiResponse<TagDTO[]>>(`${API_URL}/tags/public`)
    return response.data?.data || []
  }

  /**
   * Get a tag by ID.
   * 
   * @param id the tag ID
   * @returns the tag
   */
  static async getTagById(id: number): Promise<TagDTO> {
    const response = await apiClient.get<ApiResponse<TagDTO>>(`${API_URL}/tags/public/${id}`)
    return response.data?.data as TagDTO
  }

  /**
   * Get a tag by code.
   * 
   * @param code the tag code (e.g., NEW, BESTSELLER, SALE)
   * @returns the tag if found
   */
  static async getTagByCode(code: string): Promise<TagDTO | null> {
    try {
      const response = await apiClient.get<ApiResponse<TagDTO>>(`${API_URL}/tags/public/code/${code}`)
      return response.data?.data || null
    } catch {
      return null
    }
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Create a new tag.
   * Requirements: 3.1 - Unique tag code and display name required
   * 
   * @param tag the tag data to create
   * @returns the created tag
   */
  static async createTag(tag: Partial<TagDTO>): Promise<TagDTO> {
    const response = await apiClient.post<ApiResponse<TagDTO>>(`${API_URL}/tags/admin/create`, tag)
    return response.data?.data as TagDTO
  }

  /**
   * Update an existing tag.
   * 
   * @param id the tag ID
   * @param tag the updated tag data
   * @returns the updated tag
   */
  static async updateTag(id: number, tag: Partial<TagDTO>): Promise<TagDTO> {
    const response = await apiClient.put<ApiResponse<TagDTO>>(`${API_URL}/tags/admin/${id}`, tag)
    return response.data?.data as TagDTO
  }

  /**
   * Delete a tag.
   * 
   * @param id the tag ID to delete
   */
  static async deleteTag(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${API_URL}/tags/admin/${id}`)
  }

  /**
   * Check if a tag code exists.
   * 
   * @param code the tag code to check
   * @returns true if the code exists
   */
  static async checkTagCodeExists(code: string): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<boolean>>(`${API_URL}/tags/admin/exists/${code}`)
    return response.data?.data || false
  }
}

export default TagService
