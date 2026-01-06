'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { WarehouseService, Warehouse, WarehouseInventory } from '@/services/warehouseService'
import { StoreInventoryService, StoreInventoryRecord } from '@/services/storeInventoryService'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, TrendingUp, TrendingDown, Search, X, Maximize2, Edit2, Save, CheckSquare, Square } from 'lucide-react'
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
  const [enabledProductsCount, setEnabledProductsCount] = useState(0)
  const [outOfStockCount, setOutOfStockCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [productLoading, setProductLoading] = useState(false)
  const [productDetail, setProductDetail] = useState<ProductFullDetails | null>(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  
  // Edit inventory state - Requirements: 2.1
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<WarehouseInventory | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)
  const [editReason, setEditReason] = useState<string>('')
  const [saving, setSaving] = useState(false)
  
  // Bulk update state
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false)
  const [bulkQuantity, setBulkQuantity] = useState<number>(0)
  const [bulkReason, setBulkReason] = useState<string>('')
  const [bulkSaving, setBulkSaving] = useState(false)

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
      const inventoryData = inventoryRes.data || []
      setInventory(inventoryData)
      
      // Sử dụng trực tiếp từ inventory (đã được warehouseService xử lý logic fallback)
      // warehouseService đã xử lý: nếu không có sản phẩm available, sẽ fallback về allProducts
      const totalProducts = inventoryData.length
      setEnabledProductsCount(totalProducts)
      
      // Đếm sản phẩm hết hàng: số lượng sản phẩm có quantity = 0
      const outOfStockCount = inventoryData.filter(item => 
        item.quantityInStock === 0 || item.quantityInStock === null || item.quantityInStock === undefined
      ).length
      
      setOutOfStockCount(outOfStockCount)
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

  // Sử dụng tất cả inventory từ warehouseService (đã được xử lý logic fallback)
  // warehouseService đã xử lý: nếu không có sản phẩm available, sẽ fallback về allProducts
  // Nên không cần filter lại ở đây
  const filteredInventory = inventory.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.warehouseName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalItems = inventory.reduce((sum, item) => sum + item.quantityInStock, 0)
  // Tổng sản phẩm = số sản phẩm trong inventory (đã được warehouseService xử lý)
  const totalProducts = inventory.length
  // Sản phẩm hết hàng đã được tính trong loadData dựa trên cùng nguồn với totalProducts

  /**
   * Open edit modal for inventory item
   * Requirements: 2.1 - WHEN Admin updates inventory quantity
   */
  const openEditModal = (item: WarehouseInventory) => {
    setEditingItem(item)
    setEditQuantity(item.quantityInStock)
    setEditReason('')
    setShowEditModal(true)
  }

  /**
   * Save inventory quantity update
   * Requirements: 2.1 - THEN the System SHALL update the Inventory_Item in the specified Store_Warehouse
   */
  const handleSaveQuantity = async () => {
    if (!editingItem) return
    
    if (editQuantity < 0) {
      toast.error('Số lượng không được âm')
      return
    }

    if (editQuantity > 50) {
      toast.error('Số lượng tối đa cho mỗi sản phẩm là 50')
      return
    }

    if (!warehouseId || isNaN(warehouseId)) {
      toast.error('ID cửa hàng không hợp lệ')
      return
    }

    if (!editingItem.productId || isNaN(editingItem.productId)) {
      toast.error('ID sản phẩm không hợp lệ')
      return
    }

    try {
      setSaving(true)
      console.log('Updating inventory:', { 
        storeId: warehouseId, 
        productId: editingItem.productId, 
        quantity: editQuantity 
      })
      await WarehouseService.updateStoreWarehouseQuantity(
        warehouseId,
        editingItem.productId,
        editQuantity,
        editReason || 'Cập nhật thủ công từ admin'
      )
      
      // Cập nhật state trực tiếp để UI phản ánh ngay lập tức (không cần reload)
      setInventory(prevInventory => 
        prevInventory.map(item => 
          item.productId === editingItem.productId
            ? { ...item, quantityInStock: editQuantity, updatedAt: new Date().toISOString() }
            : item
        )
      )
      
      // Cập nhật statistics: đếm lại sản phẩm hết hàng
      setOutOfStockCount(prevCount => {
        const wasOutOfStock = editingItem.quantityInStock === 0
        const isNowOutOfStock = editQuantity === 0
        
        if (wasOutOfStock && !isNowOutOfStock) {
          // Từ hết hàng -> còn hàng: giảm count
          return Math.max(0, prevCount - 1)
        } else if (!wasOutOfStock && isNowOutOfStock) {
          // Từ còn hàng -> hết hàng: tăng count
          return prevCount + 1
        }
        return prevCount
      })
      
      toast.success('Cập nhật số lượng thành công')
      setShowEditModal(false)
      setEditingItem(null)
      setEditQuantity(0)
      setEditReason('')
    } catch (error: any) {
      console.error('Error updating inventory:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      })
      toast.error(error.response?.data?.message || error.message || 'Không thể cập nhật số lượng')
    } finally {
      setSaving(false)
    }
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Handle product selection
  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => {
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
    if (selectedProducts.size === filteredInventory.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(filteredInventory.map(item => item.productId)))
    }
  }

  const handleBulkUpdate = () => {
    if (selectedProducts.size === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm')
      return
    }
    setBulkQuantity(0)
    setBulkReason('')
    setShowBulkUpdateModal(true)
  }

  const handleBulkSave = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm')
      return
    }

    if (bulkQuantity < 0) {
      toast.error('Số lượng không được âm')
      return
    }

    if (bulkQuantity > 50) {
      toast.error('Số lượng tối đa cho mỗi sản phẩm là 50')
      return
    }

    if (!warehouseId || isNaN(warehouseId)) {
      toast.error('ID cửa hàng không hợp lệ')
      return
    }

    try {
      setBulkSaving(true)
      const productIds = Array.from(selectedProducts)
      
      // Update all selected products in parallel
      await Promise.all(
        productIds.map(productId =>
          WarehouseService.updateStoreWarehouseQuantity(
            warehouseId,
            productId,
            bulkQuantity,
            bulkReason || `Cập nhật đồng loạt: ${productIds.length} sản phẩm`
          ).catch(err => {
            console.error(`Error updating product ${productId}:`, err)
            throw err
          })
        )
      )

      // Update local state
      setInventory(prevInventory =>
        prevInventory.map(item =>
          selectedProducts.has(item.productId)
            ? { ...item, quantityInStock: bulkQuantity, updatedAt: new Date().toISOString() }
            : item
        )
      )

      // Update out of stock count
      const wasOutOfStock = filteredInventory.filter(item => 
        selectedProducts.has(item.productId) && item.quantityInStock === 0
      ).length
      const isNowOutOfStock = bulkQuantity === 0 ? selectedProducts.size : 0
      setOutOfStockCount(prevCount => {
        const diff = isNowOutOfStock - wasOutOfStock
        return Math.max(0, prevCount + diff)
      })

      toast.success(`Đã cập nhật ${selectedProducts.size} sản phẩm thành công`)
      setShowBulkUpdateModal(false)
      setSelectedProducts(new Set())
      setBulkQuantity(0)
      setBulkReason('')
    } catch (error: any) {
      console.error('Error bulk updating inventory:', error)
      toast.error(error.response?.data?.message || error.message || 'Không thể cập nhật số lượng')
    } finally {
      setBulkSaving(false)
    }
  }

  return (
    <div className="min-h-full bg-blue-50 -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/admin/warehouse/manager/${warehouseId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                <p className="text-xs text-gray-500 mt-1">Sản phẩm đang bán tại cửa hàng</p>
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
                <p className="text-gray-600 text-sm">Sản phẩm hết hàng</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
                <p className="text-xs text-gray-500 mt-1">Trong số đang bán</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </motion.div>
        </div>

        {/* Search and Bulk Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            {selectedProducts.size > 0 && (
              <button
                onClick={handleBulkUpdate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Cập nhật {selectedProducts.size} sản phẩm
              </button>
            )}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <button
                      onClick={handleSelectAll}
                      className="inline-flex items-center justify-center"
                      title={selectedProducts.size === filteredInventory.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    >
                      {selectedProducts.size === filteredInventory.length && filteredInventory.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Biến thể</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`hover:bg-gray-50 ${selectedProducts.has(item.productId) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleSelectProduct(item.productId)}
                        className="inline-flex items-center justify-center"
                        title={selectedProducts.has(item.productId) ? 'Bỏ chọn' : 'Chọn'}
                      >
                        {selectedProducts.has(item.productId) ? (
                          <CheckSquare className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => openEditModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        title="Cập nhật số lượng"
                      >
                        <Edit2 className="w-4 h-4" />
                        Sửa
                      </button>
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

      {/* Edit Inventory Modal - Requirements: 2.1 */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cập nhật số lượng tồn kho</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Product Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Sản phẩm</p>
                <p className="font-medium text-gray-900">{editingItem.productName}</p>
                <p className="text-xs text-gray-500 mt-1">Số lượng hiện tại: {editingItem.quantityInStock}</p>
              </div>

              {/* New Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editQuantity || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '') {
                      setEditQuantity(0)
                    } else {
                      const num = parseInt(val, 10)
                      if (!isNaN(num) && num >= 0 && num <= 50) {
                        setEditQuantity(num)
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // Đảm bảo giá trị là số nguyên không có leading zeros và không vượt quá 50
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val) && val >= 0 && val <= 50) {
                      setEditQuantity(val)
                    } else if (!isNaN(val) && val > 50) {
                      setEditQuantity(50)
                      toast.error('Số lượng tối đa là 50')
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nhập số lượng mới (tối đa 50)"
                  max={50}
                />
                <p className="text-xs text-gray-500 mt-1">Số lượng tối đa: 50</p>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do thay đổi
                </label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Nhập lý do thay đổi số lượng (tùy chọn)"
                />
              </div>

              {/* Change Summary */}
              {editQuantity !== editingItem.quantityInStock && (
                <div className={`p-3 rounded-lg ${editQuantity > editingItem.quantityInStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <p className="text-sm font-medium">
                    {editQuantity > editingItem.quantityInStock 
                      ? `Tăng ${editQuantity - editingItem.quantityInStock} sản phẩm`
                      : `Giảm ${editingItem.quantityInStock - editQuantity} sản phẩm`
                    }
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveQuantity}
                disabled={saving || editQuantity === editingItem.quantityInStock}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {saving ? <LoadingSpinner /> : <Save className="w-4 h-4" />}
                Lưu thay đổi
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBulkUpdateModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cập nhật số lượng đồng loạt</h3>
              <button onClick={() => setShowBulkUpdateModal(false)} className="p-2 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Selected Products Info */}
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-sm text-indigo-700 font-medium">
                  Đã chọn: {selectedProducts.size} sản phẩm
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Tất cả sản phẩm được chọn sẽ được cập nhật cùng một số lượng
                </p>
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={bulkQuantity || ''}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '') {
                      setBulkQuantity(0)
                    } else {
                      const num = parseInt(val, 10)
                      if (!isNaN(num) && num >= 0 && num <= 50) {
                        setBulkQuantity(num)
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val) && val >= 0 && val <= 50) {
                      setBulkQuantity(val)
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nhập số lượng mới (tối đa 50)"
                />
                <p className="text-xs text-gray-500 mt-1">Số lượng tối đa: 50 cho mỗi sản phẩm</p>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do thay đổi
                </label>
                <textarea
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Nhập lý do thay đổi số lượng (tùy chọn)"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowBulkUpdateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkSave}
                disabled={bulkSaving || bulkQuantity < 0 || bulkQuantity > 50}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {bulkSaving ? <LoadingSpinner /> : <Save className="w-4 h-4" />}
                Cập nhật {selectedProducts.size} sản phẩm
              </button>
            </div>
          </motion.div>
        </div>
      )}
 
    </div>
  )
}

