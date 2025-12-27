import { apiClient } from '@/lib/api'
import { ApiResponse } from '@/types'

export type InventoryRequestStatus = 'PENDING' | 'APPROVED' | 'SHIPPING' | 'DELIVERED' | 'REJECTED' | 'CANCELLED'

export interface InventoryRequestItem {
  id?: number
  productId: number
  productName?: string
  productImageUrl?: string
  requestedQuantity: number
  approvedQuantity?: number
}

export interface InventoryRequest {
  id: number
  storeId: number
  storeName?: string
  /**
   * ID của kho nguồn - nơi hàng được chuyển đi
   * Requirements: 3.1
   */
  sourceWarehouseId?: number
  /**
   * Tên kho nguồn
   */
  sourceWarehouseName?: string
  // New: list of items
  items?: InventoryRequestItem[]
  totalItems?: number
  totalQuantity?: number
  // Legacy fields for backward compatibility
  productId?: number
  productName?: string
  productImageUrl?: string
  requestedQuantity?: number
  approvedQuantity?: number
  status: InventoryRequestStatus
  requestedBy?: number
  requesterName?: string
  approvedBy?: number
  approverName?: string
  requestNote?: string
  adminNote?: string
  approvedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateInventoryRequestItemDTO {
  productId: number
  quantity: number
}

/**
 * DTO để tạo yêu cầu điều chuyển hàng
 * Requirements: 3.1 - Yêu cầu phải chỉ định source warehouse
 */
export interface CreateInventoryRequestDTO {
  storeId: number
  /**
   * ID của kho nguồn - nơi hàng được chuyển đi
   * Requirements: 3.1 - WHEN Store_Staff creates a Transfer_Request THEN the System SHALL require specifying a source Store_Warehouse
   */
  sourceWarehouseId: number
  items: CreateInventoryRequestItemDTO[]
  note?: string
  // Legacy fields
  productId?: number
  quantity?: number
}

export interface ApproveInventoryRequestDTO {
  approvedQuantity: number
  adminNote?: string
}

export interface RejectInventoryRequestDTO {
  adminNote?: string
}

export class InventoryRequestService {
  private static wrap<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return {
      statusCode,
      message,
      data,
      dateTime: new Date().toISOString()
    }
  }

  /**
   * Tạo yêu cầu nhập hàng với source warehouse
   * Requirements: 3.1 - WHEN Store_Staff creates a Transfer_Request THEN the System SHALL require specifying a source Store_Warehouse
   */
  static async createRequest(dto: CreateInventoryRequestDTO) {
    // Validate sourceWarehouseId is provided
    if (!dto.sourceWarehouseId) {
      throw new Error('Source warehouse ID is required')
    }
    const response = await apiClient.post('/inventory-requests', dto)
    return response.data as ApiResponse<InventoryRequest>
  }

  /**
   * Tạo yêu cầu điều chuyển hàng (Transfer Request)
   * Requirements: 3.1 - Yêu cầu phải chỉ định source warehouse
   */
  static async createTransferRequest(
    destinationStoreId: number,
    sourceWarehouseId: number,
    items: CreateInventoryRequestItemDTO[],
    note?: string
  ) {
    const dto: CreateInventoryRequestDTO = {
      storeId: destinationStoreId,
      sourceWarehouseId,
      items,
      note
    }
    return this.createRequest(dto)
  }

  /**
   * Lấy danh sách yêu cầu của một cửa hàng
   */
  static async getStoreRequests(storeId: number) {
    const response = await apiClient.get(`/inventory-requests/store/${storeId}`)
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ApiResponse<InventoryRequest[]>
    }
    return this.wrap<InventoryRequest[]>(payload ?? [], 'Danh sách yêu cầu')
  }

  /**
   * Lấy danh sách yêu cầu chờ duyệt
   */
  static async getPendingRequests() {
    const response = await apiClient.get('/inventory-requests/pending')
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ApiResponse<InventoryRequest[]>
    }
    return this.wrap<InventoryRequest[]>(payload ?? [], 'Danh sách yêu cầu chờ duyệt')
  }

  /**
   * Lấy chi tiết yêu cầu
   */
  static async getRequest(id: number) {
    const response = await apiClient.get(`/inventory-requests/${id}`)
    return response.data as ApiResponse<InventoryRequest>
  }

  /**
   * Duyệt yêu cầu
   */
  static async approveRequest(id: number, dto: ApproveInventoryRequestDTO) {
    const response = await apiClient.put(`/inventory-requests/${id}/approve`, dto)
    return response.data as ApiResponse<InventoryRequest>
  }

  /**
   * Từ chối yêu cầu
   */
  static async rejectRequest(id: number, dto: RejectInventoryRequestDTO) {
    const response = await apiClient.put(`/inventory-requests/${id}/reject`, dto)
    return response.data as ApiResponse<InventoryRequest>
  }

  /**
   * Chuyển sang trạng thái vận chuyển
   */
  static async startShipping(id: number) {
    const response = await apiClient.put(`/inventory-requests/${id}/shipping`)
    return response.data as ApiResponse<InventoryRequest>
  }

  /**
   * Hoàn thành giao hàng (cập nhật số lượng kho)
   */
  static async completeDelivery(id: number) {
    const response = await apiClient.put(`/inventory-requests/${id}/delivered`)
    return response.data as ApiResponse<InventoryRequest>
  }

  /**
   * Hủy yêu cầu
   */
  static async cancelRequest(id: number) {
    const response = await apiClient.put(`/inventory-requests/${id}/cancel`)
    return response.data as ApiResponse<InventoryRequest>
  }

  /**
   * Đếm số yêu cầu chờ duyệt
   */
  static async countPendingRequests() {
    const response = await apiClient.get('/inventory-requests/pending/count')
    return response.data as ApiResponse<number>
  }
}
