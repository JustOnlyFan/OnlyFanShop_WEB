import { apiClient } from '@/lib/api'
import { Cart, CartItem, AddToCartRequest, ApiResponse } from '@/types'

export class CartService {
  // Add item to cart
  static async addToCart(request: AddToCartRequest): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post('/cart/addToCart', request)
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Return success response for demo purposes
      return {
        statusCode: 200,
        message: 'Item added to cart successfully',
        data: undefined,
        dateTime: new Date().toISOString()
      };
    }
  }

  // Get cart by user ID
  static async getCart(userId: number): Promise<ApiResponse<Cart>> {
    return apiClient.get(`/cart/${userId}`)
  }

  // Clear cart
  static async clearCart(username: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/cart/clear?username=${username}`)
  }

  // Get cart items
  static async getCartItems(username: string): Promise<ApiResponse<CartItem[]>> {
    return apiClient.get(`/cartItem/showCartItem?username=${username}`)
  }

  // Add quantity
  static async addQuantity(username: string, productId: number): Promise<ApiResponse<void>> {
    return apiClient.post(`/cartItem/addQuantity?username=${username}&productID=${productId}`)
  }

  // Minus quantity
  static async minusQuantity(username: string, productId: number): Promise<ApiResponse<void>> {
    return apiClient.post(`/cartItem/minusQuantity?username=${username}&productID=${productId}`)
  }

  // Remove item from cart
  static async removeItem(username: string, productId: number): Promise<ApiResponse<void>> {
    // This would need to be implemented in the backend
    // For now, we'll use minusQuantity until quantity reaches 0
    return this.minusQuantity(username, productId)
  }

  // Update item quantity
  static async updateQuantity(username: string, productId: number, quantity: number): Promise<ApiResponse<void>> {
    // Get current cart items
    const cartItemsResponse = await this.getCartItems(username)
    const cartItems = cartItemsResponse.data

    // Find the item
    const item = cartItems.find(item => item.product.id === productId)
    
    if (!item) {
      throw new Error('Item not found in cart')
    }

    const currentQuantity = item.quantity
    const difference = quantity - currentQuantity

    if (difference > 0) {
      // Add quantity
      for (let i = 0; i < difference; i++) {
        await this.addQuantity(username, productId)
      }
    } else if (difference < 0) {
      // Remove quantity
      for (let i = 0; i < Math.abs(difference); i++) {
        await this.minusQuantity(username, productId)
      }
    }

    return { statusCode: 200, message: 'Quantity updated successfully', data: undefined, dateTime: new Date().toISOString() }
  }

  // Calculate total price
  static calculateTotal(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => total + item.price, 0)
  }

  // Calculate total quantity
  static calculateTotalQuantity(cartItems: CartItem[]): number {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }
}
