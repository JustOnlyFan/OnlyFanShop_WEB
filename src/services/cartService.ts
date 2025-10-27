import axios from 'axios'
import { Product } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface CartItem {
  id: number
  product: Product
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
}

export interface CartResponse {
  id: number
  userId: number
  items: CartItem[]
  totalItems: number
  totalPrice: number
  createdAt: string
  updatedAt: string
}

export interface AddToCartRequest {
  productId: number
  quantity: number
}

export interface UpdateCartItemRequest {
  cartItemId: number
  quantity: number
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class CartService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Get user's cart
  static async getCart(): Promise<ApiResponse<CartResponse>> {
    try {
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get cart')
    }
  }

  // Add item to cart
  static async addToCart(productId: number, quantity: number = 1): Promise<ApiResponse<CartResponse>> {
    try {
      const response = await axios.post(`${API_URL}/api/cart/items`, 
        { productId, quantity },
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add item to cart')
    }
  }

  // Update cart item quantity
  static async updateCartItem(cartItemId: number, quantity: number): Promise<ApiResponse<CartResponse>> {
    try {
      const response = await axios.put(`${API_URL}/api/cart/items/${cartItemId}`, 
        { quantity },
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update cart item')
    }
  }

  // Remove item from cart
  static async removeFromCart(cartItemId: number): Promise<ApiResponse<CartResponse>> {
    try {
      const response = await axios.delete(`${API_URL}/api/cart/items/${cartItemId}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to remove item from cart')
    }
  }

  // Clear entire cart
  static async clearCart(): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(`${API_URL}/api/cart`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart')
    }
  }

  // Get cart item count
  static async getCartItemCount(): Promise<number> {
    try {
      const cart = await this.getCart()
      return cart.data.totalItems || 0
    } catch {
      return 0
    }
  }

  // Check if product is in cart
  static async isProductInCart(productId: number): Promise<boolean> {
    try {
      const cart = await this.getCart()
      return cart.data.items.some(item => item.product.id === productId)
    } catch {
      return false
    }
  }

  // Get cart item by product ID
  static async getCartItemByProduct(productId: number): Promise<CartItem | null> {
    try {
      const cart = await this.getCart()
      return cart.data.items.find(item => item.product.id === productId) || null
    } catch {
      return null
    }
  }

  // Calculate cart totals
  static calculateTotals(items: CartItem[]): { totalItems: number, totalPrice: number } {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    return { totalItems, totalPrice }
  }

  // Validate cart before checkout
  static validateCart(cart: CartResponse): { isValid: boolean, errors: string[] } {
    const errors: string[] = []
    
    if (!cart.items || cart.items.length === 0) {
      errors.push('Cart is empty')
    }
    
    cart.items.forEach((item, index) => {
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Invalid quantity`)
      }
      if (item.product.stock < item.quantity) {
        errors.push(`Item ${index + 1}: Insufficient stock (${item.product.stock} available)`)
      }
      if (!item.product.isActive) {
        errors.push(`Item ${index + 1}: Product is no longer available`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}