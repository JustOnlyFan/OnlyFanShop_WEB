import { apiClient } from '@/lib/api'
import { ApiResponse, CategoryDTO, CategoryType, Category } from '@/types'

// Use relative URL - Next.js rewrites will proxy to backend in dev, and in production should use same domain or reverse proxy
const API_URL = ''

/**
 * Service for managing categories with the expanded category system.
 * Provides methods for category CRUD operations by type and category tree retrieval.
 * 
 * Requirements: 1.1, 4.1
 */
class CategoryService {
  // ==================== PUBLIC ENDPOINTS ====================

  /**
   * Get all categories (legacy endpoint for backward compatibility).
   */
  static async getAllCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(`${API_URL}/category/public`)
    return response.data
  }

  /**
   * Get categories by type.
   * Requirements: 1.1 - Category type filtering
   * 
   * @param type the category type to filter by
   * @returns list of categories with the specified type
   */
  static async getCategoriesByType(type: CategoryType): Promise<CategoryDTO[]> {
    const response = await apiClient.get<ApiResponse<CategoryDTO[]>>(`${API_URL}/category/public/type/${type}`)
    return response.data?.data || []
  }

  /**
   * Get category tree by type (hierarchical structure).
   * Requirements: 1.3 - Tree structure with up to 3 levels
   * 
   * @param type the category type to filter by
   * @returns list of root categories with their children hierarchy
   */
  static async getCategoryTree(type: CategoryType): Promise<CategoryDTO[]> {
    const response = await apiClient.get<ApiResponse<CategoryDTO[]>>(`${API_URL}/category/public/tree/${type}`)
    return response.data?.data || []
  }

  /**
   * Get all available category types.
   * 
   * @returns list of all category types
   */
  static async getAllCategoryTypes(): Promise<CategoryType[]> {
    const response = await apiClient.get<ApiResponse<CategoryType[]>>(`${API_URL}/category/public/types`)
    return response.data?.data || []
  }

  /**
   * Get child categories by parent ID.
   * Requirements: 1.2 - Parent-child relationship
   * 
   * @param parentId the parent category ID
   * @returns list of child categories
   */
  static async getChildCategories(parentId: number): Promise<CategoryDTO[]> {
    const response = await apiClient.get<ApiResponse<CategoryDTO[]>>(`${API_URL}/category/public/children/${parentId}`)
    return response.data?.data || []
  }

  /**
   * Get category by ID.
   * 
   * @param id the category ID
   * @returns the category
   */
  static async getCategoryById(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`${API_URL}/category/${id}`)
    return response.data
  }

  /**
   * Get category by ID as DTO.
   * 
   * @param id the category ID
   * @returns the category DTO
   */
  static async getCategoryDTOById(id: number): Promise<CategoryDTO> {
    const response = await apiClient.get<ApiResponse<CategoryDTO>>(`${API_URL}/category/public/dto/${id}`)
    return response.data?.data as CategoryDTO
  }

  /**
   * Get category depth in hierarchy.
   * Requirements: 1.3 - Hierarchy depth validation
   * 
   * @param id the category ID
   * @returns the depth level of the category
   */
  static async getCategoryDepth(id: number): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>(`${API_URL}/category/${id}/depth`)
    return response.data?.data || 0
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Create a category with full validation (type, parent-child consistency, depth).
   * Requirements: 1.1, 1.2, 1.3, 1.4
   * 
   * @param category the category data to create
   * @returns the created category
   */
  static async createCategory(category: Partial<CategoryDTO>): Promise<CategoryDTO> {
    const response = await apiClient.post<ApiResponse<CategoryDTO>>(`${API_URL}/category/admin/create`, category)
    return response.data?.data as CategoryDTO
  }

  /**
   * Update a category with full validation.
   * Requirements: 1.4 - Slug auto-generation on name update
   * 
   * @param id the category ID
   * @param category the updated category data
   * @returns the updated category
   */
  static async updateCategory(id: number, category: Partial<CategoryDTO>): Promise<CategoryDTO> {
    const response = await apiClient.put<ApiResponse<CategoryDTO>>(`${API_URL}/category/admin/${id}`, category)
    return response.data?.data as CategoryDTO
  }

  /**
   * Delete a category with children check.
   * Requirements: 1.5 - Prevent deletion of categories with children
   * 
   * @param id the category ID to delete
   */
  static async deleteCategory(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${API_URL}/category/admin/${id}`)
  }

  /**
   * Toggle category active status (legacy endpoint).
   * 
   * @param id the category ID
   * @param active the new active status
   * @returns the updated category
   */
  static async toggleActive(id: number, active: boolean): Promise<Category> {
    const response = await apiClient.put<Category>(`${API_URL}/category/switchActive/${id}?active=${active}`)
    return response.data
  }

  // ==================== LEGACY ENDPOINTS (Backward Compatibility) ====================

  /**
   * Create category using legacy endpoint.
   * 
   * @param category the category data
   * @returns the created category
   */
  static async createCategoryLegacy(category: { name: string; description?: string; parentId?: number }): Promise<Category> {
    const response = await apiClient.post<Category>(`${API_URL}/category/create`, category)
    return response.data
  }

  /**
   * Update category using legacy endpoint.
   * 
   * @param id the category ID
   * @param category the updated category data
   * @returns the updated category
   */
  static async updateCategoryLegacy(id: number, category: { name?: string; description?: string; parentId?: number }): Promise<Category> {
    const response = await apiClient.put<Category>(`${API_URL}/category/${id}`, category)
    return response.data
  }

  /**
   * Delete category using legacy endpoint.
   * 
   * @param id the category ID
   */
  static async deleteCategoryLegacy(id: number): Promise<void> {
    await apiClient.delete<void>(`${API_URL}/category/delete/${id}`)
  }
}

export default CategoryService
