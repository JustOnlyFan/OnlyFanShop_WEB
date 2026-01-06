import { apiClient } from '@/lib/api'
import { ApiResponse, Product, ProductFilterRequest } from '@/types'

const API_URL = ''

export interface ProductFilterResponse {
  products: Product[]
  currentPage: number
  totalItems: number
  totalPages: number
  pageSize: number
}

export interface ProductFilterOptions {
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

class ProductFilterService {

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

  static async getProductsByCategory(
    categoryId: number,
    includeSubcategories: boolean = true
  ): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${API_URL}/products/filter/public/category/${categoryId}?includeSubcategories=${includeSubcategories}`
    )
    return response.data?.data || []
  }

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

  static async getAccessoriesByCompatibleFanType(fanTypeId: number): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      `${API_URL}/products/filter/public/accessories/compatible/${fanTypeId}`
    )
    return response.data?.data || []
  }

  static async getCategoryDescendants(categoryId: number): Promise<number[]> {
    const response = await apiClient.get<ApiResponse<number[]>>(
      `${API_URL}/products/filter/public/category/${categoryId}/descendants`
    )
    return response.data?.data || []
  }

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

  static async filterByCategory(
    categoryId: number,
    options: ProductFilterOptions = {}
  ): Promise<ProductFilterResponse> {
    return this.filterProducts(
      this.buildFilterRequest({ categoryIds: [categoryId], includeSubcategories: true }),
      options
    )
  }

  static async filterByBrand(
    brandId: number,
    options: ProductFilterOptions = {}
  ): Promise<ProductFilterResponse> {
    return this.filterProducts(
      this.buildFilterRequest({ brandIds: [brandId] }),
      options
    )
  }

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

  static async filterByTags(
    tagCodes: string[],
    options: ProductFilterOptions = {}
  ): Promise<ProductFilterResponse> {
    return this.filterProducts(
      this.buildFilterRequest({ tagCodes }),
      options
    )
  }

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
