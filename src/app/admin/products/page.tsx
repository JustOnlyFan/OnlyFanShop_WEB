'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import ProductAdminService from '@/services/productAdminService'
import { ProductService } from '@/services/productService'
import { ProductDTO, Brand, Category } from '@/types'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Eye,
  Power, 
  PowerOff, 
  Search,
  ArrowLeft,
  Filter,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { ProductManagementModal } from '@/components/admin/ProductManagementModal'

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null)
  
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
      await Promise.all([
        loadProducts(),
        loadBrands(),
        loadCategories()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
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
      setProducts(data.products || [])
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách sản phẩm')
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
      loadProducts()
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
    router.push(`/products/${product.productID || product.id}`)
  }

  const handleToggleActive = async (product: ProductDTO) => {
    const productID = product.productID || product.id
    if (!productID) return
    
    try {
      await ProductAdminService.toggleActive(productID, !product.active)
      toast.success(`Sản phẩm đã được ${!product.active ? 'kích hoạt' : 'vô hiệu hóa'}`)
      loadProducts()
    } catch (error: any) {
      toast.error(error.message || 'Không thể thay đổi trạng thái')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingProduct(null)
    loadProducts()
  }

  const handleSaved = (created: ProductDTO) => {
    // Optimistically add the new product to the top for immediate feedback
    setProducts(prev => [created, ...prev])
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Sản phẩm</h1>
              <p className="mt-1 text-gray-600">Quản lý tất cả các sản phẩm trong cửa hàng</p>
            </div>
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Brand Filter */}
            <select
              value={selectedBrand || ''}
              onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.brandID} value={brand.brandID}>
                  {brand.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

        {/* Products Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {products.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.productID || product.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={product.imageURL || '/placeholder-product.png'}
                      alt={product.productName}
                      fill
                      className="object-cover"
                    />
                    {!product.active && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Đã vô hiệu hóa</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{product.productName}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.briefDescription}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          {product.price.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {product.brand?.name} - {product.category?.name}
                      </span>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`p-1 rounded transition-colors ${
                          product.active
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={product.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        {product.active ? (
                          <Power className="w-4 h-4" />
                        ) : (
                          <PowerOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleViewProduct(product)}
                        className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Xem
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 inline mr-1" />
                        Sửa
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
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
    </div>
  )
}
