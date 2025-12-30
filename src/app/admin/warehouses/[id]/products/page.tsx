'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreInventoryService, StoreInventoryRecord } from '@/services/storeInventoryService'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Box, Check, Package } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function WarehouseProductsPage() {
  const params = useParams()
  const router = useRouter()
  const warehouseId = Number(params.id)
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [warehouse, setWarehouse] = useState<StoreLocation | null>(null)
  const [allProducts, setAllProducts] = useState<StoreInventoryRecord[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all')

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

      // Load all products with store status
      const productsResp = await StoreInventoryService.getAllProductsWithStoreStatus(warehouseId)
      const list = Array.isArray(productsResp.data) ? productsResp.data : []
      setAllProducts(list)

      // Pre-select enabled products; treat undefined as enabled so kho mới mặc định bật hết
      let enabledIds = new Set(
        list
          .filter((p) => p.isAvailable !== false)
          .map((p) => p.productId)
      )
      // If backend marks none as available (new kho), default bật toàn bộ
      if (enabledIds.size === 0 && list.length > 0) {
        enabledIds = new Set(list.map((p) => p.productId))
      }
      setSelectedProductIds(enabledIds)
    } catch (e: any) {
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    let list = allProducts
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter((p) => p.productName?.toLowerCase().includes(q))
    }
    if (statusFilter === 'enabled') {
      list = list.filter((p) => selectedProductIds.has(p.productId))
    } else if (statusFilter === 'disabled') {
      list = list.filter((p) => !selectedProductIds.has(p.productId))
    }
    return list
  }, [allProducts, searchTerm, statusFilter, selectedProductIds])

  const handleToggleSelect = (productId: number) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const allIds = new Set(filteredProducts.map((p) => p.productId))
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev)
      allIds.forEach((id) => newSet.add(id))
      return newSet
    })
  }

  const handleDeselectAll = () => {
    const filteredIds = new Set(filteredProducts.map((p) => p.productId))
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev)
      filteredIds.forEach((id) => newSet.delete(id))
      return newSet
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await StoreInventoryService.updateStoreProducts(warehouseId, Array.from(selectedProductIds))
      toast.success('Đã cập nhật danh sách sản phẩm')
      loadData()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể cập nhật')
    } finally {
      setSaving(false)
    }
  }

  // Check if there are changes
  const hasChanges = useMemo(() => {
    const originalIds = new Set(allProducts.filter((p) => p.isAvailable).map((p) => p.productId))
    if (originalIds.size !== selectedProductIds.size) return true
    for (const id of selectedProductIds) {
      if (!originalIds.has(id)) return true
    }
    return false
  }, [allProducts, selectedProductIds])

  const enabledCount = selectedProductIds.size
  const disabledCount = Math.max(allProducts.length - enabledCount, 0)

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
        <span className="text-gray-900 font-medium">Quản lý sản phẩm</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" aria-label="Quay lại">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500">Kho hàng: <span className="font-semibold text-gray-800">{warehouse?.name}</span></p>
            <h1 className="text-2xl font-bold text-gray-900">Bật/tắt sản phẩm đang bán tại kho</h1>
            <p className="text-sm text-gray-500">Mặc định kho mới sẽ có sẵn toàn bộ sản phẩm. Tắt sản phẩm để không bán tại kho này.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">Tổng: {allProducts.length}</span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">Đang bán: {enabledCount}</span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Đã tắt: {disabledCount}</span>
            {hasChanges && <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700">Chưa lưu thay đổi</span>}
          </div>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
          >
            {saving ? <LoadingSpinner /> : <Check className="w-5 h-5" />}
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl border ${
                statusFilter === 'all' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('enabled')}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl border ${
                statusFilter === 'enabled' ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Đang bán
            </button>
            <button
              onClick={() => setStatusFilter('disabled')}
              className={`px-4 py-2.5 text-sm font-medium rounded-xl border ${
                statusFilter === 'disabled' ? 'border-gray-300 bg-gray-100 text-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Đã tắt
            </button>
            <div className="h-10 w-px bg-gray-200 hidden lg:block" />
            <button onClick={handleSelectAll} className="px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
              Bật tất cả (đang lọc)
            </button>
            <button onClick={handleDeselectAll} className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Tắt tất cả (đang lọc)
            </button>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">Chọn sản phẩm được phép bán; bỏ chọn để tắt bán tại kho này.</p>
      </div>

      {/* Product Grid */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Box className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>{allProducts.length === 0 ? 'Chưa có sản phẩm nào trong hệ thống' : 'Không tìm thấy sản phẩm phù hợp'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product, idx) => {
              const isSelected = selectedProductIds.has(product.productId)
              const isDisabled = !isSelected
              return (
                <motion.div
                  key={product.productId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => handleToggleSelect(product.productId)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`absolute top-3 right-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300 bg-white'}`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  {/* Product Image */}
                  <div className="w-full aspect-square rounded-lg bg-gray-100 mb-3 overflow-hidden">
                    {product.productImageUrl ? (
                      <Image src={product.productImageUrl} alt={product.productName || 'product'} width={200} height={200} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{product.productName}</h4>
                  <p className="text-sm text-indigo-600 font-semibold">{product.productPrice?.toLocaleString('vi-VN')}đ</p>
                  {product.quantity != null && product.quantity > 0 && <p className="text-xs text-gray-500 mt-1">Tồn kho: {product.quantity}</p>}
                  <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border">
                    <span className={`h-2 w-2 rounded-full ${isDisabled ? 'bg-gray-400' : 'bg-green-500'}`} />
                    {isDisabled ? 'Đã tắt bán' : 'Đang bán tại kho'}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
