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
            // For demo purposes, add to local cart even without user
            const existingItem = get().items.find(item => item.product.id === product.id)
            if (existingItem) {
              set({
                items: get().items.map(item =>
                  item.product.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                ),
                totalItems: get().totalItems + quantity,
                totalPrice: get().totalPrice + (product.price * quantity),
                isLoading: false
              })
            } else {
            const newItem = {
              cartItemID: Date.now(),
              product,
              quantity,
              price: product.price,
              cart: {
                cartID: 1,
                totalPrice: 0,
                status: 'ACTIVE',
                user: {
                  userID: 1,
                  username: 'demo_user',
                  email: 'demo@example.com',
                  role: 'CUSTOMER' as const,
                  authProvider: 'LOCAL' as const
                },
                cartItems: []
              }
            }
              set({
                items: [...get().items, newItem],
                totalItems: get().totalItems + quantity,
                totalPrice: get().totalPrice + (product.price * quantity),
                isLoading: false
              })
            }
            return
          }

          await CartService.addToCart({
            productId: product.id,
            quantity,
            userName: user.username
          })

          // Reload cart after adding item
          await get().loadCart(user.userID)
        } catch (error: any) {
          console.error('Error adding to cart:', error)
          // For demo purposes, still add to local cart
          const existingItem = get().items.find(item => item.product.id === product.id)
          if (existingItem) {
            set({
              items: get().items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              totalItems: get().totalItems + quantity,
              totalPrice: get().totalPrice + (product.price * quantity),
              isLoading: false
            })
          } else {
            const newItem = {
              cartItemID: Date.now(),
              product,
              quantity,
              price: product.price,
              cart: {
                cartID: 1,
                totalPrice: 0,
                status: 'ACTIVE',
                user: {
                  userID: 1,
                  username: 'demo_user',
                  email: 'demo@example.com',
                  role: 'CUSTOMER' as const,
                  authProvider: 'LOCAL' as const
                },
                cartItems: []
              }
            }
            set({
              items: [...get().items, newItem],
              totalItems: get().totalItems + quantity,
              totalPrice: get().totalPrice + (product.price * quantity),
              isLoading: false
            })
          }
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
            const totalItems = CartService.calculateTotalQuantity(items)
            const totalPrice = items.reduce((sum, it: any) => sum + (it.price || 0), 0)
            
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
