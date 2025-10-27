import axios from 'axios'

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
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
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
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
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
    const token = localStorage.getItem('token')
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

  // Get user's order history
  static async getOrderHistory(filters: OrderFilter = {}): Promise<ApiResponse<OrderHistoryResponse>> {
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

      const response = await axios.get(`${API_URL}/api/orders/history?${params}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get order history')
    }
  }

  // Cancel order
  static async cancelOrder(orderId: number, reason?: string): Promise<ApiResponse<Order>> {
    try {
      const response = await axios.put(`${API_URL}/api/orders/${orderId}/cancel`, 
        { reason },
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order')
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

  // Get all orders (Admin only)
  static async getAllOrders(filters: OrderFilter = {}): Promise<ApiResponse<OrderHistoryResponse>> {
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

      const response = await axios.get(`${API_URL}/api/orders?${params}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get orders')
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

  // Get order status options
  static getOrderStatusOptions() {
    return [
      { value: 'PENDING', label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      { value: 'PROCESSING', label: 'Đang xử lý', color: 'bg-purple-100 text-purple-800' },
      { value: 'SHIPPED', label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800' },
      { value: 'DELIVERED', label: 'Đã giao', color: 'bg-green-100 text-green-800' },
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

