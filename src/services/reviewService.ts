import axios from 'axios'
import { tokenStorage } from '@/utils/tokenStorage'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface ProductReview {
  id: number
  productId: number
  userId: number
  rating: number // 1-5
  title?: string
  content?: string
  imagesJson?: string
  images?: string[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  approvedAt?: string
  user?: {
    userID: number
    username: string
    email: string
  }
}

export interface CreateReviewRequest {
  productId: number
  rating: number
  title?: string
  content?: string
  images?: string[]
}

export interface ReviewResponse {
  reviews: ProductReview[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
  averageRating: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class ReviewService {
  private static getAuthHeaders() {
    const token = tokenStorage.getAccessToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  // Get reviews for a product
  static async getProductReviews(
    productId: number,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<ReviewResponse>> {
    try {
      const response = await axios.get(
        `${API_URL}/api/reviews/product/${productId}?page=${page}&size=${size}`,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get product reviews')
    }
  }

  // Create a review
  static async createReview(reviewData: CreateReviewRequest): Promise<ApiResponse<ProductReview>> {
    try {
      const response = await axios.post(
        `${API_URL}/api/reviews`,
        reviewData,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create review')
    }
  }

  // Update a review
  static async updateReview(
    reviewId: number,
    reviewData: Partial<CreateReviewRequest>
  ): Promise<ApiResponse<ProductReview>> {
    try {
      const response = await axios.put(
        `${API_URL}/api/reviews/${reviewId}`,
        reviewData,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update review')
    }
  }

  // Delete a review
  static async deleteReview(reviewId: number): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(
        `${API_URL}/api/reviews/${reviewId}`,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete review')
    }
  }

  // Get user's review for a product
  static async getUserReview(productId: number): Promise<ApiResponse<ProductReview | null>> {
    try {
      const response = await axios.get(
        `${API_URL}/api/reviews/product/${productId}/user`,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { statusCode: 200, message: 'No review found', data: null }
      }
      throw new Error(error.response?.data?.message || 'Failed to get user review')
    }
  }

  // Upload review image
  static async uploadReviewImage(file: File): Promise<ApiResponse<string>> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = tokenStorage.getAccessToken()
      const headers: Record<string, string> = {
        'Content-Type': 'multipart/form-data'
      }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await axios.post(
        `${API_URL}/api/upload/review-image`,
        formData,
        { headers }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload review image')
    }
  }

  // Format review date
  static formatReviewDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? 'Vừa xong' : `${diffInMinutes} phút trước`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} ngày trước`
    } else {
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }

  // Parse images from JSON
  static parseReviewImages(imagesJson?: string): string[] {
    if (!imagesJson) return []
    try {
      const parsed = JSON.parse(imagesJson)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
}





