import axios from 'axios'
import { ApiResponse } from '@/types'
import { tokenStorage } from '@/utils/tokenStorage'

const API_URL = typeof process.env.NEXT_PUBLIC_API_URL !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL as string)
  : 'http://localhost:8080'

export interface StoreInventoryRecord {
  id: number
  storeId: number
  storeName?: string | null
  storeAddress?: string | null
  productId: number
  productName?: string | null
  productImageUrl?: string | null
  isAvailable: boolean
  quantity?: number | null
  createdAt?: string
  updatedAt?: string
}

export class StoreInventoryService {
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

  private static wrap<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return {
      statusCode,
      message,
      data,
      dateTime: new Date().toISOString()
    }
  }

  static async getStoreProducts(storeId: number, includeInactive = false) {
    const response = await axios.get(`${API_URL}/store-inventory/store/${storeId}/products`, {
      headers: this.getAuthHeaders(),
      params: { includeInactive }
    })
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ApiResponse<StoreInventoryRecord[]>
    }
    return this.wrap<StoreInventoryRecord[]>(payload ?? [], 'Danh sách sản phẩm tại cửa hàng')
  }

  static async toggleProductAvailability(storeId: number, productId: number, isAvailable: boolean) {
    const response = await axios.put(
      `${API_URL}/store-inventory/store/${storeId}/product/${productId}/toggle`,
      null,
      {
        headers: this.getAuthHeaders(),
        params: { isAvailable }
      }
    )
    return response.data as ApiResponse<StoreInventoryRecord>
  }

  static async getStoreInventory(storeId: number, productId: number) {
    const response = await axios.get(`${API_URL}/store-inventory/store/${storeId}/product/${productId}`, {
      headers: this.getAuthHeaders()
    })
    return response.data as ApiResponse<StoreInventoryRecord | null>
  }
}


