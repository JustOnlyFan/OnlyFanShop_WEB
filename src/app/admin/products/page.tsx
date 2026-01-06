'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import ProductAdminService from '@/services/productAdminService'
import { ProductService } from '@/services/productService'
import { WarehouseService } from '@/services/warehouseService'
import { OrderService } from '@/services/orderService'
import { ProductDTO, Brand, Category, CategoryDTO, CategoryType } from '@/types'
import CategoryService from '@/services/categoryService'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Power, 
  PowerOff, 
  Search,
  Filter,
  Package,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShoppingCart
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
  AdminBadge
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize] = useState(12)
  
  // Stats state
  const [totalActive, setTotalActive] = useState(0)
  const [totalInactive, setTotalInactive] = useState(0)
  
  // Active filter state: null = all, true = active only, false = inactive only
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const { addItem, isLoading: isCartLoading } = useCartStore()

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
      await Promise.all([loadBrands(), loadCategories(), loadProductCounts()])
      await loadProducts(true)
    } finally {
      setLoading(false)
    }
  }

  const loadProductCounts = async () => {
    try {
      // Load all products (including inactive) to count active/inactive
      const data = await ProductAdminService.getProductList({
        page: 1,
        size: 1000, // Large enough to get all
        sortBy: 'productID',
        order: 'DESC',
        includeInactive: true // Include inactive products to get accurate counts
      })
      const allProducts = data.products || []
      const active = allProducts.filter(p => p.active).length
      setTotalActive(active)
      setTotalInactive(allProducts.length - active)
    } catch (error) {
      console.error('Failed to load product counts:', error)
    }
  }

  const loadProducts = async (withStats = false, page = currentPage) => {
    try {
      let list: ProductDTO[] = []
      let totalCount = 0
      
      if (activeFilter === true) {
        // Filter active: use server-side filtering (includeInactive: false)
        const data = await ProductAdminService.getProductList({
          page: page,
          size: pageSize,
          sortBy: 'productID',
          order: 'DESC',
          keyword: searchTerm || undefined,
          brandId: selectedBrand,
          categoryId: selectedCategory,
          includeInactive: false
        })
        list = data.products || []
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1)
          setTotalElements(data.pagination.totalElements || list.length)
          setCurrentPage(data.pagination.page || page)
        }
      } else if (activeFilter === false) {
        // Filter inactive: need to load all then filter client-side
        const data = await ProductAdminService.getProductList({
          page: 1,
          size: 10000, // Load all for filtering
          sortBy: 'productID',
          order: 'DESC',
          keyword: searchTerm || undefined,
          brandId: selectedBrand,
          categoryId: selectedCategory,
          includeInactive: true
        })
        const allProducts = (data.products || []).filter(p => !p.active)
        totalCount = allProducts.length
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        list = allProducts.slice(startIndex, endIndex)
        setTotalPages(Math.ceil(totalCount / pageSize) || 1)
        setTotalElements(totalCount)
        setCurrentPage(page)
      } else {
        // No filter: default behavior (only active products)
        const data = await ProductAdminService.getProductList({
          page: page,
          size: pageSize,
          sortBy: 'productID',
          order: 'DESC',
          keyword: searchTerm || undefined,
          brandId: selectedBrand,
          categoryId: selectedCategory,
          includeInactive: false
        })
        list = data.products || []
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1)
          setTotalElements(data.pagination.totalElements || list.length)
          setCurrentPage(data.pagination.page || page)
        }
      }
      
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
      // Load FAN_TYPE categories as tree and flatten for dropdown
      const fanTypeTree = await CategoryService.getCategoryTree(CategoryType.FAN_TYPE)
      const accessoryTypeTree = await CategoryService.getCategoryTree(CategoryType.ACCESSORY_TYPE)
      
      // Flatten tree to list with level info
      const flattenTree = (tree: CategoryDTO[], level = 0): Category[] => {
        const result: Category[] = []
        tree.forEach(cat => {
          result.push({
            id: cat.id,
            name: '—'.repeat(level) + (level > 0 ? ' ' : '') + cat.name,
            parentId: cat.parentId,
            categoryType: cat.categoryType
          } as Category)
          if (cat.children && cat.children.length > 0) {
            result.push(...flattenTree(cat.children, level + 1))
          }
        })
        return result
      }
      
      const flatCategories = [
        ...flattenTree(fanTypeTree),
        ...flattenTree(accessoryTypeTree)
      ]
      setCategories(flatCategories)
    } catch (error: any) {
      console.error('Failed to load categories:', error)
      // Fallback to legacy endpoint
      try {
        const response = await ProductService.getCategories()
        setCategories(response.data || [])
      } catch {}
    }
  }

  useEffect(() => {
    if (!hasHydrated) return
    const handler = setTimeout(() => {
      setCurrentPage(1) // Reset to page 1 when filters change
      loadProducts(true, 1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm, selectedBrand, selectedCategory, activeFilter, hasHydrated])

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowModal(true)
  }

  const handleFilterByActive = (isActive: boolean | null) => {
    // Toggle filter: if clicking the same filter, reset to null (show all)
    if (activeFilter === isActive) {
      setActiveFilter(null)
    } else {
      setActiveFilter(isActive)
    }
  }

  const handleEditProduct = async (product: ProductDTO) => {
    const productId = product.productID || product.id
    if (!productId) {
      toast.error('Không tìm thấy ID sản phẩm')
      return
    }
    
    try {
      // Fetch full product details before opening modal
      const response = await ProductService.getProductById(productId)
      if (response.data) {
        setEditingProduct(response.data as ProductDTO)
        setShowModal(true)
      } else {
        toast.error('Không thể tải thông tin sản phẩm')
      }
    } catch (error: any) {
      console.error('Error fetching product details:', error)
      toast.error(error.message || 'Không thể tải thông tin sản phẩm')
    }
  }

  const handleViewProduct = async (product: ProductDTO) => {
    const productId = product.productID || product.id
    if (!productId) {
      toast.error('Không tìm thấy ID sản phẩm')
      return
    }
    
    try {
      // Fetch full product details before opening modal
      const response = await ProductService.getProductById(productId)
      if (response.data) {
        setViewingProduct(response.data as ProductDTO)
        setShowViewModal(true)
      } else {
        toast.error('Không thể tải thông tin sản phẩm')
      }
    } catch (error: any) {
      console.error('Error fetching product details:', error)
      toast.error(error.message || 'Không thể tải thông tin sản phẩm')
    }
  }

  const handleToggleActive = async (product: ProductDTO) => {
    const productID = product.productID || product.id
    if (!productID) return
    
    try {
      await ProductAdminService.toggleActive(productID, !product.active)
      toast.success(`Sản phẩm đã được ${!product.active ? 'kích hoạt' : 'vô hiệu hóa'}`)
      // Reload product counts to get accurate statistics
      await loadProductCounts()
      loadProducts(true, currentPage)
    } catch (error: any) {
      toast.error(error.message || 'Không thể thay đổi trạng thái')
    }
  }

  const handleAddToCart = async (product: ProductDTO) => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
      return
    }

    if (!product.active) {
      toast.error('Sản phẩm này đang bị vô hiệu hóa')
      return
    }

    const productId = product.productID || product.id
    if (!productId) {
      toast.error('Không tìm thấy ID sản phẩm')
      return
    }

    try {
      // Convert ProductDTO to Product format for cart
      const productForCart: any = {
        id: productId, // Ensure id is set for cartStore
        productID: productId,
        productName: product.productName,
        price: product.price,
        imageURL: product.imageURL,
        briefDescription: product.briefDescription,
        brand: product.brand,
        category: product.category,
        active: product.active
      }

      await addItem(productForCart, 1)
      toast.success('Đã thêm sản phẩm vào giỏ hàng')
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      toast.error(error.message || 'Không thể thêm sản phẩm vào giỏ hàng')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingProduct(null)
    loadProducts(true, currentPage)
  }

  const handleSaved = (created: ProductDTO) => {
    setProducts(prev => [created, ...prev])
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    loadProducts(true, page)
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats and Action Button */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Total Products Card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -3 }}
            onClick={() => handleFilterByActive(null)}
            className={`relative flex items-center gap-4 px-5 py-4 bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
              activeFilter === null 
                ? 'border-blue-400 shadow-blue-200/50' 
                : 'border-blue-200/50'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="relative flex flex-col">
              <span className="text-xs text-blue-700/70 font-semibold uppercase tracking-wide">Tổng</span>
              <span className="text-2xl font-bold text-blue-700">{totalActive + totalInactive}</span>
            </div>
          </motion.div>

          {/* Active Products Card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -3 }}
            onClick={() => handleFilterByActive(true)}
            className={`relative flex items-center gap-4 px-5 py-4 bg-gradient-to-br from-emerald-50 via-green-50/80 to-teal-50 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
              activeFilter === true 
                ? 'border-emerald-400 shadow-emerald-200/50' 
                : 'border-emerald-200/50'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-md">
              <Power className="w-6 h-6 text-white" />
            </div>
            <div className="relative flex flex-col">
              <span className="text-xs text-emerald-700/70 font-semibold uppercase tracking-wide">Active</span>
              <span className="text-2xl font-bold text-emerald-700">{totalActive}</span>
            </div>
          </motion.div>

          {/* Inactive Products Card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.03, y: -3 }}
            onClick={() => handleFilterByActive(false)}
            className={`relative flex items-center gap-4 px-5 py-4 bg-gradient-to-br from-rose-50 via-red-50/80 to-pink-50 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
              activeFilter === false 
                ? 'border-rose-400 shadow-rose-200/50' 
                : 'border-rose-200/50'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/0 to-rose-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-md">
              <PowerOff className="w-6 h-6 text-white" />
            </div>
            <div className="relative flex flex-col">
              <span className="text-xs text-rose-700/70 font-semibold uppercase tracking-wide">Inactive</span>
              <span className="text-2xl font-bold text-rose-700">{totalInactive}</span>
            </div>
          </motion.div>
        </div>
        <AdminButton
          variant="success"
          icon={<Plus className="w-5 h-5" />}
          onClick={handleAddProduct}
        >
          Thêm sản phẩm
        </AdminButton>
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
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
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
          subtitle={`${totalElements} sản phẩm`}
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
                        {product.active && (
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={isCartLoading}
                            className="p-2 rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Thêm vào giỏ hàng"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        )}
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages} ({totalElements} sản phẩm)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first, last, current, and pages around current
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1
                    })
                    .map((page, idx, arr) => {
                      // Add ellipsis if there's a gap
                      const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsisBefore && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors ${
                              page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      )
                    })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
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
