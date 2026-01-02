import axios from 'axios'

import { Product, ProductDetail, Brand, Category, ApiResponse, HomepageResponse } from '@/types'

// Use relative URL - Next.js rewrites will proxy to backend in dev, and in production should use same domain or reverse proxy
const API_URL = ''

export interface ProductFullDetails {
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

export interface GetHomepageParams {
  keyword?: string
  categoryId?: number
  brandId?: number
  minPrice?: number
  maxPrice?: number
  bladeCount?: number
  remoteControl?: boolean
  oscillation?: boolean
  timer?: boolean
  minPower?: number
  maxPower?: number
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
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          bladeCount: params.bladeCount,
          remoteControl: params.remoteControl,
          oscillation: params.oscillation,
          timer: params.timer,
          minPower: params.minPower,
          maxPower: params.maxPower,
          page: params.page ?? 1,
          size: params.size ?? 12,
          sortBy: params.sortBy ?? 'id',
          order: params.order ?? 'DESC'
        }
      })
      
      // Ensure response has the correct structure
      if (response.data && response.data.data) {
        return response.data;
      } else if (response.data) {
        // If data is directly in response, wrap it
        return {
          statusCode: 200,
          message: 'Success',
          data: response.data,
          dateTime: new Date().toISOString()
        };
      }
      
      throw new Error('Invalid response format from homepage API');
    } catch (error: any) {
      console.error('Error fetching homepage data:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to load homepage products')
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
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          bladeCount: params.bladeCount,
          remoteControl: params.remoteControl,
          oscillation: params.oscillation,
          timer: params.timer,
          minPower: params.minPower,
          maxPower: params.maxPower,
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
  static async getProductById(productId: number): Promise<ApiResponse<ProductDetail>> {
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
      return { statusCode: 200, message: 'Success', data: mapped, dateTime: new Date().toISOString() }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load categories')
    }
  }

  // Get all brands
  static async getBrands(): Promise<ApiResponse<Brand[]>> {
    try {
      const response = await axios.get(`${API_URL}/brands/public`)
      console.log('Brands API raw response:', response.data);
      const raw = response.data as any[];
      const mapped: Brand[] = (raw || []).map((b: any) => ({
        brandID: b.brandID ?? b.id ?? b.brand_id,
        name: b.name ?? b.brandName,
        imageURL: b.imageURL ?? b.logoUrl ?? b.logo_url ?? b.image
      }));
      console.log('Brands mapped:', mapped);
      return { statusCode: 200, message: 'Success', data: mapped, dateTime: new Date().toISOString() }
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      throw new Error(error.response?.data?.message || 'Failed to load brands')
    }
  }
}
