import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface PaymentRequest {
  orderId: number
  amount: number
  paymentMethod: 'VNPAY' | 'BANK_TRANSFER' | 'COD'
  returnUrl?: string
  cancelUrl?: string
}

export interface VNPayPaymentRequest {
  amount: number
  bankCode: string
  address: string
}

export interface PaymentResponse {
  paymentUrl?: string
  paymentId: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  message: string
  transactionId?: string
  bankCode?: string
  bankTranNo?: string
  cardType?: string
  orderInfo?: string
  payDate?: string
  responseCode?: string
}

export interface PaymentResult {
  orderId: number
  paymentId: string
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED'
  amount: number
  transactionId?: string
  bankCode?: string
  bankTranNo?: string
  cardType?: string
  orderInfo?: string
  payDate?: string
  responseCode?: string
  message?: string
}

export interface PaymentHistory {
  id: number
  orderId: number
  paymentMethod: string
  amount: number
  status: string
  transactionId?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentStatistics {
  totalPayments: number
  totalAmount: number
  successRate: number
  averageAmount: number
  paymentsByMethod: Record<string, number>
  paymentsByStatus: Record<string, number>
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class PaymentService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Create VNPay payment (align with BE GET /payment/vn-pay)
  static async createVNPayPayment(paymentData: VNPayPaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await axios.get(`${API_URL}/payment/vn-pay`, {
        params: {
          amount: paymentData.amount,
          bankCode: paymentData.bankCode,
          address: paymentData.address
        },
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create VNPay payment')
    }
  }

  // Create payment
  static async createPayment(paymentData: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await axios.post(`${API_URL}/api/payment/create`, paymentData, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment')
    }
  }

  // Handle VNPay callback
  static async handleVNPayCallback(queryParams: Record<string, string>): Promise<ApiResponse<PaymentResult>> {
    try {
      const response = await axios.get(`${API_URL}/payment/public/vn-pay-callback`, {
        params: queryParams,
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to handle payment callback')
    }
  }

  // Get payment status
  static async getPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await axios.get(`${API_URL}/api/payment/${paymentId}/status`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment status')
    }
  }

  // Get payment by order ID
  static async getPaymentByOrderId(orderId: number): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await axios.get(`${API_URL}/api/payment/order/${orderId}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment')
    }
  }

  // Get payment history
  static async getPaymentHistory(page: number = 0, size: number = 20): Promise<ApiResponse<PaymentHistory[]>> {
    try {
      const response = await axios.get(`${API_URL}/api/payment/history?page=${page}&size=${size}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment history')
    }
  }

  // Cancel payment
  static async cancelPayment(paymentId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.put(`${API_URL}/api/payment/${paymentId}/cancel`, {}, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel payment')
    }
  }

  // Refund payment
  static async refundPayment(paymentId: string, amount?: number): Promise<ApiResponse<PaymentResponse>> {
    try {
      const response = await axios.post(`${API_URL}/api/payment/${paymentId}/refund`, 
        { amount },
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to refund payment')
    }
  }

  // Get payment statistics (Admin only)
  static async getPaymentStatistics(startDate?: string, endDate?: string): Promise<ApiResponse<PaymentStatistics>> {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await axios.get(`${API_URL}/api/payment/statistics?${params}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get payment statistics')
    }
  }

  // Get supported payment methods
  static getSupportedPaymentMethods() {
    return [
      {
        id: 'VNPAY',
        name: 'VNPay',
        description: 'Thanh toán qua VNPay',
        icon: '💳',
        isAvailable: true
      },
      {
        id: 'BANK_TRANSFER',
        name: 'Chuyển khoản ngân hàng',
        description: 'Chuyển khoản trực tiếp',
        icon: '🏦',
        isAvailable: true
      },
      {
        id: 'COD',
        name: 'Thanh toán khi nhận hàng',
        description: 'COD - Cash on Delivery',
        icon: '💰',
        isAvailable: true
      }
    ]
  }

  // Format payment amount
  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Validate payment data
  static validatePaymentData(paymentData: PaymentRequest): { isValid: boolean, errors: string[] } {
    const errors: string[] = []

    if (!paymentData.orderId || paymentData.orderId <= 0) {
      errors.push('Invalid order ID')
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Invalid amount')
    }

    if (!paymentData.paymentMethod) {
      errors.push('Payment method is required')
    }

    const supportedMethods = ['VNPAY', 'BANK_TRANSFER', 'COD']
    if (paymentData.paymentMethod && !supportedMethods.includes(paymentData.paymentMethod)) {
      errors.push('Unsupported payment method')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get payment status color
  static getPaymentStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get payment status label
  static getPaymentStatusLabel(status: string): string {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
        return 'Thành công'
      case 'PENDING':
        return 'Chờ thanh toán'
      case 'FAILED':
        return 'Thất bại'
      case 'CANCELLED':
        return 'Đã hủy'
      default:
        return 'Không xác định'
    }
  }

  // Generate payment URL for VNPay
  static generateVNPayUrl(baseUrl: string, params: Record<string, string>): string {
    const url = new URL(baseUrl)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
    return url.toString()
  }

  // Parse VNPay callback parameters
  static parseVNPayCallback(searchParams: URLSearchParams): Record<string, string> {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }
}