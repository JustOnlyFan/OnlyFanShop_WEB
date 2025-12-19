import axios from 'axios'

import { tokenStorage } from '@/utils/tokenStorage'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface OrderItem {
  id: number
  productId: number
  productName: string
  productImage: string
  price: number
  quantity: number
  totalPrice: number
}

export interface ShippingAddress {
  fullName: string
  phoneNumber: string
  address: string
  city: string
  district: string
  ward: string
  isDefault: boolean
}

export interface Order {
  id: number
  orderNumber: string
  userId: number
  items: OrderItem[]
  shippingAddress: ShippingAddress
  paymentMethod: 'COD' | 'VNPAY' | 'BANK_TRANSFER'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  orderStatus: 'PENDING' | 'PICKING' | 'SHIPPING' | 'DELIVERED' | 'RETURNS_REFUNDS' | 'CANCELLED'
  totalItems: number
  subtotal: number
  shippingFee: number
  discount: number
  totalAmount: number
  notes?: string
  createdAt: string
  updatedAt: string
  deliveredAt?: string
  cancelledAt?: string
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress
  paymentMethod: 'COD' | 'VNPAY' | 'BANK_TRANSFER'
  notes?: string
  couponCode?: string
}

export interface UpdateOrderStatusRequest {
  orderStatus: 'PENDING' | 'PICKING' | 'SHIPPING' | 'DELIVERED' | 'RETURNS_REFUNDS' | 'CANCELLED'
  notes?: string
}

export interface OrderFilter {
  status?: string
  paymentStatus?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
  sortBy?: string
  order?: 'ASC' | 'DESC'
}

export interface OrderHistoryResponse {
  orders: Order[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class OrderService {
  private static getAuthHeaders() {
    const token = tokenStorage.getAccessToken()
    if (!token) {
      throw new Error('No authentication token found. Please login again.')
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Create new order
  static async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    try {
      const response = await axios.post(`${API_URL}/api/orders`, orderData, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order')
    }
  }

  // Get order by ID
  static async getOrderById(orderId: number): Promise<ApiResponse<Order>> {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get order')
    }
  }

  // Get user's order history - Updated to use correct endpoint
  static async getOrderHistory(filters: OrderFilter = {}): Promise<ApiResponse<Order[]>> {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.size) params.append('size', filters.size.toString())
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.order) params.append('order', filters.order)

      const response = await axios.get(`${API_URL}/order/getOrders?${params}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get order history')
    }
  }

  // Cancel order - Updated to use correct endpoint
  static async cancelOrder(orderId: number): Promise<ApiResponse<void>> {
    try {
      const response = await axios.put(`${API_URL}/order/cancelOrder?orderId=${orderId}`, 
        {},
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order')
    }
  }

  // Get order details
  static async getOrderDetails(orderId: number): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${API_URL}/order/getOrderDetails?orderId=${orderId}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get order details')
    }
  }

  // Update order status (Admin only)
  static async updateOrderStatus(orderId: number, statusData: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    try {
      const response = await axios.put(`${API_URL}/api/orders/${orderId}/status`, statusData, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order status')
    }
  }

  // Set order status - Backend endpoint mapping
  static async setOrderStatus(orderId: number, status: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.put(`${API_URL}/order/setOrderStatus`, {}, {
        params: { orderId, status },
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to set order status')
    }
  }

  // Get all orders (Admin only) - Updated to use correct endpoint
  static async getAllOrders(filters: OrderFilter = {}): Promise<ApiResponse<Order[]>> {
    try {
      // Backend endpoint getAllOrders() doesn't accept parameters
      // Use getOrders with admin role for filtering
      const token = tokenStorage.getAccessToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      // If status filter is provided, use getOrders endpoint with status
      if (filters.status) {
        const response = await axios.get(`${API_URL}/order/getOrders`, {
          params: { status: filters.status },
          headers: this.getAuthHeaders()
        })
        return response.data
      }

      // Otherwise, get all orders
      // Note: Backend throws exception if no orders, so we handle it gracefully
      try {
        const response = await axios.get(`${API_URL}/order/getAllOrders`, {
          headers: this.getAuthHeaders()
        })
        return response.data
      } catch (error: any) {
        // If backend returns error for empty list, return empty array
        if (error.response?.status === 400 || error.response?.data?.message?.includes('CART_NOTFOUND')) {
          return {
            statusCode: 200,
            message: 'Không có đơn hàng nào',
            data: []
          }
        }
        throw error
      }
    } catch (error: any) {
      console.error('Error getting orders:', error.response?.status, error.response?.data)
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.')
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied. Admin access required.')
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to get orders')
    }
  }

  // Get order statistics (Admin only)
  static async getOrderStatistics(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await axios.get(`${API_URL}/api/orders/statistics?${params}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get order statistics')
    }
  }

  // Track order
  static async trackOrder(orderNumber: string): Promise<ApiResponse<Order>> {
    try {
      const response = await axios.get(`${API_URL}/api/orders/track/${orderNumber}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to track order')
    }
  }

  // Get order status options - updated to match backend OrderStatus enum
  static getOrderStatusOptions() {
    return [
      { value: 'PENDING', label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'PICKING', label: 'Đang lấy hàng', color: 'bg-blue-100 text-blue-800' },
      { value: 'SHIPPING', label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
      { value: 'DELIVERED', label: 'Đã giao', color: 'bg-green-100 text-green-800' },
      { value: 'RETURNS_REFUNDS', label: 'Trả hàng/Hoàn tiền', color: 'bg-orange-100 text-orange-800' },
      { value: 'CANCELLED', label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    ]
  }

  // Get payment status options
  static getPaymentStatusOptions() {
    return [
      { value: 'PENDING', label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'PAID', label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
      { value: 'FAILED', label: 'Thanh toán thất bại', color: 'bg-red-100 text-red-800' },
      { value: 'REFUNDED', label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-800' }
    ]
  }

  // Get orders by status - new dedicated endpoints
  static async getOrdersPending(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await axios.get(`${API_URL}/order/getOrdersPending`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get pending orders')
    }
  }

  static async getOrdersPicking(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await axios.get(`${API_URL}/order/getOrdersPicking`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get picking orders')
    }
  }

  static async getOrdersShipping(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await axios.get(`${API_URL}/order/getOrdersShipping`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get shipping orders')
    }
  }

  static async getOrdersCompleted(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await axios.get(`${API_URL}/order/getOrdersCompleted`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get completed orders')
    }
  }

  // Calculate order totals
  static calculateOrderTotals(items: OrderItem[], shippingFee: number = 0, discount: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const totalAmount = subtotal + shippingFee - discount
    
    return {
      subtotal,
      shippingFee,
      discount,
      totalAmount
    }
  }

  // Validate order data
  static validateOrderData(orderData: CreateOrderRequest): { isValid: boolean, errors: string[] } {
    const errors: string[] = []
    
    if (!orderData.shippingAddress) {
      errors.push('Shipping address is required')
    } else {
      const { fullName, phoneNumber, address, city, district, ward } = orderData.shippingAddress
      
      if (!fullName?.trim()) errors.push('Full name is required')
      if (!phoneNumber?.trim()) errors.push('Phone number is required')
      if (!address?.trim()) errors.push('Address is required')
      if (!city?.trim()) errors.push('City is required')
      if (!district?.trim()) errors.push('District is required')
      if (!ward?.trim()) errors.push('Ward is required')
    }
    
    if (!orderData.paymentMethod) {
      errors.push('Payment method is required')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

