'use client'

import { useState, useEffect, useMemo } from 'react'
import { Warehouse as WarehouseIcon, AlertCircle, Package, ChevronDown } from 'lucide-react'
import { Warehouse, WarehouseService, WarehouseInventory } from '@/services/warehouseService'
import { StoreInventoryService, StoreInventoryRecord } from '@/services/storeInventoryService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export interface SourceWarehouseWithInventory extends Warehouse {
  inventory?: StoreInventoryRecord[]
  totalProducts?: number
  totalQuantity?: number
}

interface SourceWarehouseSelectorProps {
  /** ID của kho đích (sẽ bị loại trừ khỏi danh sách) */
  destinationWarehouseId: number
  /** ID kho nguồn đã chọn */
  selectedSourceWarehouseId: number | null
  /** Callback khi chọn kho nguồn */
  onSourceWarehouseChange: (warehouseId: number | null, inventory?: StoreInventoryRecord[]) => void
  /** Hiển thị số lượng tồn kho */
  showInventoryCount?: boolean
  /** Label tùy chỉnh */
  label?: string
  /** Placeholder tùy chỉnh */
  placeholder?: string
  /** Bắt buộc chọn */
  required?: boolean
  /** Disabled */
  disabled?: boolean
  /** Class name tùy chỉnh */
  className?: string
}

/**
 * Component chọn kho nguồn cho Transfer Request
 * Requirements: 3.1, 8.3
 * - Dropdown hiển thị tất cả store warehouses (trừ destination)
 * - Hiển thị available quantity cho mỗi warehouse
 */
export function SourceWarehouseSelector({
  destinationWarehouseId,
  selectedSourceWarehouseId,
  onSourceWarehouseChange,
  showInventoryCount = true,
  label = 'Chọn kho nguồn',
  placeholder = '-- Chọn kho nguồn --',
  required = true,
  disabled = false,
  className = ''
}: SourceWarehouseSelectorProps) {
  const [loading, setLoading] = useState(true)
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [warehouses, setWarehouses] = useState<SourceWarehouseWithInventory[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load all active warehouses on mount
  useEffect(() => {
    loadWarehouses()
  }, [destinationWarehouseId])

  const loadWarehouses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await WarehouseService.getAllActiveWarehouses()
      const allWarehouses = Array.isArray(response.data) ? response.data : []
      
      // Filter out destination warehouse and inactive warehouses
      const availableWarehouses = allWarehouses.filter(
        w => w.storeLocationId !== destinationWarehouseId && 
             w.id !== destinationWarehouseId && 
             w.isActive
      )
      
      setWarehouses(availableWarehouses)
    } catch (err: any) {
      setError('Không thể tải danh sách kho')
      console.error('Error loading warehouses:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load inventory when source warehouse is selected
  const loadSourceInventory = async (warehouseId: number) => {
    try {
      setLoadingInventory(true)
      const storeId = warehouses.find(w => w.id === warehouseId || w.storeLocationId === warehouseId)?.storeLocationId || warehouseId
      const response = await StoreInventoryService.getStoreProducts(storeId, true)
      const inventory = Array.isArray(response.data) ? response.data : []
      // Only return products with available quantity
      return inventory.filter(p => p.isAvailable && (p.quantity || 0) > 0)
    } catch (err) {
      console.error('Error loading source inventory:', err)
      return []
    } finally {
      setLoadingInventory(false)
    }
  }

  const handleWarehouseChange = async (warehouseId: number | null) => {
    if (warehouseId) {
      const inventory = await loadSourceInventory(warehouseId)
      onSourceWarehouseChange(warehouseId, inventory)
    } else {
      onSourceWarehouseChange(null, [])
    }
  }

  // Get selected warehouse info
  const selectedWarehouse = useMemo(() => {
    return warehouses.find(w => w.id === selectedSourceWarehouseId || w.storeLocationId === selectedSourceWarehouseId)
  }, [warehouses, selectedSourceWarehouseId])

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <WarehouseIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">{label}</h3>
          {required && <span className="text-red-500">*</span>}
        </div>
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <WarehouseIcon className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">{label}</h3>
        {required && <span className="text-red-500">*</span>}
      </div>
      
      <p className="text-sm text-gray-500 mb-3">
        Chọn kho cửa hàng nơi hàng sẽ được chuyển đi. Chỉ hiển thị các kho có sản phẩm trong kho.
      </p>

      {error ? (
        <div className="flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          <div className="relative">
            <select
              value={selectedSourceWarehouseId || ''}
              onChange={(e) => handleWarehouseChange(e.target.value ? Number(e.target.value) : null)}
              disabled={disabled || loadingInventory}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed pr-10"
            >
              <option value="">{placeholder}</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.storeLocationId || wh.id}>
                  {wh.name} {wh.city ? `(${wh.city})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {warehouses.length === 0 && (
            <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Không có kho nguồn khả dụng. Vui lòng kiểm tra lại danh sách kho.</span>
            </div>
          )}

          {loadingInventory && (
            <div className="mt-3 flex items-center gap-2 text-gray-500 text-sm">
              <LoadingSpinner />
              <span>Đang tải tồn kho...</span>
            </div>
          )}

          {selectedWarehouse && !loadingInventory && (
            <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-indigo-700">
                <span className="font-medium">Kho nguồn đã chọn:</span> {selectedWarehouse.name}
                {selectedWarehouse.addressLine1 && ` - ${selectedWarehouse.addressLine1}`}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SourceWarehouseSelector
