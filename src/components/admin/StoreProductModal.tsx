'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Box, CheckCircle2, XCircle } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { StoreInventoryService, StoreInventoryRecord } from '@/services/storeInventoryService'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface StoreProductModalProps {
  store: StoreLocation & { id?: number }
  onClose: () => void
  onStatsChange?: (storeId: number, stats: { available: number; total: number }) => void
}

export function StoreProductModal({ store, onClose, onStatsChange }: StoreProductModalProps) {
  const storeId = store.id ?? (store as any).locationID
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<StoreInventoryRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)

  useEffect(() => {
    if (!storeId) return
    loadProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId])

  const loadProducts = async () => {
    if (!storeId) return
    try {
      setLoading(true)
      const response = await StoreInventoryService.getStoreProducts(storeId, true)
      const list = Array.isArray(response.data) ? response.data : []
      setProducts(list)
      emitStats(list)
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách sản phẩm của cửa hàng')
    } finally {
      setLoading(false)
    }
  }

  const emitStats = (list: StoreInventoryRecord[]) => {
    if (!storeId || !onStatsChange) return
    const available = list.filter(item => item.isAvailable).length
    onStatsChange(storeId, { available, total: list.length })
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchSearch = product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
      const matchStatus = showOnlyAvailable ? product.isAvailable : true
      return matchSearch && matchStatus
    })
  }, [products, searchTerm, showOnlyAvailable])

  const handleToggle = async (product: StoreInventoryRecord) => {
    if (!storeId) return
    try {
      await StoreInventoryService.toggleProductAvailability(storeId, product.productId, !product.isAvailable)
      setProducts(prev =>
        prev.map(item =>
          item.productId === product.productId
            ? { ...item, isAvailable: !item.isAvailable }
            : item
        )
      )
      emitStats(
        products.map(item =>
          item.productId === product.productId ? { ...item, isAvailable: !item.isAvailable } : item
        )
      )
      toast.success(!product.isAvailable ? 'Đã bật bán sản phẩm' : 'Đã tắt bán sản phẩm')
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật trạng thái sản phẩm')
    }
  }

  if (!storeId) {
    return null
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Quản lý sản phẩm của cửa hàng</p>
              <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
              <p className="text-sm text-gray-500">{StoreLocationService.formatStoreAddress(store)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Chỉ hiển thị sản phẩm đang bán</span>
              </label>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-0">
            {loading ? (
              <div className="py-16 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Box className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Không có sản phẩm nào phù hợp điều kiện lọc.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="relative w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                        {product.productImageUrl ? (
                          <Image
                            src={product.productImageUrl}
                            alt={product.productName || 'product'}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <Box className="w-8 h-8 text-gray-400 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-semibold text-gray-900 line-clamp-1">
                          {product.productName || `Sản phẩm #${product.productId}`}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ID: {product.productId}
                        </p>
                        <p className="text-xs text-gray-400">
                          Lần cập nhật cuối: {product.updatedAt ? new Date(product.updatedAt).toLocaleString('vi-VN') : 'Chưa có'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-full text-sm font-medium border"
                        style={{
                          backgroundColor: product.isAvailable ? '#dcfce7' : '#fee2e2',
                          borderColor: product.isAvailable ? '#86efac' : '#fecaca',
                          color: product.isAvailable ? '#15803d' : '#b91c1c'
                        }}
                      >
                        {product.isAvailable ? 'Đang bán' : 'Đang tắt'}
                      </div>
                      <button
                        onClick={() => handleToggle(product)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
                          product.isAvailable
                            ? 'border-red-100 text-red-600 hover:bg-red-50'
                            : 'border-green-100 text-green-600 hover:bg-green-50'
                        } transition-colors`}
                      >
                        {product.isAvailable ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            Tắt bán
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Bật bán
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 font-medium"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


