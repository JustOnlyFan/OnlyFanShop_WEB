'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { WarehouseService, Warehouse, WarehouseInventory } from '@/services/warehouseService'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, TrendingUp, TrendingDown, Search, X, Maximize2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ProductService, ProductFullDetails } from '@/services/productService'

export default function WarehouseInventoryPage() {
  const router = useRouter()
  const params = useParams()
  const warehouseId = parseInt(params.id as string)
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [inventory, setInventory] = useState<WarehouseInventory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [productLoading, setProductLoading] = useState(false)
  const [productDetail, setProductDetail] = useState<ProductFullDetails | null>(null)
  const [showImagePreview, setShowImagePreview] = useState(false)

  const openProductModal = async (productId: number) => {
    try {
      setShowProductModal(true)
      setProductLoading(true)
      setProductDetail(null)
      const res = await ProductService.getProductById(productId)
      const data = res.data as any
      // Normalize a few fields for safe display
      const normalized: ProductFullDetails = {
        id: data.id || data.productID || productId,
        productName: data.productName,
        briefDescription: data.briefDescription || '',
        fullDescription: data.fullDescription || data.briefDescription || '',
        technicalSpecifications: data.technicalSpecifications || '',
        price: data.price,
        imageURL: data.imageURL || '/placeholder-product.png',
        brand: data.brand ? { brandID: data.brand.brandID, name: data.brand.name } : undefined,
        category: data.category ? { id: data.category.id, name: data.category.name } : undefined,
        isActive: data.active ?? true,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || ''
      }
      setProductDetail(normalized)
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải thông tin sản phẩm')
    } finally {
      setProductLoading(false)
    }
  }

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadData()
  }, [hasHydrated, isAuthenticated, user, router, warehouseId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [warehouseRes, inventoryRes] = await Promise.all([
        WarehouseService.getWarehouseById(warehouseId).catch(err => {
          console.error('Error loading warehouse:', err)
          return { data: null }
        }),
        WarehouseService.getWarehouseInventory(warehouseId).catch(err => {
          console.error('Error loading inventory:', err)
          return { data: [] }
        })
      ])
      setWarehouse(warehouseRes.data)
      setInventory(inventoryRes.data || [])
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

  const filteredInventory = inventory.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.warehouseName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalItems = inventory.reduce((sum, item) => sum + item.quantityInStock, 0)
  const totalProducts = new Set(inventory.map(item => item.productId)).size

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/warehouses" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Package className="w-8 h-8 mr-3 text-indigo-600" />
                Tồn kho: {warehouse?.name}
              </h1>
              <p className="text-gray-600 mt-1">Mã kho: {warehouse?.code}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng số lượng</p>
                <p className="text-2xl font-bold text-green-600">{totalItems}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Sản phẩm hết hàng</p>
                <p className="text-2xl font-bold text-red-600">
                  {inventory.filter(item => item.quantityInStock === 0).length}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biến thể</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => openProductModal(item.productId)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                        title="Xem chi tiết sản phẩm"
                      >
                        {item.productName}
                      </button>
                      <div className="text-xs text-gray-500">ID: {item.productId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.productVariantName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.quantityInStock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.quantityInStock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.quantityInStock > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có sản phẩm nào trong kho</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProductModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin sản phẩm</h3>
              <button onClick={() => setShowProductModal(false)} className="p-2 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              {productLoading && (
                <div className="py-12 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}
              {!productLoading && productDetail && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <div className="w-full max-w-[320px] mx-auto">
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white" style={{ paddingTop: '125%' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={productDetail.imageURL}
                          alt={productDetail.productName}
                          className="absolute inset-0 w-full h-full object-contain bg-white"
                          onClick={() => setShowImagePreview(true)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowImagePreview(true)}
                          className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-black/60 text-white hover:bg-black/70"
                          title="Xem lớn"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          Phóng to
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{productDetail.productName}</h4>
                      <p className="text-sm text-gray-500 mt-1">Mã: {productDetail.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Thương hiệu:</span>
                        <span className="ml-2 font-medium">{productDetail.brand?.name || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Danh mục:</span>
                        <span className="ml-2 font-medium">{productDetail.category?.name || '-'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Giá:</span>
                        <span className="ml-2 font-semibold text-green-700">{productDetail.price.toLocaleString('vi-VN')} ₫</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Trạng thái:</span>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${productDetail.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{productDetail.isActive ? 'Đang bán' : 'Tạm dừng'}</span>
                      </div>
                    </div>
                    {productDetail.briefDescription && (
                      <div>
                        <p className="text-gray-800 text-sm">{productDetail.briefDescription}</p>
                      </div>
                    )}
                    {productDetail.technicalSpecifications && (
                      <div>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{productDetail.technicalSpecifications}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Fullscreen Image Preview */}
      {showImagePreview && productDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowImagePreview(false)} />
          <div className="relative max-w-5xl w-full px-4">
            <button
              onClick={() => setShowImagePreview(false)}
              className="absolute -top-10 right-4 p-2 text-white/80 hover:text-white"
              aria-label="Đóng"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={productDetail.imageURL} alt={productDetail.productName} className="w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
 
    </div>
  )
}

