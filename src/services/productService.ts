import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
const PROXY_URL = '/api/proxy'

export interface Product {
  id: number
  productName: string
  briefDescription: string
  fullDescription?: string
  technicalSpecifications?: string
  price: number
  imageURL: string
  brand?: {
    brandID: number
    name: string
  }
  category?: {
    id: number
    name: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface Brand {
  brandID: number
  name: string
  description?: string
}

export interface HomepageResponse {
  products: Product[]
  categories: Category[]
  brands: Brand[]
  pagination: {
    currentPage: number
    totalPages: number
    totalElements: number
    size: number
  }
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export interface GetHomepageParams {
  keyword?: string
  categoryId?: number
  brandId?: number
  page?: number
  size?: number
  sortBy?: string
  order?: string
}

export class ProductService {
  // Get homepage data with products, categories, and brands
  static async getHomepage(params: GetHomepageParams = {}): Promise<ApiResponse<HomepageResponse>> {
    try {
      const response = await axios.post(`${API_URL}/product/public/homepage`, null, {
        params: {
          keyword: params.keyword,
          categoryId: params.categoryId,
          brandId: params.brandId,
          page: params.page ?? 1,
          size: params.size ?? 12,
          sortBy: params.sortBy ?? 'ProductID',
          order: params.order ?? 'DESC'
        }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load homepage products')
    }
  }

  // Get product list with filters
  static async getProducts(params: GetHomepageParams = {}): Promise<ApiResponse<HomepageResponse>> {
    try {
      const response = await axios.post(`${API_URL}/product/public/homepage`, null, {
        params: {
          keyword: params.keyword,
          categoryId: params.categoryId,
          brandId: params.brandId,
          page: params.page ?? 1,
          size: params.size ?? 12,
          sortBy: params.sortBy ?? 'ProductID',
          order: params.order ?? 'DESC'
        }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load products')
    }
  }

  // Get product by ID
  static async getProductById(productId: number): Promise<ApiResponse<Product>> {
    try {
      const response = await axios.get(`${API_URL}/product/public/detail/${productId}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching product:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch product')
    }
  }

  // Get all categories
  static async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await axios.get(`${API_URL}/category/public`)
      const raw = response.data as any[]
      const mapped: Category[] = (raw || []).map((c: any) => ({
        id: c.id ?? c.categoryID,
        name: c.name ?? c.categoryName
      }))
      return { statusCode: 200, message: 'Success', data: mapped }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load categories')
    }
  }

  // Get all brands
  static async getBrands(): Promise<ApiResponse<Brand[]>> {
    try {
      const response = await axios.get(`${API_URL}/brands/public`)
      return { statusCode: 200, message: 'Success', data: response.data as any }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load brands')
    }
  }
}