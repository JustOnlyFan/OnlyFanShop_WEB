'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreInventoryService, StoreInventoryRecord } from '@/services/storeInventoryService'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Package, Plus, Minus, Send } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { InventoryRequestService } from '@/services/inventoryRequestService'

interface RequestItem {
  productId: number
  productName: string
  productImageUrl?: string
  quantity: number
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

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated, user?.role, warehouseId])

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

  const filteredProducts = searchTerm.trim() ? availableProducts.filter((p) => p.productName?.toLowerCase().includes(searchTerm.toLowerCase())) : availableProducts

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
      },
    ])
  }

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setRequestItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      })
    )
  }

  const handleRemoveProduct = (productId: number) => {
    setRequestItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleSubmit = async () => {
    if (requestItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm')
      return
    }

    try {
      setSubmitting(true)
      // Create single inventory request with multiple items
      await InventoryRequestService.createRequest({
        storeId: warehouseId,
        items: requestItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        note: notes,
      })
      toast.success('Đã tạo yêu cầu nhập hàng thành công')
      router.push(`/admin/warehouses/${warehouseId}/inventory-requests`)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể tạo yêu cầu')
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
          <h1 className="text-2xl font-bold text-gray-900">Tạo yêu cầu nhập hàng</h1>
          <p className="text-sm text-gray-500">Chọn sản phẩm và số lượng cần nhập cho kho {warehouse?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Product Selection */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Chọn sản phẩm</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto p-4">
            {availableProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có sản phẩm nào được kích hoạt</p>
                <Link href={`/admin/warehouses/${warehouseId}/products`} className="text-indigo-600 hover:underline text-sm">
                  Thêm sản phẩm cho kho
                </Link>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p>Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => {
                  const isAdded = requestItems.some((item) => item.productId === product.productId)
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
                        <p className="text-xs text-gray-500">Tồn kho: {product.quantity || 0}</p>
                      </div>
                      <button
                        onClick={() => handleAddProduct(product)}
                        disabled={isAdded}
                        className={`p-2 rounded-lg transition-colors ${isAdded ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}
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
              <h3 className="font-semibold text-gray-900">Danh sách yêu cầu ({requestItems.length})</h3>
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
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleUpdateQuantity(item.productId, -1)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
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
            disabled={requestItems.length === 0 || submitting}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
          >
            {submitting ? <LoadingSpinner /> : <Send className="w-5 h-5" />}
            Gửi yêu cầu nhập hàng
          </button>
        </div>
      </div>
    </div>
  )
}
