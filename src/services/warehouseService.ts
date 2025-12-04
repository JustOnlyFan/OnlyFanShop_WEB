import { ApiResponse } from '@/types'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { StoreInventoryService, StoreInventoryRecord } from '@/services/storeInventoryService'

export type WarehouseType = 'store'

export interface Warehouse {
  id: number
  code: string
  name: string
  type: WarehouseType
  storeLocationId: number
  addressLine1?: string | null
  ward?: string | null
  district?: string | null
  city?: string | null
  phone?: string | null
  isActive: boolean
  description?: string | null
}

export interface CreateWarehouseRequest {
  name: string
  code: string
  type: WarehouseType
  parentWarehouseId?: number
  storeLocationId?: number
  addressLine1?: string
  addressLine2?: string
  ward?: string
  district?: string
  city?: string
  country?: string
  phone?: string
  isActive?: boolean
}

export interface UpdateWarehouseRequest extends Partial<CreateWarehouseRequest> {}

export interface WarehouseInventory {
  id: number
  warehouseId: number
  warehouseName: string
  productId: number
  productName: string
  productVariantName?: string | null
  quantityInStock: number
  isAvailable?: boolean
  updatedAt: string
  createdAt?: string
  productImageUrl?: string | null
}

export interface StockMovement {
  id: number
  warehouseId: number
  type: 'import' | 'export' | 'transfer' | 'adjustment'
  productId: number
  productVariantId?: number
  quantity: number
  fromWarehouseId?: number
  toWarehouseId?: number
  note?: string
  createdAt: string
}

export interface TransferStockRequest {
  fromWarehouseId: number
  toWarehouseId: number
  productId: number
  quantity: number
  note?: string
}

export interface AddProductToWarehouseRequest {
  warehouseId: number
  productId: number
  quantity?: number
  note?: string
}

export class WarehouseService {
  private static wrapResponse<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return {
      statusCode,
      message,
      data,
      dateTime: new Date().toISOString()
    }
  }

  private static mapStoreToWarehouse(store: StoreLocation): Warehouse {
    const id = (store as any).locationID ?? (store as any).id ?? 0
    return {
      id,
      code: (store as any).code || `STORE-${id}`,
      name: store.name,
      type: 'store',
      storeLocationId: id,
      addressLine1: store.address,
      city: (store as any).city || null,
      ward: (store as any).ward || null,
      phone: (store as any).phone || (store as any).phoneNumber || null,
      isActive: (store as any).status ? (store as any).status === 'ACTIVE' : Boolean((store as any).isActive ?? true),
      description: (store as any).description || null
    }
  }

  static async getAllWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    const storeResponse = await StoreLocationService.getStoreLocations()
    const storesRaw = storeResponse?.data as any
    const stores = Array.isArray(storesRaw)
      ? storesRaw
      : Array.isArray(storesRaw?.stores)
        ? storesRaw.stores
        : []
    const warehouses = stores.map((store: StoreLocation) => this.mapStoreToWarehouse(store))
    return this.wrapResponse(warehouses, 'Danh sách kho theo cửa hàng')
  }

  static async getMainWarehouses() {
    return this.getAllWarehouses()
  }

  static async getWarehousesByType(type: WarehouseType) {
    if (type === 'store') {
      return this.getAllWarehouses()
    }
    return this.wrapResponse<Warehouse[]>([], 'Không tồn tại loại kho khác ngoài cửa hàng')
  }

  static async getWarehouseById(warehouseId: number): Promise<ApiResponse<Warehouse | null>> {
    const fallback = await StoreLocationService.getStoreLocationById(warehouseId)
    const store = fallback?.data
    if (!store) {
      return this.wrapResponse<Warehouse | null>(null, 'Không tìm thấy kho')
    }
    return this.wrapResponse(this.mapStoreToWarehouse(store), 'Kho theo cửa hàng')
  }

  static async createWarehouse(_payload: CreateWarehouseRequest) {
    throw new Error('Tính năng tạo kho đã bị loại bỏ. Vui lòng sử dụng trang quản lý cửa hàng.')
  }

  static async updateWarehouse(_warehouseId: number, _payload: UpdateWarehouseRequest) {
    throw new Error('Tính năng cập nhật kho đã bị loại bỏ. Vui lòng quản lý trực tiếp cửa hàng.')
  }

  static async deleteWarehouse(_warehouseId: number) {
    throw new Error('Tính năng xoá kho đã bị loại bỏ. Vui lòng xoá cửa hàng nếu cần.')
  }

  private static mapStoreInventoryToWarehouseInventory(record: StoreInventoryRecord): WarehouseInventory {
    return {
      id: record.id || record.productId,
      warehouseId: record.storeId,
      warehouseName: record.storeName || `Cửa hàng ${record.storeId}`,
      productId: record.productId,
      productName: record.productName || `Sản phẩm #${record.productId}`,
      productVariantName: record.productVariantName || null,
      quantityInStock: typeof record.quantityInStock === 'number'
        ? record.quantityInStock
        : typeof record.quantity === 'number'
          ? record.quantity
          : 0,
      isAvailable: typeof record.isAvailable === 'boolean' ? record.isAvailable : undefined,
      updatedAt: record.updatedAt || record.createdAt || new Date().toISOString(),
      createdAt: record.createdAt,
      productImageUrl: record.productImageUrl
    }
  }

  static async getWarehouseInventory(warehouseId: number): Promise<ApiResponse<WarehouseInventory[]>> {
    const response = await StoreInventoryService.getStoreProducts(warehouseId, true)
    const inventory = (response.data || []).map(item => this.mapStoreInventoryToWarehouseInventory(item))
    return this.wrapResponse(inventory, 'Tồn kho cửa hàng')
  }

  static async addProductToWarehouse(payload: AddProductToWarehouseRequest) {
    return StoreInventoryService.toggleProductAvailability(payload.warehouseId, payload.productId, true)
  }

  static async transferStock(_payload: TransferStockRequest) {
    throw new Error('Tính năng chuyển kho không còn được hỗ trợ. Vui lòng quản lý tồn kho tại từng cửa hàng.')
  }

  static async getStockMovements(_warehouseId: number): Promise<ApiResponse<StockMovement[]>> {
    return this.wrapResponse<StockMovement[]>(
      [],
      'Lịch sử xuất nhập kho hiện không khả dụng trong cấu trúc StoreInventory'
    )
  }

  static getWarehouseTypeLabel(type: WarehouseType) {
    const labels: Record<WarehouseType, string> = {
      store: 'Kho cửa hàng'
    }
    return labels[type] || type
  }

  static getWarehouseTypeColor(type: WarehouseType) {
    const colors: Record<WarehouseType, string> = {
      store: 'bg-indigo-100 text-indigo-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }
}

