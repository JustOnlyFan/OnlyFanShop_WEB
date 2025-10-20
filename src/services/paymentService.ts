import { apiClient } from '@/lib/api'
import { VNPayResponse, ApiResponse } from '@/types'

export class PaymentService {
  // Create VNPay payment
  static async createVNPayPayment(
    amount: number,
    bankCode: string,
    address: string
  ): Promise<ApiResponse<VNPayResponse>> {
    // VNPay/backends are sensitive to special characters in query params
    const encodedAddress = encodeURIComponent(address)
    const encodedBank = encodeURIComponent(bankCode)
    try {
      return await apiClient.get(
        `/payment/vn-pay?amount=${Math.round(amount)}&bankCode=${encodedBank}&address=${encodedAddress}`
      )
    } catch (error: any) {
      console.error('VNPay API Error:', error);
      
      // Check if it's a 403/401 (authentication issue)
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      // Check if it's a network error (backend not running)
      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.');
      }
      
      // Other errors
      throw new Error(
        error?.response?.data?.message ||
          'Không thể tạo URL thanh toán VNPay. Vui lòng kiểm tra backend ký URL đúng chuẩn.'
      )
    }
  }

  // Handle VNPay callback
  static async handleVNPayCallback(params: Record<string, string>): Promise<void> {
    // This is typically handled on the server side
    // The callback URL should redirect to the frontend
    const callbackUrl = `${window.location.origin}/payment/callback?${new URLSearchParams(params).toString()}`
    window.location.href = callbackUrl
  }

  // Get payment status
  static async getPaymentStatus(transactionCode: string): Promise<ApiResponse<{
    status: 'success' | 'failed' | 'pending'
    message: string
  }>> {
    // This would need to be implemented in the backend
    return apiClient.get(`/payment/status/${transactionCode}`)
  }

  // Format currency
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Validate payment amount
  static validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 100000000 // Max 100M VND
  }
}
