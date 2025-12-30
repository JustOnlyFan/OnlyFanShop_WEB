import { apiClient } from '@/lib/api'
import { ApiResponse } from '@/types'

export interface StoreInventoryRecord {
  id: number | null
  storeId: number
  storeName?: string | null
  storeAddress?: string | null
  productId: number
  productName?: string | null
  productImageUrl?: string | null
  productPrice?: number | null
  isAvailable: boolean
  quantity?: number | null
  createdAt?: string
  updatedAt?: string
}

export class StoreInventoryService {
  private static wrap<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return {
      statusCode,
      message,
      data,
      dateTime: new Date().toISOString()
    }
  }

  static async getStoreProducts(storeId: number, includeInactive = false) {
    const response = await apiClient.get(`/store-inventory/store/${storeId}/products`, {
      params: { includeInactive }
    })
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ApiResponse<StoreInventoryRecord[]>
    }
    return this.wrap<StoreInventoryRecord[]>(payload ?? [], 'Danh sách sản phẩm tại cửa hàng')
  }

  static async toggleProductAvailability(storeId: number, productId: number, isAvailable: boolean) {
    const response = await apiClient.put(
      `/store-inventory/store/${storeId}/product/${productId}/toggle`,
      null,
      { params: { isAvailable } }
    )
    return response.data as ApiResponse<StoreInventoryRecord>
  }

  static async getStoreInventory(storeId: number, productId: number) {
    const response = await apiClient.get(`/store-inventory/store/${storeId}/product/${productId}`)
    return response.data as ApiResponse<StoreInventoryRecord | null>
  }

  static async getAvailableProducts(storeId: number) {
    const response = await apiClient.get(`/store-inventory/store/${storeId}/available-products`)
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ApiResponse<any[]>
    }
    return this.wrap<any[]>(payload ?? [], 'Danh sách sản phẩm có thể thêm')
  }

  static async addProductsToStore(storeId: number, productIds: number[]) {
    const response = await apiClient.post(
      `/store-inventory/store/${storeId}/products`,
      productIds
    )
    return response.data as ApiResponse<StoreInventoryRecord[]>
  }

  static async getAllProductsWithStoreStatus(storeId: number) {
    const response = await apiClient.get(`/store-inventory/store/${storeId}/all-products`)
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ApiResponse<StoreInventoryRecord[]>
    }
    return this.wrap<StoreInventoryRecord[]>(payload ?? [], 'Danh sách tất cả sản phẩm')
  }

  static async updateStoreProducts(storeId: number, enabledProductIds: number[]) {
    const response = await apiClient.put(
      `/store-inventory/store/${storeId}/products`,
      enabledProductIds
    )
    return response.data as ApiResponse<void>
  }
}



