import { apiClient } from '@/lib/api'
import { 
  Product, 
  ProductDetail, 
  HomepageResponse, 
  Brand, 
  Category, 
  ApiResponse 
} from '@/types'

export class ProductService {
  // Get homepage data
  static async getHomepage(params: {
    keyword?: string
    categoryId?: number
    brandId?: number
    page?: number
    size?: number
    sortBy?: string
    order?: string
  } = {}): Promise<ApiResponse<HomepageResponse>> {
    // Sử dụng POST request với body thay vì GET với query params
    return apiClient.post('/product/public/homepage', {
      keyword: params.keyword || '',
      categoryId: params.categoryId || null,
      brandId: params.brandId || null,
      page: params.page || 0,
      size: params.size || 12,
      sortBy: params.sortBy || 'productID',
      order: params.order || 'DESC'
    })
  }

  // Get product detail
  static async getProductDetail(productId: number): Promise<ApiResponse<ProductDetail>> {
    return apiClient.get(`/product/public/detail/${productId}`)
  }

  // Get all products (admin)
  static async getAllProducts(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>('/product')
    return response.data
  }

  // Get product by ID (admin)
  static async getProductById(id: number): Promise<ProductDetail> {
    const response = await apiClient.get<ProductDetail>(`/product/${id}`)
    return response.data
  }

  // Create product (admin)
  static async createProduct(productData: {
    productName: string
    briefDescription: string
    fullDescription: string
    technicalSpecifications: string
    price: number
    imageURL: string
    categoryID: number
    brandID: number
  }): Promise<Product> {
    const response = await apiClient.post<Product>('/product', productData)
    return response.data
  }

  // Update product (admin)
  static async updateProduct(id: number, productData: {
    productName: string
    briefDescription: string
    fullDescription: string
    technicalSpecifications: string
    price: number
    imageURL: string
    categoryID: number
    brandID: number
  }): Promise<ProductDetail> {
    const response = await apiClient.put<ProductDetail>(`/product/${id}`, productData)
    return response.data
  }

  // Delete product (admin)
  static async deleteProduct(id: number): Promise<string> {
    const response = await apiClient.delete<string>(`/product/${id}`)
    return response.data
  }

  // Get all categories
  static async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/category/public')
    return response.data
  }

  // Get all brands
  static async getBrands(): Promise<Brand[]> {
    const response = await apiClient.get<Brand[]>('/brands/public')
    return response.data
  }

  // Search products
  static async searchProducts(query: string, filters?: {
    categoryId?: number
    brandId?: number
    minPrice?: number
    maxPrice?: number
    page?: number
    size?: number
    sortBy?: string
    order?: string
  }): Promise<ApiResponse<HomepageResponse>> {
    const params = {
      keyword: query,
      ...filters,
    }
    return this.getHomepage(params)
  }
}
