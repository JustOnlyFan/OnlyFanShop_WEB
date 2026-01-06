import { apiClient } from '@/lib/api'
import { ApiResponse } from '@/types'

import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { StoreInventoryService, StoreInventoryRecord } from '@/services/storeInventoryService'

/**
 * WarehouseType - Chỉ hỗ trợ 'store' (kho cửa hàng)
 * Main warehouse đã được loại bỏ theo Requirements 1.1
 */
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
  isEnabled?: boolean
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

/**
 * Request để cập nhật số lượng tồn kho tại kho cửa hàng
 * Requirements: 2.1
 */
export interface UpdateStoreWarehouseQuantityRequest {
  quantity: number
  reason?: string
}

/**
 * Response từ API cập nhật tồn kho
 */
export interface InventoryItemResponse {
  id: number
  warehouseId: number
  productId: number
  quantity: number
  updatedAt: string
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

  /**
   * Lấy tất cả kho đang hoạt động (chỉ Store Warehouses)
   * Requirements: 1.3, 2.4
   */
  static async getAllActiveWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    try {
      // Gọi API backend để lấy danh sách kho active
      const response = await apiClient.get('/api/warehouses')
      const payload = response.data
      if (payload && typeof payload === 'object' && 'data' in payload) {
        return payload as ApiResponse<Warehouse[]>
      }
      return this.wrapResponse<Warehouse[]>(payload ?? [], 'Danh sách kho đang hoạt động')
    } catch (error) {
      // Fallback: lấy từ store locations nếu API không khả dụng
      const storeResponse = await StoreLocationService.getStoreLocations()
      const storesRaw = storeResponse?.data as any
      const stores = Array.isArray(storesRaw)
        ? storesRaw
        : Array.isArray(storesRaw?.stores)
          ? storesRaw.stores
          : []
      const warehouses = stores
        .filter((store: any) => store.status === 'ACTIVE' || store.isActive !== false)
        .map((store: StoreLocation) => this.mapStoreToWarehouse(store))
      return this.wrapResponse(warehouses, 'Danh sách kho đang hoạt động')
    }
  }

  /**
   * @deprecated Sử dụng getAllActiveWarehouses() thay thế
   */
  static async getAllWarehouses(): Promise<ApiResponse<Warehouse[]>> {
    return this.getAllActiveWarehouses()
  }

  static async getWarehousesByType(type: WarehouseType) {
    if (type === 'store') {
      return this.getAllActiveWarehouses()
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

  /**
   * Lấy kho của một cửa hàng cụ thể
   * Requirements: 2.4
   */
  static async getStoreWarehouse(storeId: number): Promise<ApiResponse<Warehouse | null>> {
    try {
      const response = await apiClient.get(`/api/warehouses/stores/${storeId}`)
      const payload = response.data
      if (payload && typeof payload === 'object' && 'data' in payload) {
        return payload as ApiResponse<Warehouse>
      }
      return this.wrapResponse<Warehouse | null>(payload ?? null, 'Kho cửa hàng')
    } catch (error) {
      // Fallback
      return this.getWarehouseById(storeId)
    }
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

  /**
   * Vô hiệu hóa kho (soft delete)
   * Requirements: 7.2, 7.3
   */
  static async deactivateWarehouse(warehouseId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/api/warehouses/${warehouseId}`)
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ApiResponse<void>
    }
    return this.wrapResponse<void>(undefined, 'Kho đã được vô hiệu hóa')
  }

  private static mapStoreInventoryToWarehouseInventory(record: StoreInventoryRecord): WarehouseInventory {
    return {
      id: record.id || record.productId,
      warehouseId: record.storeId,
      warehouseName: record.storeName || `Cửa hàng ${record.storeId}`,
      productId: record.productId,
      productName: record.productName || `Sản phẩm #${record.productId}`,
      productVariantName: null,
      quantityInStock: typeof record.quantity === 'number' ? record.quantity : 0,
      isAvailable: typeof record.isAvailable === 'boolean' ? record.isAvailable : undefined,
      updatedAt: record.updatedAt || record.createdAt || new Date().toISOString(),
      createdAt: record.createdAt,
      productImageUrl: record.productImageUrl
    }
  }

  static async getWarehouseInventory(warehouseId: number): Promise<ApiResponse<WarehouseInventory[]>> {
    // Lấy TẤT CẢ sản phẩm đang bán từ getAllProductsWithStoreStatus (giống trang products)
    // Và merge với inventory_items để lấy quantity chính xác
    try {
      const [warehouseResponse, allProductsResponse] = await Promise.all([
        apiClient.get(`/api/warehouses/stores/${warehouseId}`).catch((err) => {
          console.error('Error loading warehouse:', err)
          return { data: { data: null } }
        }),
        StoreInventoryService.getAllProductsWithStoreStatus(warehouseId).catch((err) => {
          console.error('Error loading all products:', err)
          return { data: { data: [] } }
        })
      ])

      console.log('allProductsResponse:', allProductsResponse)
      console.log('allProductsResponse.data:', allProductsResponse.data)

      const warehouseData = warehouseResponse.data?.data
      const inventoryItemsMap = new Map(
        (warehouseData?.inventoryItems || []).map((item: any) => [
          item.productId,
          item
        ])
      )

      // getAllProductsWithStoreStatus đã trả về ApiResponse, nên data nằm ở allProductsResponse.data
      const allProducts = Array.isArray(allProductsResponse.data) ? allProductsResponse.data : []
      console.log('All products from getAllProductsWithStoreStatus:', allProducts.length)
      console.log('First product sample:', allProducts[0])
      
      // Filter sản phẩm đang bán: isAvailable !== false (bao gồm true, undefined, null)
      const enabledProducts = allProducts.filter((p: StoreInventoryRecord) => p.isAvailable !== false)
      
      console.log('Enabled products (isAvailable !== false):', enabledProducts.length)
      
      // Nếu không có sản phẩm nào được mark là available, mặc định tất cả đều available (new kho)
      const productsToShow = enabledProducts.length > 0 ? enabledProducts : allProducts
      console.log('Products to show:', productsToShow.length)
      
      // Map tất cả sản phẩm đang bán, merge với inventory_items để lấy quantity
      const inventory = productsToShow.map((product: StoreInventoryRecord) => {
        const inventoryItem = inventoryItemsMap.get(product.productId)
        
        return {
          id: inventoryItem?.id || product.id || product.productId,
          warehouseId: inventoryItem?.warehouseId || warehouseId,
          warehouseName: inventoryItem?.warehouseName || warehouseData?.storeName || product.storeName || `Cửa hàng ${warehouseId}`,
          productId: product.productId,
          productName: product.productName || `Sản phẩm #${product.productId}`,
          productVariantName: null,
          quantityInStock: typeof inventoryItem?.quantity === 'number' ? inventoryItem.quantity : 0, // Lấy từ inventory_items, nếu không có thì = 0
          isAvailable: product.isAvailable !== false, // Đảm bảo isAvailable = true cho sản phẩm đang bán (bao gồm true, undefined, null)
          isEnabled: inventoryItem?.isEnabled !== false,
          updatedAt: inventoryItem?.updatedAt || product.updatedAt || product.createdAt || new Date().toISOString(),
          createdAt: product.createdAt,
          productImageUrl: product.productImageUrl || null
        } as WarehouseInventory
      })

      console.log('Final inventory count:', inventory.length)
      return this.wrapResponse(inventory, 'Tồn kho cửa hàng')
    } catch (error: any) {
      console.error('Error loading warehouse inventory:', error)
      // Fallback về cách cũ nếu có lỗi
      const response = await StoreInventoryService.getStoreProducts(warehouseId, false)
      const inventory = (response.data || []).map(item => this.mapStoreInventoryToWarehouseInventory(item))
      return this.wrapResponse(inventory, 'Tồn kho cửa hàng')
    }
  }

  static async addProductToWarehouse(payload: AddProductToWarehouseRequest) {
    return StoreInventoryService.toggleProductAvailability(payload.warehouseId, payload.productId, true)
  }

  /**
   * Cập nhật số lượng tồn kho tại kho cửa hàng
   * Requirements: 2.1 - WHEN Admin updates inventory quantity THEN the System SHALL update the Inventory_Item
   */
  static async updateStoreWarehouseQuantity(
    storeId: number,
    productId: number,
    quantity: number,
    reason?: string
  ): Promise<ApiResponse<InventoryItemResponse>> {
    const response = await apiClient.put(
      `/api/warehouses/stores/${storeId}/inventory/${productId}`,
      { quantity, reason }
    )
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ApiResponse<InventoryItemResponse>
    }
    return this.wrapResponse<InventoryItemResponse>(payload, 'Cập nhật tồn kho thành công')
  }

  /**
   * Thêm sản phẩm vào kho cửa hàng với số lượng chỉ định
   * Requirements: 2.2 - WHEN Admin adds a product to a store THEN the System SHALL create an Inventory_Item
   */
  static async addProductToStoreWarehouse(
    storeId: number,
    productId: number,
    quantity: number
  ): Promise<ApiResponse<InventoryItemResponse>> {
    const response = await apiClient.post(
      `/api/warehouses/stores/${storeId}/products`,
      { productId, quantity }
    )
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ApiResponse<InventoryItemResponse>
    }
    return this.wrapResponse<InventoryItemResponse>(payload, 'Thêm sản phẩm vào kho thành công')
  }

  /**
   * Bật/tắt trạng thái enabled của sản phẩm trong kho cửa hàng
   * Admin có thể disable sản phẩm không cần bán tại cửa hàng đó
   */
  static async toggleProductEnabled(
    storeId: number,
    productId: number,
    isEnabled: boolean
  ): Promise<ApiResponse<InventoryItemResponse>> {
    const response = await apiClient.patch(
      `/api/warehouses/stores/${storeId}/inventory/${productId}/toggle`,
      null,
      { params: { isEnabled } }
    )
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload as ApiResponse<InventoryItemResponse>
    }
    return this.wrapResponse<InventoryItemResponse>(
      payload, 
      isEnabled ? 'Đã bật sản phẩm' : 'Đã tắt sản phẩm'
    )
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

  /**
   * Lấy nhãn hiển thị cho loại kho
   * Chỉ hỗ trợ 'store' - Requirements: 1.1
   */
  static getWarehouseTypeLabel(type: WarehouseType) {
    const labels: Record<WarehouseType, string> = {
      store: 'Kho cửa hàng'
    }
    return labels[type] || type
  }

  /**
   * Lấy màu hiển thị cho loại kho
   * Chỉ hỗ trợ 'store' - Requirements: 1.1
   */
  static getWarehouseTypeColor(type: WarehouseType) {
    const colors: Record<WarehouseType, string> = {
      store: 'bg-indigo-100 text-indigo-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }
}

