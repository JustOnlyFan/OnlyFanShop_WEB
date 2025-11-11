import { apiClient } from '@/lib/api'
import { tokenStorage } from '@/utils/tokenStorage'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface Warehouse {
  id: number
  name: string
  code: string
  type: 'main' | 'regional' | 'branch'
  parentWarehouseId?: number
  parentWarehouseName?: string
  storeLocationId?: number
  storeLocationName?: string
  addressLine1?: string
  addressLine2?: string
  ward?: string
  district?: string
  city?: string
  country: string
  phone?: string
  isActive: boolean
  createdAt: string
}

export interface CreateWarehouseRequest {
  name: string
  code: string
  type: 'main' | 'regional' | 'branch'
  parentWarehouseId?: number
  storeLocationId?: number
  addressLine1?: string
  addressLine2?: string
  ward?: string
  district?: string
  city?: string
  country?: string
  phone?: string
}

export interface WarehouseInventory {
  id: number
  warehouseId: number
  warehouseName: string
  warehouseCode: string
  productId: number
  productName: string
  productVariantId?: number
  productVariantName?: string
  quantityInStock: number
  updatedAt: string
}

export interface TransferStockRequest {
  fromWarehouseId: number
  toWarehouseId: number
  productId: number
  productVariantId?: number
  quantity: number
  note?: string
}

export interface StockMovement {
  id: number
  warehouseId: number
  productId: number
  productVariantId?: number
  type: 'import' | 'export' | 'adjustment' | 'transfer'
  quantity: number
  note?: string
  fromWarehouseId?: number
  toWarehouseId?: number
  orderId?: number
  createdBy?: number
  createdAt: string
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class WarehouseService {
  // Keep for backwards-compat functions that still need ad-hoc headers (rare)
  private static getAuthHeaders() {
    const token = tokenStorage.getAccessToken()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  // Get all warehouses
  static async getAllWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    try {
      const response = await apiClient.get(`${API_URL}/api/warehouses`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get warehouses')
    }
  }

  // Get warehouses by type
  static async getWarehousesByType(type: 'main' | 'regional' | 'branch'): Promise<ApiResponse<Warehouse[]>> {
    try {
      const response = await apiClient.get(`${API_URL}/api/warehouses/type/${type}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get warehouses by type')
    }
  }

  // Get main warehouses
  static async getMainWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    try {
      const response = await apiClient.get(`${API_URL}/api/warehouses/main`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get main warehouses')
    }
  }

  // Get warehouse by ID
  static async getWarehouseById(id: number): Promise<ApiResponse<Warehouse>> {
    try {
      const response = await apiClient.get(`${API_URL}/api/warehouses/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get warehouse')
    }
  }

  // Create warehouse
  static async createWarehouse(warehouse: CreateWarehouseRequest): Promise<ApiResponse<Warehouse>> {
    try {
      const response = await apiClient.post(`${API_URL}/api/warehouses`, warehouse)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create warehouse')
    }
  }

  // Update warehouse
  static async updateWarehouse(id: number, warehouse: CreateWarehouseRequest): Promise<ApiResponse<Warehouse>> {
    try {
      const response = await apiClient.put(`${API_URL}/api/warehouses/${id}`, warehouse)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update warehouse')
    }
  }

  // Delete warehouse
  static async deleteWarehouse(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`${API_URL}/api/warehouses/${id}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete warehouse')
    }
  }

  // Get warehouse inventory
  static async getWarehouseInventory(warehouseId: number): Promise<ApiResponse<WarehouseInventory[]>> {
    try {
      const response = await apiClient.get(`${API_URL}/api/warehouses/${warehouseId}/inventory`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get warehouse inventory')
    }
  }

  // Transfer stock
  static async transferStock(request: TransferStockRequest): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post(`${API_URL}/api/warehouses/transfer`, request)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to transfer stock')
    }
  }

  // Request stock from parent
  static async requestStockFromParent(
    warehouseId: number,
    productId: number,
    quantity: number,
    productVariantId?: number,
    note?: string
  ): Promise<ApiResponse<void>> {
    try {
      const params = new URLSearchParams()
      params.append('productId', productId.toString())
      params.append('quantity', quantity.toString())
      if (productVariantId) params.append('productVariantId', productVariantId.toString())
      if (note) params.append('note', note)

      const response = await apiClient.post(
        `${API_URL}/api/warehouses/${warehouseId}/request-stock?${params.toString()}`,
        {}
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request stock')
    }
  }

  // Get stock movements
  static async getStockMovements(warehouseId: number): Promise<ApiResponse<StockMovement[]>> {
    try {
      const response = await apiClient.get(`${API_URL}/api/warehouses/${warehouseId}/movements`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get stock movements')
    }
  }

  // Add product to warehouse
  static async addProductToWarehouse(request: {
    warehouseId: number
    productId: number
    productVariantId?: number
    quantity: number
    note?: string
  }): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post(`${API_URL}/api/warehouses/products`, request)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add product to warehouse')
    }
  }

  // Get child warehouses
  static async getChildWarehouses(parentId: number): Promise<ApiResponse<Warehouse[]>> {
    try {
      const response = await apiClient.get(`${API_URL}/api/warehouses/${parentId}/children`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get child warehouses')
    }
  }

  // Warehouse type labels
  static getWarehouseTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      main: 'Kho Tổng',
      regional: 'Kho Khu Vực',
      branch: 'Kho Chi Nhánh'
    }
    return labels[type] || type
  }

  // Warehouse type colors
  static getWarehouseTypeColor(type: string): string {
    const colors: Record<string, string> = {
      main: 'bg-blue-100 text-blue-800',
      regional: 'bg-green-100 text-green-800',
      branch: 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }
}

