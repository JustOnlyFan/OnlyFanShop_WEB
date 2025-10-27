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
    // Always return mock data for now since backend is not available
    console.log('Using mock data for homepage')
    
    return {
      statusCode: 200,
      message: 'Success',
      data: {
        products: [
          {
            id: 1,
            productName: 'Quạt Đứng Senko SK-16',
            briefDescription: 'Quạt đứng Senko 16 inch, 3 tốc độ, điều khiển từ xa',
            price: 850000,
            imageURL: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 1, name: 'Senko' },
            category: { id: 2, name: 'Quạt đứng' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            productName: 'Quạt Trần Asia AC-56',
            briefDescription: 'Quạt trần Asia 56 inch, 5 cánh, đèn LED tích hợp',
            price: 1200000,
            imageURL: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 2, name: 'Asia' },
            category: { id: 5, name: 'Quạt trần' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 3,
            productName: 'Quạt Treo Tường Panasonic F-18',
            briefDescription: 'Quạt treo tường Panasonic 18 inch, 3 tốc độ, thiết kế hiện đại',
            price: 1800000,
            imageURL: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 3, name: 'Panasonic' },
            category: { id: 3, name: 'Quạt treo tường' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 4,
            productName: 'Quạt Bàn Mitsubishi F-12',
            briefDescription: 'Quạt bàn Mitsubishi 12 inch, 2 tốc độ, tiết kiệm điện',
            price: 650000,
            imageURL: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 4, name: 'Mitsubishi' },
            category: { id: 8, name: 'Quạt bàn' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 5,
            productName: 'Quạt Lửng Toshiba F-16',
            briefDescription: 'Quạt lửng Toshiba 16 inch, 3 tốc độ, điều khiển từ xa',
            price: 950000,
            imageURL: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 5, name: 'Toshiba' },
            category: { id: 9, name: 'Quạt lửng' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 6,
            productName: 'Quạt Đảo Trần Senko SK-52',
            briefDescription: 'Quạt đảo trần Senko 52 inch, 5 cánh, đèn LED, điều khiển từ xa',
            price: 1500000,
            imageURL: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 1, name: 'Senko' },
            category: { id: 11, name: 'Quạt đảo trần' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        categories: [
          { id: 1, name: 'Quạt điện 2 trong 1' },
          { id: 2, name: 'Quạt đứng' },
          { id: 3, name: 'Quạt treo tường' },
          { id: 4, name: 'Quạt tuần hoàn' },
          { id: 5, name: 'Quạt trần' },
          { id: 6, name: 'Quạt thông gió' },
          { id: 7, name: 'Quạt hút' },
          { id: 8, name: 'Quạt bàn' },
          { id: 9, name: 'Quạt lửng' },
          { id: 10, name: 'Quạt hộp' },
          { id: 11, name: 'Quạt đảo trần' },
          { id: 12, name: 'Quạt đứng công nghiệp' }
        ],
        brands: [
          { brandID: 1, name: 'Panasonic' },
          { brandID: 2, name: 'Mitsubishi' },
          { brandID: 3, name: 'Daikin' },
          { brandID: 4, name: 'Sharp' },
          { brandID: 5, name: 'Toshiba' },
          { brandID: 6, name: 'LG' }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalElements: 6,
          size: 8
        }
      }
    }
  }

  // Get product list with filters
  static async getProducts(params: GetHomepageParams = {}): Promise<ApiResponse<HomepageResponse>> {
    // Always return mock data for now since backend is not available
    console.log('Using mock data for products')
    
    return {
      statusCode: 200,
      message: 'Success',
      data: {
        products: [
          {
            id: 1,
            productName: 'Quạt Đứng Senko SK-16',
            briefDescription: 'Quạt đứng Senko 16 inch, 3 tốc độ, điều khiển từ xa',
            price: 850000,
            imageURL: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 1, name: 'Senko' },
            category: { id: 2, name: 'Quạt đứng' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            productName: 'Quạt Trần Asia AC-56',
            briefDescription: 'Quạt trần Asia 56 inch, 5 cánh, đèn LED tích hợp',
            price: 1200000,
            imageURL: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 2, name: 'Asia' },
            category: { id: 5, name: 'Quạt trần' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 3,
            productName: 'Quạt Treo Tường Panasonic F-18',
            briefDescription: 'Quạt treo tường Panasonic 18 inch, 3 tốc độ, thiết kế hiện đại',
            price: 1800000,
            imageURL: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 3, name: 'Panasonic' },
            category: { id: 3, name: 'Quạt treo tường' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 4,
            productName: 'Quạt Bàn Mitsubishi F-12',
            briefDescription: 'Quạt bàn Mitsubishi 12 inch, 2 tốc độ, tiết kiệm điện',
            price: 650000,
            imageURL: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 4, name: 'Mitsubishi' },
            category: { id: 8, name: 'Quạt bàn' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 5,
            productName: 'Quạt Lửng Toshiba F-16',
            briefDescription: 'Quạt lửng Toshiba 16 inch, 3 tốc độ, điều khiển từ xa',
            price: 950000,
            imageURL: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 5, name: 'Toshiba' },
            category: { id: 9, name: 'Quạt lửng' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 6,
            productName: 'Quạt Đảo Trần Senko SK-52',
            briefDescription: 'Quạt đảo trần Senko 52 inch, 5 cánh, đèn LED, điều khiển từ xa',
            price: 1500000,
            imageURL: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 1, name: 'Senko' },
            category: { id: 11, name: 'Quạt đảo trần' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 7,
            productName: 'Quạt Tuần Hoàn Asia AC-20',
            briefDescription: 'Quạt tuần hoàn Asia 20 inch, 3 tốc độ, tiết kiệm điện',
            price: 750000,
            imageURL: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 2, name: 'Asia' },
            category: { id: 4, name: 'Quạt tuần hoàn' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 8,
            productName: 'Quạt Thông Gió Panasonic F-14',
            briefDescription: 'Quạt thông gió Panasonic 14 inch, 2 tốc độ, thiết kế nhỏ gọn',
            price: 550000,
            imageURL: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 3, name: 'Panasonic' },
            category: { id: 6, name: 'Quạt thông gió' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 9,
            productName: 'Quạt Hút Mitsubishi F-10',
            briefDescription: 'Quạt hút Mitsubishi 10 inch, 1 tốc độ, tiết kiệm điện',
            price: 450000,
            imageURL: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 4, name: 'Mitsubishi' },
            category: { id: 7, name: 'Quạt hút' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 10,
            productName: 'Quạt Hộp Toshiba F-18',
            briefDescription: 'Quạt hộp Toshiba 18 inch, 3 tốc độ, thiết kế hiện đại',
            price: 1100000,
            imageURL: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format',
            brand: { brandID: 5, name: 'Toshiba' },
            category: { id: 10, name: 'Quạt hộp' },
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        categories: [
          { id: 1, name: 'Quạt điện 2 trong 1' },
          { id: 2, name: 'Quạt đứng' },
          { id: 3, name: 'Quạt treo tường' },
          { id: 4, name: 'Quạt tuần hoàn' },
          { id: 5, name: 'Quạt trần' },
          { id: 6, name: 'Quạt thông gió' },
          { id: 7, name: 'Quạt hút' },
          { id: 8, name: 'Quạt bàn' },
          { id: 9, name: 'Quạt lửng' },
          { id: 10, name: 'Quạt hộp' },
          { id: 11, name: 'Quạt đảo trần' },
          { id: 12, name: 'Quạt đứng công nghiệp' }
        ],
        brands: [
          { brandID: 1, name: 'Senko' },
          { brandID: 2, name: 'Asia' },
          { brandID: 3, name: 'Panasonic' },
          { brandID: 4, name: 'Mitsubishi' },
          { brandID: 5, name: 'Toshiba' }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalElements: 10,
          size: 12
        }
      }
    }
  }

  // Get product by ID
  static async getProductById(productId: number): Promise<ApiResponse<Product>> {
    try {
      const response = await axios.get(`${API_URL}/api/products/${productId}`)
      return response.data
    } catch (error: any) {
      console.error('Error fetching product:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch product')
    }
  }

  // Get all categories
  static async getCategories(): Promise<ApiResponse<Category[]>> {
    // Always return mock data for now since backend is not available
    console.log('Using mock data for categories')
    
    return {
      statusCode: 200,
      message: 'Success',
      data: [
        { id: 1, name: 'Quạt điện 2 trong 1' },
        { id: 2, name: 'Quạt đứng' },
        { id: 3, name: 'Quạt treo tường' },
        { id: 4, name: 'Quạt tuần hoàn' },
        { id: 5, name: 'Quạt trần' },
        { id: 6, name: 'Quạt thông gió' },
        { id: 7, name: 'Quạt hút' },
        { id: 8, name: 'Quạt bàn' },
        { id: 9, name: 'Quạt lửng' },
        { id: 10, name: 'Quạt hộp' },
        { id: 11, name: 'Quạt đảo trần' },
        { id: 12, name: 'Quạt đứng công nghiệp' }
      ]
    }
  }

  // Get all brands
  static async getBrands(): Promise<ApiResponse<Brand[]>> {
    // Always return mock data for now since backend is not available
    console.log('Using mock data for brands')
    
    return {
      statusCode: 200,
      message: 'Success',
      data: [
        { brandID: 1, name: 'Senko' },
        { brandID: 2, name: 'Asia' },
        { brandID: 3, name: 'Panasonic' },
        { brandID: 4, name: 'Mitsubishi' },
        { brandID: 5, name: 'Toshiba' }
      ]
    }
  }
}