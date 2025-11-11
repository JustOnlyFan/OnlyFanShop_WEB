'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { WarehouseService, Warehouse, TransferStockRequest } from '@/services/warehouseService'
import { ProductService } from '@/services/productService'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Package, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function WarehouseTransferPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [formData, setFormData] = useState<TransferStockRequest>({
    fromWarehouseId: 0,
    toWarehouseId: 0,
    productId: 0,
    quantity: 0,
    note: ''
  })
  const [searchProduct, setSearchProduct] = useState('')

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
      router.push('/')
      return
    }
    loadData()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const warehousesRes = await WarehouseService.getAllWarehouses().catch(err => {
        console.error('Error loading warehouses:', err)
        return { data: [] }
      })
      setWarehouses(warehousesRes.data || [])
      
      // Load products from homepage API
      try {
        const productsRes = await ProductService.getHomepage({ page: 1, size: 100 })
        setProducts(productsRes.data?.products || [])
      } catch (err: any) {
        console.error('Error loading products:', err)
        setProducts([])
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      if (error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.')
      } else {
        toast.error(error.message || 'Không thể tải dữ liệu')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.productName?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const fromWarehouse = warehouses.find(w => w.id === formData.fromWarehouseId)
  const toWarehouse = warehouses.find(w => w.id === formData.toWarehouseId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (formData.fromWarehouseId === formData.toWarehouseId) {
        toast.error('Kho nguồn và kho đích không được trùng nhau')
        return
      }
      if (formData.quantity <= 0) {
        toast.error('Số lượng phải lớn hơn 0')
        return
      }
      await WarehouseService.transferStock(formData)
      toast.success('Chuyển kho thành công')
      setFormData({
        fromWarehouseId: 0,
        toWarehouseId: 0,
        productId: 0,
        quantity: 0,
        note: ''
      })
    } catch (error: any) {
      toast.error(error.message || 'Không thể chuyển kho')
    }
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/warehouses" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ArrowRight className="w-8 h-8 mr-3 text-indigo-600" />
            Chuyển kho
          </h1>
          <p className="text-gray-600 mt-1">Chuyển sản phẩm giữa các kho</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* From Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kho nguồn *</label>
              <select
                required
                value={formData.fromWarehouseId}
                onChange={(e) => setFormData({ ...formData, fromWarehouseId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="0">Chọn kho nguồn</option>
                {warehouses.filter(w => w.isActive).map(wh => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({WarehouseService.getWarehouseTypeLabel(wh.type)})
                  </option>
                ))}
              </select>
            </div>

            {/* To Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kho đích *</label>
              <select
                required
                value={formData.toWarehouseId}
                onChange={(e) => setFormData({ ...formData, toWarehouseId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="0">Chọn kho đích</option>
                {warehouses
                  .filter(w => w.isActive && w.id !== formData.fromWarehouseId)
                  .map(wh => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({WarehouseService.getWarehouseTypeLabel(wh.type)})
                    </option>
                  ))}
              </select>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sản phẩm *</label>
              <div className="mb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="0">Chọn sản phẩm</option>
                {filteredProducts.map(product => {
                  const productId = product.productID || product.id
                  const productName = product.productName || product.name
                  return (
                    <option key={productId} value={productId}>
                      {productName}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ghi chú về việc chuyển kho..."
              />
            </div>

            {/* Transfer Info */}
            {(fromWarehouse || toWarehouse) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Thông tin chuyển kho:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {fromWarehouse && (
                    <div>
                      <span className="font-medium">Từ:</span> {fromWarehouse.name} ({WarehouseService.getWarehouseTypeLabel(fromWarehouse.type)})
                    </div>
                  )}
                  {toWarehouse && (
                    <div>
                      <span className="font-medium">Đến:</span> {toWarehouse.name} ({WarehouseService.getWarehouseTypeLabel(toWarehouse.type)})
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Link
                href="/admin/warehouses"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Chuyển kho
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

