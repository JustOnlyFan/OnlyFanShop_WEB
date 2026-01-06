import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'
import { Product } from '@/types'
import { CartService } from '@/services/cartService'
import { useAuthStore } from './authStore'

interface CartState {
  items: CartItem[]
  totalPrice: number
  totalItems: number
  isLoading: boolean
  error: string | null
}

interface CartActions {
  addItem: (product: Product, quantity: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  loadCart: (userId: number) => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  getSmartAnalysis: () => Promise<void>
  getOptimizationSuggestions: () => Promise<any>
}

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      totalPrice: 0,
      totalItems: 0,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      addItem: async (product, quantity) => {
        set({ isLoading: true, error: null })
        try {
          const { user } = useAuthStore.getState()
          if (!user) {
            set({ 
              isLoading: false, 
              error: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng' 
            })
            return
          }

          // Get productId from either id or productID field
          const productId = product.id || (product as any).productID
          if (!productId) {
            throw new Error('Không tìm thấy ID sản phẩm')
          }

          await CartService.addToCart({
            productId: Number(productId),
            quantity: Number(quantity) || 1,
            userName: user.username || user.email
          })

          // Reload cart after adding item
          await get().loadCart(user.userID)
        } catch (error: any) {
          console.error('Error adding to cart:', error)
          set({ 
            isLoading: false, 
            error: error.message || 'Không thể thêm sản phẩm vào giỏ hàng' 
          })
        }
      },

      removeItem: async (productId) => {
        set({ isLoading: true, error: null })
        try {
          const { user } = useAuthStore.getState()
          if (!user) {
            throw new Error('Vui lòng đăng nhập')
          }

          await CartService.removeItem(user.username, productId)
          
          // Reload cart after removing item
          await get().loadCart(user.userID)
        } catch (error: any) {
          set({ 
            error: error.message || 'Xóa sản phẩm khỏi giỏ hàng thất bại', 
            isLoading: false 
          })
          throw error
        }
      },

      updateQuantity: async (productId, quantity) => {
        set({ isLoading: true, error: null })
        try {
          const { user } = useAuthStore.getState()
          if (!user) {
            throw new Error('Vui lòng đăng nhập')
          }

          await CartService.updateQuantity(user.username, productId, quantity)
          
          // Reload cart after updating quantity
          await get().loadCart(user.userID)
        } catch (error: any) {
          set({ 
            error: error.message || 'Cập nhật số lượng sản phẩm thất bại', 
            isLoading: false 
          })
          throw error
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null })
        try {
          const { user } = useAuthStore.getState()
          if (!user) {
            throw new Error('Vui lòng đăng nhập')
          }

          await CartService.clearCart(user.username)
          set({ 
            items: [], 
            totalPrice: 0, 
            totalItems: 0, 
            isLoading: false 
          })
        } catch (error: any) {
          set({ 
            error: error.message || 'Xóa giỏ hàng thất bại', 
            isLoading: false 
          })
          throw error
        }
      },

      loadCart: async (userId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await CartService.getCartByUserId(userId)
          
          if (response.statusCode === 200 && response.data) {
            const items = (response.data.items || []) as any[]
            // totalItems = số lượng loại sản phẩm (số items), không phải tổng quantity
            const totalItems = items.length
            const totalPrice = items.reduce((sum, it: any) => {
              const price = Number(it.price ?? 0)
              const quantity = Number(it.quantity ?? 1)
              return sum + price * quantity
            }, 0)
            
            set({ 
              items, 
              totalPrice, 
              totalItems, 
              isLoading: false 
            })
          } else {
            set({ 
              items: [], 
              totalPrice: 0, 
              totalItems: 0, 
              isLoading: false 
            })
          }
        } catch (error: any) {
          // If backend says cart not found, just clear local cart silently
          set({ items: [], totalPrice: 0, totalItems: 0, isLoading: false })
        }
      },

      getSmartAnalysis: async () => {
        // Placeholder for smart analysis feature
      },

      getOptimizationSuggestions: async () => {
        // Placeholder for optimization suggestions feature
        return null
      },

    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        totalPrice: state.totalPrice, 
        totalItems: state.totalItems 
      }),
    }
  )
)
