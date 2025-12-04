import axios from 'axios'
import { Product } from '@/types'
import { tokenStorage } from '@/utils/tokenStorage'

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
    const token = tokenStorage.getAccessToken()
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Get user's cart (legacy generic endpoint)
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

  // Get user's cart (BE current contract)
  static async getCartByUserId(userId: number): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${API_URL}/cart/${userId}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get cart')
    }
  }

  // Add item to cart (supports new BE AddToCartRequest)
  static async addToCart(requestOrProductId: any, quantity?: number): Promise<ApiResponse<any>> {
    try {
      if (typeof requestOrProductId === 'object') {
        const response = await axios.post(`${API_URL}/cart/addToCart`, requestOrProductId, {
          headers: this.getAuthHeaders()
        })
        return response.data
      } else {
        const response = await axios.post(`${API_URL}/api/cart/items`, 
          { productId: requestOrProductId, quantity: quantity ?? 1 },
          { headers: this.getAuthHeaders() }
        )
        return response.data
      }
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

  // New: Update quantity by username + productId using BE endpoints
  static async updateQuantity(username: string, productId: number, quantity: number): Promise<void> {
    // Find current quantity
    const items = await this.showCartItems(username)
    const item = items.find(i => (i as any).product?.productID === productId || (i as any).product?.id === productId)
    const currentQty = item ? (item as any).quantity : 0
    const delta = quantity - currentQty
    if (delta === 0) return
    const path = delta > 0 ? 'addQuantity' : 'minusQuantity'
    const times = Math.abs(delta)
    for (let i = 0; i < times; i++) {
      await axios.post(`${API_URL}/cartItem/${path}`, null, {
        params: { username, productID: productId },
        headers: this.getAuthHeaders()
      })
    }
  }

  // Remove item from cart by username + productId (using minusQuantity until zero)
  static async removeItem(username: string, productId: number): Promise<void> {
    const items = await this.showCartItems(username)
    const item = items.find(i => (i as any).product?.productID === productId || (i as any).product?.id === productId)
    const qty = item ? (item as any).quantity : 0
    for (let i = 0; i < qty; i++) {
      await axios.post(`${API_URL}/cartItem/minusQuantity`, null, {
        params: { username, productID: productId },
        headers: this.getAuthHeaders()
      })
    }
  }

  // Clear entire cart (BE current contract)
  static async clearCart(username: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.post(`${API_URL}/cart/clear`, null, {
        params: { username },
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

  // Helpers for BE current endpoints
  static async showCartItems(username: string): Promise<any[]> {
    const response = await axios.get(`${API_URL}/cartItem/showCartItem`, {
      params: { username },
      headers: this.getAuthHeaders()
    })
    return response.data.data || []
  }

  static calculateTotalQuantity(items: any[]): number {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0)
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
      // Stock check removed - Product type doesn't have stock property
      // if (item.product.stock < item.quantity) {
      //   errors.push(`Item ${index + 1}: Insufficient stock (${item.product.stock} available)`)
      // }
      if (item.product.active === false) {
        errors.push(`Item ${index + 1}: Product is no longer available`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}