'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreInventoryService, StoreInventoryRecord } from '@/services/storeInventoryService'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { WarehouseService, Warehouse } from '@/services/warehouseService'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Package, Plus, Minus, Send, Warehouse as WarehouseIcon, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { InventoryRequestService } from '@/services/inventoryRequestService'

interface RequestItem {
  productId: number
  productName: string
  productImageUrl?: string
  quantity: number
  /** Số lượng có sẵn tại kho nguồn */
  availableQuantity?: number
}

export default function NewWarehouseInventoryRequestPage() {
  const params = useParams()
  const router = useRouter()
  const warehouseId = Number(params.id)
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [warehouse, setWarehouse] = useState<StoreLocation | null>(null)
  const [availableProducts, setAvailableProducts] = useState<StoreInventoryRecord[]>([])
  const [requestItems, setRequestItems] = useState<RequestItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [notes, setNotes] = useState('')
  
  // Source warehouse selection - Requirements: 3.1, 8.3
  const [allWarehouses, setAllWarehouses] = useState<Warehouse[]>([])
  const [sourceWarehouseId, setSourceWarehouseId] = useState<number | null>(null)
  const [sourceWarehouseInventory, setSourceWarehouseInventory] = useState<StoreInventoryRecord[]>([])
  const [loadingSourceInventory, setLoadingSourceInventory] = useState(false)

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated, user?.role, warehouseId])

  // Load source warehouse inventory when source warehouse changes
  useEffect(() => {
    if (sourceWarehouseId) {
      loadSourceWarehouseInventory(sourceWarehouseId)
    } else {
      setSourceWarehouseInventory([])
    }
    // Clear request items when source warehouse changes
    setRequestItems([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceWarehouseId])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load warehouse (store) info
      const storeResp = await StoreLocationService.getStoreLocations()
      const stores = Array.isArray(storeResp.data) ? storeResp.data : storeResp.data?.stores || []
      const found = stores.find((s: any) => (s.id ?? s.locationID) === warehouseId)
      if (found) {
        setWarehouse({ ...found, id: found.id ?? found.locationID })
      }

      // Load all active warehouses for source selection - Requirements: 8.3
      try {
        const warehousesResp = await WarehouseService.getAllActiveWarehouses()
        const warehouses = Array.isArray(warehousesResp.data) ? warehousesResp.data : []
        // Exclude current warehouse (destination) from source options
        setAllWarehouses(warehouses.filter(w => w.storeLocationId !== warehouseId && w.isActive))
      } catch {
        setAllWarehouses([])
      }

      // Load products enabled for this warehouse
      const productsResp = await StoreInventoryService.getStoreProducts(warehouseId, true)
      const list = Array.isArray(productsResp.data) ? productsResp.data : []
      // Only show products that are enabled (isAvailable = true)
      setAvailableProducts(list.filter((p) => p.isAvailable))
    } catch (e: any) {
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load inventory from source warehouse to show available quantities
   * Requirements: 3.2 - Validate source warehouse has sufficient quantity
   */
  const loadSourceWarehouseInventory = async (warehouseId: number) => {
    try {
      setLoadingSourceInventory(true)
      const resp = await StoreInventoryService.getStoreProducts(warehouseId, true)
      const list = Array.isArray(resp.data) ? resp.data : []
      setSourceWarehouseInventory(list.filter((p) => p.isAvailable && (p.quantity || 0) > 0))
    } catch {
      setSourceWarehouseInventory([])
    } finally {
      setLoadingSourceInventory(false)
    }
  }

  // Get available warehouses for source selection (exclude destination)
  const availableSourceWarehouses = useMemo(() => {
    return allWarehouses.filter(w => w.storeLocationId !== warehouseId)
  }, [allWarehouses, warehouseId])

  // Get selected source warehouse info
  const selectedSourceWarehouse = useMemo(() => {
    return allWarehouses.find(w => w.id === sourceWarehouseId || w.storeLocationId === sourceWarehouseId)
  }, [allWarehouses, sourceWarehouseId])

  const filteredProducts = searchTerm.trim() ? sourceWarehouseInventory.filter((p) => p.productName?.toLowerCase().includes(searchTerm.toLowerCase())) : sourceWarehouseInventory

  const handleAddProduct = (product: StoreInventoryRecord) => {
    const exists = requestItems.find((item) => item.productId === product.productId)
    if (exists) {
      toast.error('Sản phẩm đã có trong danh sách')
      return
    }
    setRequestItems((prev) => [
      ...prev,
      {
        productId: product.productId,
        productName: product.productName || `Sản phẩm #${product.productId}`,
        productImageUrl: product.productImageUrl || undefined,
        quantity: 1,
        availableQuantity: product.quantity || 0,
      },
    ])
  }

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setRequestItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + delta)
          // Validate against available quantity - Requirements: 3.2
          if (item.availableQuantity && newQty > item.availableQuantity) {
            toast.error(`Số lượng không được vượt quá ${item.availableQuantity} (tồn kho nguồn)`)
            return item
          }
          return { ...item, quantity: newQty }
        }
        return item
      })
    )
  }

  const handleSetQuantity = (productId: number, value: string) => {
    const newQty = parseInt(value) || 1
    setRequestItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          // Validate against available quantity - Requirements: 3.2
          if (item.availableQuantity && newQty > item.availableQuantity) {
            toast.error(`Số lượng không được vượt quá ${item.availableQuantity} (tồn kho nguồn)`)
            return { ...item, quantity: item.availableQuantity }
          }
          return { ...item, quantity: Math.max(1, newQty) }
        }
        return item
      })
    )
  }

  const handleRemoveProduct = (productId: number) => {
    setRequestItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleSubmit = async () => {
    // Validate source warehouse is selected - Requirements: 3.1
    if (!sourceWarehouseId) {
      toast.error('Vui lòng chọn kho nguồn')
      return
    }

    if (requestItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm')
      return
    }

    // Validate quantities don't exceed available - Requirements: 3.2
    const invalidItems = requestItems.filter(item => 
      item.availableQuantity && item.quantity > item.availableQuantity
    )
    if (invalidItems.length > 0) {
      toast.error('Một số sản phẩm có số lượng vượt quá tồn kho nguồn')
      return
    }

    try {
      setSubmitting(true)
      // Create transfer request with source warehouse - Requirements: 3.1
      await InventoryRequestService.createTransferRequest(
        warehouseId,
        sourceWarehouseId,
        requestItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        notes
      )
      toast.success('Đã tạo yêu cầu điều chuyển hàng thành công')
      router.push(`/admin/warehouses/${warehouseId}/inventory-requests`)
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || 'Không thể tạo yêu cầu')
    } finally {
      setSubmitting(false)
    }
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/warehouses" className="text-gray-500 hover:text-indigo-600 transition-colors">
          Kho hàng
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">{warehouse?.name || 'Chi tiết'}</span>
        <span className="text-gray-400">/</span>
        <Link href={`/admin/warehouses/${warehouseId}/inventory-requests`} className="text-gray-500 hover:text-indigo-600 transition-colors">
          Yêu cầu nhập hàng
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Tạo mới</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo yêu cầu điều chuyển hàng</h1>
          <p className="text-sm text-gray-500">Chọn kho nguồn và sản phẩm cần điều chuyển đến kho {warehouse?.name}</p>
        </div>
      </div>

      {/* Source Warehouse Selection - Requirements: 3.1, 8.3 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <WarehouseIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Chọn kho nguồn</h3>
          <span className="text-red-500">*</span>
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Chọn kho cửa hàng nơi hàng sẽ được chuyển đi. Chỉ hiển thị các kho có sản phẩm trong kho.
        </p>
        <select
          value={sourceWarehouseId || ''}
          onChange={(e) => setSourceWarehouseId(e.target.value ? Number(e.target.value) : null)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          <option value="">-- Chọn kho nguồn --</option>
          {availableSourceWarehouses.map((wh) => (
            <option key={wh.id} value={wh.storeLocationId || wh.id}>
              {wh.name} {wh.city ? `(${wh.city})` : ''}
            </option>
          ))}
        </select>
        {availableSourceWarehouses.length === 0 && (
          <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Không có kho nguồn khả dụng. Vui lòng kiểm tra lại danh sách kho.</span>
          </div>
        )}
        {selectedSourceWarehouse && (
          <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-700">
              <span className="font-medium">Kho nguồn đã chọn:</span> {selectedSourceWarehouse.name}
              {selectedSourceWarehouse.addressLine1 && ` - ${selectedSourceWarehouse.addressLine1}`}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Product Selection from Source Warehouse */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">
              Chọn sản phẩm từ kho nguồn
              {selectedSourceWarehouse && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({selectedSourceWarehouse.name})
                </span>
              )}
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!sourceWarehouseId}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto p-4">
            {!sourceWarehouseId ? (
              <div className="py-12 text-center text-gray-500">
                <WarehouseIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Vui lòng chọn kho nguồn trước</p>
              </div>
            ) : loadingSourceInventory ? (
              <div className="py-12 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : sourceWarehouseInventory.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Kho nguồn không có sản phẩm khả dụng</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p>Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => {
                  const isAdded = requestItems.some((item) => item.productId === product.productId)
                  const availableQty = product.quantity || 0
                  return (
                    <div key={product.productId} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isAdded ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {product.productImageUrl ? (
                          <Image src={product.productImageUrl} alt="" width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{product.productName}</p>
                        <p className="text-xs text-green-600 font-medium">Có sẵn: {availableQty}</p>
                      </div>
                      <button
                        onClick={() => handleAddProduct(product)}
                        disabled={isAdded || availableQty === 0}
                        className={`p-2 rounded-lg transition-colors ${isAdded || availableQty === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Request Items */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Danh sách điều chuyển ({requestItems.length})</h3>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              {requestItems.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p>Chưa chọn sản phẩm nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {requestItems.map((item) => (
                    <motion.div key={item.productId} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.productImageUrl ? (
                          <Image src={item.productImageUrl} alt="" width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500">Có sẵn: {item.availableQuantity || 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleUpdateQuantity(item.productId, -1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.availableQuantity || 999}
                          value={item.quantity}
                          onChange={(e) => handleSetQuantity(item.productId, e.target.value)}
                          className="w-16 text-center font-semibold border border-gray-200 rounded-lg py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button onClick={() => handleUpdateQuantity(item.productId, 1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => handleRemoveProduct(item.productId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú cho yêu cầu này..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!sourceWarehouseId || requestItems.length === 0 || submitting}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
          >
            {submitting ? <LoadingSpinner /> : <Send className="w-5 h-5" />}
            Gửi yêu cầu điều chuyển
          </button>
        </div>
      </div>
    </div>
  )
}
