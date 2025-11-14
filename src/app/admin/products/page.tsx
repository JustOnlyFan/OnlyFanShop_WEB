'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import ProductAdminService from '@/services/productAdminService'
import { ProductService } from '@/services/productService'
import { WarehouseService } from '@/services/warehouseService'
import { OrderService } from '@/services/orderService'
import { ProductDTO, Brand, Category } from '@/types'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Power, 
  PowerOff, 
  Search,
  ArrowLeft,
  Filter,
  Upload,
  Package,
  TrendingUp,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { ProductManagementModal } from '@/components/admin/ProductManagementModal'
import { ProductViewModal } from '@/components/admin/ProductViewModal'

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null)
  const [viewingProduct, setViewingProduct] = useState<ProductDTO | null>(null)
  const [productStats, setProductStats] = useState<Record<number, { total: number; sold: number }>>({})
  
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadInitialData()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadBrands(), loadCategories()])
      await loadProducts(true)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async (withStats = false) => {
    try {
      const data = await ProductAdminService.getProductList({
        page: 1,
        size: 24,
        sortBy: 'productID',
        order: 'DESC',
        keyword: searchTerm || undefined,
        brandId: selectedBrand,
        categoryId: selectedCategory
      })
      const list = data.products || []
      setProducts(list)
      if (withStats) {
        await loadProductStats(list)
      }
      return list
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách sản phẩm')
    }
  }

  const loadProductStats = async (productList: ProductDTO[]) => {
    if (!productList.length) {
      setProductStats({})
      return
    }

    try {
      const statsMap: Record<number, { total: number; sold: number }> = {}
      const productIds = productList
        .map((p) => Number(p.productID || p.id))
        .filter((id): id is number => Boolean(id))

      productIds.forEach((id) => {
        if (!statsMap[id]) {
          statsMap[id] = { total: 0, sold: 0 }
        }
      })

      // Inventory across warehouses
      try {
        const warehousesRes = await WarehouseService.getAllWarehouses()
        const warehouses = (warehousesRes.data || []).map((warehouse: any, idx: number) => ({
          ...warehouse,
          id: warehouse.id ?? warehouse.locationID ?? warehouse.warehouseID ?? idx
        }))
        await Promise.all(
          warehouses.map(async (warehouse) => {
            const warehouseId = warehouse.id
            if (!warehouseId) return
            try {
              const invRes = await WarehouseService.getWarehouseInventory(warehouseId)
              const inventory = invRes.data || []
              inventory.forEach((item: any) => {
                const pid = Number(item.productId)
                if (!pid || !productIds.includes(pid)) return
                if (!statsMap[pid]) statsMap[pid] = { total: 0, sold: 0 }
                statsMap[pid].total += item.quantityInStock || 0
              })
            } catch (err) {
              // Ignore individual warehouse errors
            }
          })
        )
      } catch (error) {
        console.error('Failed to load warehouse inventory:', error)
      }

      // Sold quantity from orders
      try {
        const ordersRes = await OrderService.getAllOrders({})
        const ordersData: any = ordersRes.data || []
        const orders = Array.isArray(ordersData)
          ? ordersData
          : ordersData?.orders || []

        orders.forEach((order: any) => {
          if (order.orderStatus !== 'DELIVERED') return
          const items = order.items || []
          items.forEach((item: any) => {
            const pid = Number(item.productId)
            if (!pid || !productIds.includes(pid)) return
            if (!statsMap[pid]) statsMap[pid] = { total: 0, sold: 0 }
            statsMap[pid].sold += item.quantity || 0
          })
        })
      } catch (error) {
        console.error('Failed to load sold quantity:', error)
      }

      setProductStats(statsMap)
    } catch (error) {
      console.error('Failed to compute product stats:', error)
    }
  }

  const loadBrands = async () => {
    try {
      const response = await ProductService.getBrands()
      setBrands(response.data || [])
    } catch (error: any) {
      console.error('Failed to load brands:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await ProductService.getCategories()
      setCategories(response.data || [])
    } catch (error: any) {
      console.error('Failed to load categories:', error)
    }
  }

  useEffect(() => {
    if (!hasHydrated) return
    const handler = setTimeout(() => {
      loadProducts(true)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm, selectedBrand, selectedCategory, hasHydrated])

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleEditProduct = (product: ProductDTO) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleViewProduct = (product: ProductDTO) => {
    setViewingProduct(product)
    setShowViewModal(true)
  }

  const handleToggleActive = async (product: ProductDTO) => {
    const productID = product.productID || product.id
    if (!productID) return
    
    try {
      await ProductAdminService.toggleActive(productID, !product.active)
      toast.success(`Sản phẩm đã được ${!product.active ? 'kích hoạt' : 'vô hiệu hóa'}`)
      loadProducts(true)
    } catch (error: any) {
      toast.error(error.message || 'Không thể thay đổi trạng thái')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingProduct(null)
    loadProducts(true)
  }

  const handleSaved = (created: ProductDTO) => {
    // Optimistically add the new product to the top for immediate feedback
    setProducts(prev => [created, ...prev])
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = products.length
    const active = products.filter(p => p.active).length
    const inactive = total - active
    const outOfStock = products.filter(p => !p.active || (p as any).quantity === 0).length
    const totalQuantity = products.reduce((sum, p) => sum + ((p as any).quantity || 0), 0)
    
    return {
      total,
      active,
      inactive,
      outOfStock,
      totalQuantity
    }
  }, [products])

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
                <p className="text-sm text-gray-500 mt-0.5">Quản lý tất cả các sản phẩm trong cửa hàng</p>
              </div>
            </div>
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Tổng sản phẩm</p>
                <p className="text-3xl font-bold">{statistics.total}</p>
              </div>
              <Package className="w-12 h-12 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Đang hoạt động</p>
                <p className="text-3xl font-bold">{statistics.active}</p>
                <p className="text-green-100 text-xs mt-1">
                  {statistics.total > 0 ? Math.round((statistics.active / statistics.total) * 100) : 0}% tổng số
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium mb-1">Tạm dừng</p>
                <p className="text-3xl font-bold">{statistics.inactive}</p>
                <p className="text-red-100 text-xs mt-1">
                  {statistics.total > 0 ? Math.round((statistics.inactive / statistics.total) * 100) : 0}% tổng số
                </p>
              </div>
              <PowerOff className="w-12 h-12 text-red-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Hết hàng</p>
                <p className="text-3xl font-bold">{statistics.outOfStock}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Tổng số lượng</p>
                <p className="text-3xl font-bold">{statistics.totalQuantity.toLocaleString('vi-VN')}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-purple-200" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* Brand Filter */}
            <div className="relative sm:w-64">
              <select
                value={selectedBrand || ''}
                onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 appearance-none cursor-pointer"
              >
                <option value="">Tất cả thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.brandID} value={brand.brandID}>
                    {brand.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="relative sm:w-64">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 appearance-none cursor-pointer"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Danh sách sản phẩm {searchTerm || selectedBrand || selectedCategory ? `(${products.length} kết quả)` : `(${products.length} sản phẩm)`}
            </h3>
          </div>
          {products.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Không tìm thấy sản phẩm nào</p>
              <p className="text-sm mt-2">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {/* Header row */}
              <div
                className="hidden md:grid gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border border-gray-200 rounded-2xl bg-gray-50"
                style={{ gridTemplateColumns: '360px repeat(4, minmax(0, 1fr)) 180px' }}
              >
                <span className="text-left">Sản phẩm</span>
                <span className="text-center">Danh mục</span>
                <span className="text-center">Giá</span>
                <span className="text-center">Tồn kho</span>
                <span className="text-center">Đã bán</span>
                <span className="text-center">Thao tác</span>
              </div>

              {products.map((product, index) => {
                const productId = Number(product.productID || product.id)
                const stats = productId ? productStats[productId] : undefined
                const totalQuantity = stats?.total ?? 0
                const soldQuantity = stats?.sold ?? 0

                return (
                  <motion.div
                    key={product.productID || product.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border border-gray-200 rounded-2xl bg-white hover:shadow-lg transition-shadow"
                  >
                    <div
                      className="p-4 grid grid-cols-1 gap-4 items-center md:grid-cols-[360px_repeat(4,minmax(0,1fr))_180px]"
                    >
                      {/* Product info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative w-20 h-20 bg-gray-50 rounded-xl border border-gray-100">
                          <Image
                            src={product.imageURL || '/placeholder-product.png'}
                            alt={product.productName}
                            fill
                            className="object-contain p-2"
                          />
                          {!product.active && (
                            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                              <span className="text-xs text-white font-semibold">Đã tắt</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.productName}</h3>
                          <p className="md:hidden text-sm text-gray-500">{product.brand?.name || 'Chưa có hãng'}</p>
                          <p className="md:hidden text-sm text-gray-400">{product.category?.name || 'Chưa có danh mục'}</p>
                          <p className="md:hidden text-base font-bold text-green-600 mt-1">
                            {product.price.toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="hidden md:flex flex-col items-center justify-center text-sm text-gray-600 text-center">
                        <span className="font-medium text-gray-900">
                          {product.category?.name || '—'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.brand?.name || 'Chưa có hãng'}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="hidden md:flex items-center justify-center text-base font-semibold text-green-600">
                        {product.price.toLocaleString('vi-VN')} ₫
                      </div>

                      {/* Inventory */}
                      <div className="hidden md:flex flex-col items-center justify-center text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{totalQuantity.toLocaleString('vi-VN')}</span>
                        <span className="text-xs text-gray-500">Tổng kho</span>
                      </div>

                      {/* Sold */}
                      <div className="hidden md:flex flex-col items-center justify-center text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{soldQuantity.toLocaleString('vi-VN')}</span>
                        <span className="text-xs text-gray-500">Đã bán</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 justify-start md:justify-center">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`p-2 rounded-full border ${
                            product.active
                              ? 'text-green-600 border-green-200 hover:bg-green-50'
                              : 'text-gray-400 border-gray-200 hover:bg-gray-50'
                          }`}
                          title={product.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {product.active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Sửa
                        </button>
                      </div>
                    </div>

                    {/* Mobile extra info */}
                    <div className="px-4 pb-4 md:hidden space-y-1 text-sm text-gray-500 border-t border-gray-100 pt-3">
                      <div className="flex justify-between">
                        <span>Tồn kho:</span>
                        <span className="font-semibold text-gray-900">{totalQuantity.toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Đã bán:</span>
                        <span className="font-semibold text-gray-900">{soldQuantity.toLocaleString('vi-VN')}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ProductManagementModal
          product={editingProduct}
          brands={brands}
          categories={categories}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}

      {/* View Modal */}
      {showViewModal && viewingProduct && (
        <ProductViewModal
          product={viewingProduct}
          onClose={() => {
            setShowViewModal(false)
            setViewingProduct(null)
          }}
        />
      )}
    </div>
  )
}
