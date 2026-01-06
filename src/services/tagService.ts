import { apiClient } from '@/lib/api'
import { ApiResponse, TagDTO } from '@/types'

const API_URL = ''

class TagService {

  static async getAllTags(): Promise<TagDTO[]> {
    try {
      const url = `${API_URL}/tags/public`
      console.log('TagService.getAllTags - Request URL:', url)
      
      const response = await apiClient.get<ApiResponse<TagDTO[]>>(url)
      console.log('TagService.getAllTags - Response status:', response.status)
      console.log('TagService.getAllTags - Response data:', response.data)
      console.log('TagService.getAllTags - Response data.data:', response.data?.data)
      
      if (!response.data) {
        console.warn('No response.data received')
        return []
      }
      
      if (!response.data.data) {
        console.warn('No data field in response.data:', response.data)
        return []
      }
      
      return response.data.data || []
    } catch (error: any) {
      console.error('TagService.getAllTags - Error:', error)
      console.error('TagService.getAllTags - Error response:', error.response)
      console.error('TagService.getAllTags - Error message:', error.message)
      console.error('TagService.getAllTags - Request URL:', error.config?.url)
      throw error
    }
  }

  static async createTag(tag: Partial<TagDTO>): Promise<TagDTO> {
    const response = await apiClient.post<ApiResponse<TagDTO>>(`${API_URL}/tags/admin/create`, tag)
    return response.data?.data as TagDTO
  }

  static async updateTag(id: number, tag: Partial<TagDTO>): Promise<TagDTO> {
    const response = await apiClient.put<ApiResponse<TagDTO>>(`${API_URL}/tags/admin/${id}`, tag)
    return response.data?.data as TagDTO
  }

  static async deleteTag(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${API_URL}/tags/admin/${id}`)
  }
}

export default TagService
