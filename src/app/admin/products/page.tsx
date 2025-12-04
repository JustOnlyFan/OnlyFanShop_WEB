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
  Filter,
  Package,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { ProductManagementModal } from '@/components/admin/ProductManagementModal'
import { ProductViewModal } from '@/components/admin/ProductViewModal'
import { 
  AdminButton, 
  AdminCard, 
  AdminCardHeader, 
  AdminCardBody,
  AdminInput,
  AdminBadge,
  AdminStats
} from '@/components/admin/ui'

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
            } catch (err) {}
          })
        )
      } catch (error) {
        console.error('Failed to load warehouse inventory:', error)
      }

      try {
        const ordersRes = await OrderService.getAllOrders({})
        const ordersData: any = ordersRes.data || []
        const orders = Array.isArray(ordersData) ? ordersData : ordersData?.orders || []

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
    setProducts(prev => [created, ...prev])
  }

  const statistics = useMemo(() => {
    const total = products.length
    const active = products.filter(p => p.active).length
    const inactive = total - active
    const outOfStock = products.filter(p => !p.active || (p as any).quantity === 0).length
    const totalQuantity = products.reduce((sum, p) => sum + ((p as any).quantity || 0), 0)
    
    return { total, active, inactive, outOfStock, totalQuantity }
  }, [products])

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <AdminButton
          variant="success"
          icon={<Plus className="w-5 h-5" />}
          onClick={handleAddProduct}
        >
          Thêm sản phẩm
        </AdminButton>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStats
          title="Tổng sản phẩm"
          value={statistics.total}
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />
        <AdminStats
          title="Đang hoạt động"
          value={statistics.active}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
          change={statistics.total > 0 ? `${Math.round((statistics.active / statistics.total) * 100)}%` : undefined}
          trend={statistics.total > 0 ? 'up' : undefined}
        />
        <AdminStats
          title="Tạm dừng"
          value={statistics.inactive}
          icon={<PowerOff className="w-6 h-6" />}
          color="red"
        />
        <AdminStats
          title="Hết hàng"
          value={statistics.outOfStock}
          icon={<AlertCircle className="w-6 h-6" />}
          color="orange"
        />
        <AdminStats
          title="Tổng số lượng"
          value={statistics.totalQuantity.toLocaleString('vi-VN')}
          icon={<BarChart3 className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Filters */}
      <AdminCard>
        <AdminCardBody>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <AdminInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="sm:w-56">
              <select
                value={selectedBrand || ''}
                onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="">Tất cả thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.brandID} value={brand.brandID}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:w-56">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </AdminCardBody>
      </AdminCard>

      {/* Products List */}
      <AdminCard>
        <AdminCardHeader 
          title="Danh sách sản phẩm" 
          subtitle={`${products.length} sản phẩm`}
        />
        <AdminCardBody className="p-0">
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">Không tìm thấy sản phẩm nào</p>
              <p className="text-sm text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Table Header */}
              <div className="hidden lg:grid grid-cols-[1fr_120px_120px_100px_100px_140px] gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <span>Sản phẩm</span>
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
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 lg:p-0 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="lg:grid lg:grid-cols-[1fr_120px_120px_100px_100px_140px] lg:gap-4 lg:px-6 lg:py-4 items-center">
                      {/* Product Info */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 flex-shrink-0 overflow-hidden">
                          <Image
                            src={product.imageURL || '/placeholder-product.png'}
                            alt={product.productName}
                            fill
                            className="object-contain p-1"
                          />
                          {!product.active && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-[10px] text-white font-semibold">Tắt</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{product.productName}</h3>
                          <p className="text-sm text-gray-500">{product.brand?.name || 'Chưa có hãng'}</p>
                          <div className="lg:hidden mt-1">
                            <span className="text-green-600 font-semibold">{product.price.toLocaleString('vi-VN')} ₫</span>
                          </div>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="hidden lg:flex flex-col items-center justify-center text-sm">
                        <AdminBadge variant="info" size="sm">{product.category?.name || '—'}</AdminBadge>
                      </div>

                      {/* Price */}
                      <div className="hidden lg:flex items-center justify-center font-semibold text-green-600">
                        {product.price.toLocaleString('vi-VN')} ₫
                      </div>

                      {/* Inventory */}
                      <div className="hidden lg:flex flex-col items-center justify-center text-sm">
                        <span className="font-semibold text-gray-900">{totalQuantity.toLocaleString('vi-VN')}</span>
                      </div>

                      {/* Sold */}
                      <div className="hidden lg:flex flex-col items-center justify-center text-sm">
                        <span className="font-semibold text-gray-900">{soldQuantity.toLocaleString('vi-VN')}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3 lg:mt-0 lg:justify-center">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.active
                              ? 'text-green-600 bg-green-50 hover:bg-green-100'
                              : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                          }`}
                          title={product.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {product.active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Mobile Stats */}
                      <div className="lg:hidden mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Danh mục:</span>
                          <p className="font-medium">{product.category?.name || '—'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tồn kho:</span>
                          <p className="font-medium">{totalQuantity.toLocaleString('vi-VN')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Đã bán:</span>
                          <p className="font-medium">{soldQuantity.toLocaleString('vi-VN')}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AdminCardBody>
      </AdminCard>

      {/* Modals */}
      {showModal && (
        <ProductManagementModal
          product={editingProduct}
          brands={brands}
          categories={categories}
          onClose={handleModalClose}
          onSaved={handleSaved}
        />
      )}

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
