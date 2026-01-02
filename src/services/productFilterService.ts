import { apiClient } from '@/lib/api'
import { ApiResponse, Product, ProductFilterRequest } from '@/types'

// Use relative URL - Next.js rewrites will proxy to backend in dev, and in production should use same domain or reverse proxy
const API_URL = ''

/**
 * Response type for paginated product filter results.
 */
export interface ProductFilterResponse {
  products: Product[]
  currentPage: number
  totalItems: number
  totalPages: number
  pageSize: number
}

/**
 * Options for product filtering with pagination and sorting.
 */
export interface ProductFilterOptions {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

/**
 * Service for advanced product filtering.
 * Provides methods for filtering products by multiple criteria including
 * categories, brands, price range, tags, and accessory compatibility.
 * 
 * Requirements: 4.1, 5.1, 6.1, 7.1, 8.4
 */
class ProductFilterService {
  /**
   * Filter products with multiple criteria.
   * All filters are combined using AND logic.
   * Requirements: 4.1, 5.1, 6.1, 7.1, 8.4
   * 
   * @param request the filter request containing all criteria
   * @param options pagination and sorting options
   * @returns paginated list of products matching all criteria
   */
  static async filterProducts(
    request: ProductFilterRequest,
    options: ProductFilterOptions = {}
  ): Promise<ProductFilterResponse> {
    const { page = 0, size = 10, sortBy = 'id', sortDirection = 'DESC' } = options
    
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDirection
    })
    
    const response = await apiClient.post<ApiResponse<ProductFilterResponse>>(
      `${API_URL}/products/filter/public?${params.toString()}`,
      request
    )
    
    return response.data?.data || {
      products: [],
      currentPage: 0,
      totalItems: 0,
      totalPages: 0,
      pageSize: size
    }
  }

  /**
   * Get products by category with optional subcategory inclusion.
   * Requirements: 4.1 - Category query completeness
   * 
   * @param categoryId the category ID
   * @param includeSubcategories whether to include products from subcategories
   * @returns list of products in the category
   */
  static async getProductsByCategory(
    categoryId: number,
    includeSubcategories: boolean = true
  ): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${API_URL}/products/filter/public/category/${categoryId}?includeSubcategories=${includeSubcategories}`
    )
    return response.data?.data || []
  }

  /**
   * Get products by price range.
   * Requirements: 7.1 - Price range filter
   * 
   * @param minPrice minimum price (inclusive)
   * @param maxPrice maximum price (inclusive)
   * @returns list of products within the price range
   */
  static async getProductsByPriceRange(
    minPrice?: number,
    maxPrice?: number
  ): Promise<Product[]> {
    const params = new URLSearchParams()
    if (minPrice !== undefined) params.append('minPrice', minPrice.toString())
    if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString())
    
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${API_URL}/products/filter/public/price-range?${params.toString()}`
    )
    return response.data?.data || []
  }

  /**
   * Get accessories compatible with a specific fan type.
   * Requirements: 8.4 - Accessory compatibility filter
   * 
   * @param fanTypeId the fan type category ID
   * @returns list of accessory products compatible with the fan type
   */
  static async getAccessoriesByCompatibleFanType(fanTypeId: number): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${API_URL}/products/filter/public/accessories/compatible/${fanTypeId}`
    )
    return response.data?.data || []
  }

  /**
   * Get all category IDs including descendants for a given category.
   * Useful for understanding category hierarchy in filtering.
   * 
   * @param categoryId the root category ID
   * @returns list of all descendant category IDs
   */
  static async getCategoryDescendants(categoryId: number): Promise<number[]> {
    const response = await apiClient.get<ApiResponse<number[]>>(
      `${API_URL}/products/filter/public/category/${categoryId}/descendants`
    )
    return response.data?.data || []
  }

  // ==================== HELPER METHODS ====================

  /**
   * Build a filter request with common defaults.
   * 
   * @param overrides partial filter request to merge with defaults
   * @returns complete filter request
   */
  static buildFilterRequest(overrides: Partial<ProductFilterRequest> = {}): ProductFilterRequest {
    return {
      categoryIds: [],
      categoryTypes: [],
      brandIds: [],
      tagCodes: [],
      includeSubcategories: true,
      sortBy: 'id',
      sortDirection: 'DESC',
      ...overrides
    }
  }

  /**
   * Filter products by a single category.
   * Convenience method for simple category filtering.
   * 
   * @param categoryId the category ID
   * @param options pagination and sorting options
   * @returns paginated list of products
   */
  static async filterByCategory(
    categoryId: number,
    options: ProductFilterOptions = {}
  ): Promise<ProductFilterResponse> {
    return this.filterProducts(
      this.buildFilterRequest({ categoryIds: [categoryId], includeSubcategories: true }),
      options
    )
  }

  /**
   * Filter products by brand.
   * Convenience method for simple brand filtering.
   * 
   * @param brandId the brand ID
   * @param options pagination and sorting options
   * @returns paginated list of products
   */
  static async filterByBrand(
    brandId: number,
    options: ProductFilterOptions = {}
  ): Promise<ProductFilterResponse> {
    return this.filterProducts(
      this.buildFilterRequest({ brandIds: [brandId] }),
      options
    )
  }

  /**
   * Filter products by price range.
   * Convenience method for simple price filtering.
   * 
   * @param minPrice minimum price
   * @param maxPrice maximum price
   * @param options pagination and sorting options
   * @returns paginated list of products
   */
  static async filterByPriceRange(
    minPrice: number,
    maxPrice: number,
    options: ProductFilterOptions = {}
  ): Promise<ProductFilterResponse> {
    return this.filterProducts(
      this.buildFilterRequest({ minPrice, maxPrice }),
      options
    )
  }

  /**
   * Filter products by tags.
   * Convenience method for simple tag filtering.
   * 
   * @param tagCodes array of tag codes
   * @param options pagination and sorting options
   * @returns paginated list of products
   */
  static async filterByTags(
    tagCodes: string[],
    options: ProductFilterOptions = {}
  ): Promise<ProductFilterResponse> {
    return this.filterProducts(
      this.buildFilterRequest({ tagCodes }),
      options
    )
  }

  /**
   * Search products by query string.
   * Convenience method for text search.
   * 
   * @param query search query
   * @param options pagination and sorting options
   * @returns paginated list of products
   */
  static async searchProducts(
    query: string,
    options: ProductFilterOptions = {}
  ): Promise<ProductFilterResponse> {
    return this.filterProducts(
      this.buildFilterRequest({ searchQuery: query }),
      options
    )
  }
}

export default ProductFilterService
