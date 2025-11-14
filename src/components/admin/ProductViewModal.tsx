'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Package, ShoppingCart, Warehouse, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { ProductDTO } from '@/types'
import { ProductService } from '@/services/productService'
import { WarehouseService } from '@/services/warehouseService'
import { OrderService } from '@/services/orderService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

interface ProductViewModalProps {
  product: ProductDTO
  onClose: () => void
}

interface ProductInventory {
  warehouseName: string
  quantity: number
}

interface ProductStats {
  totalQuantity: number
  soldQuantity: number
  inventory: ProductInventory[]
}

export function ProductViewModal({ product, onClose }: ProductViewModalProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<ProductStats>({
    totalQuantity: 0,
    soldQuantity: 0,
    inventory: []
  })
  const [productDetail, setProductDetail] = useState<any>(null)

  useEffect(() => {
    loadProductDetails()
  }, [product])

  const loadProductDetails = async () => {
    try {
      setLoading(true)
      const productId = product.productID || product.id
      if (!productId) {
        toast.error('Không tìm thấy ID sản phẩm')
        return
      }

      // Load product detail
      const productRes = await ProductService.getProductById(productId)
      setProductDetail(productRes.data)

      // Load inventory from all warehouses
      try {
        // Get all warehouses first
        const warehousesRes = await WarehouseService.getAllWarehouses()
        const warehouses = warehousesRes.data || []

        // Get inventory for each warehouse
        const inventoryPromises = warehouses.map(async (warehouse) => {
          try {
            const invRes = await WarehouseService.getWarehouseInventory(warehouse.id)
            const inventory = invRes.data || []
            const productInventory = inventory.find(
              (inv: any) => inv.productId === productId
            )
            if (productInventory) {
              return {
                warehouseName: warehouse.name,
                quantity: productInventory.quantityInStock || 0
              }
            }
            return null
          } catch (error) {
            return null
          }
        })

        const inventoryResults = await Promise.all(inventoryPromises)
        const validInventory = inventoryResults.filter((inv): inv is ProductInventory => inv !== null)

        const totalQuantity = validInventory.reduce((sum, inv) => sum + inv.quantity, 0)

        // Get sold quantity from orders
        let soldQuantity = 0
        try {
          const ordersRes = await OrderService.getAllOrders({})
          const orders = ordersRes.data || []
          // Calculate total sold quantity for this product
          soldQuantity = orders.reduce((total, order) => {
            const productItems = order.items?.filter(
              (item: any) => item.productId === productId
            ) || []
            const quantity = productItems.reduce(
              (sum: number, item: any) => sum + (item.quantity || 0),
              0
            )
            // Only count delivered orders
            if (order.orderStatus === 'DELIVERED') {
              return total + quantity
            }
            return total
          }, 0)
        } catch (error: any) {
          console.error('Error loading sold quantity:', error)
          // Don't show error, just use 0
        }

        setStats({
          totalQuantity,
          soldQuantity,
          inventory: validInventory
        })
      } catch (error: any) {
        console.error('Error loading inventory:', error)
        // Don't show error toast for inventory, just set defaults
        setStats({
          totalQuantity: 0,
          soldQuantity: 0,
          inventory: []
        })
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải thông tin sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const displayProduct = productDetail || product

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết sản phẩm</h2>
                <p className="text-sm text-gray-500">Thông tin và số lượng tồn kho</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Image */}
                <div className="space-y-4">
                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    <Image
                      src={displayProduct.imageURL || '/placeholder-product.png'}
                      alt={displayProduct.productName}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>

                {/* Right: Details */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {displayProduct.productName}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Thương hiệu:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {displayProduct.brand?.name || 'Chưa có'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Danh mục:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {displayProduct.category?.name || 'Chưa có'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Giá:</span>
                        <span className="text-lg font-bold text-green-600">
                          {displayProduct.price?.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Warehouse className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Tổng tồn kho</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.totalQuantity.toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Đã bán</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.soldQuantity.toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Inventory by Warehouse */}
                  {stats.inventory.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-gray-600" />
                        Số lượng theo kho
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {stats.inventory.map((inv, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {inv.warehouseName}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {inv.quantity.toLocaleString('vi-VN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {displayProduct.briefDescription && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {displayProduct.briefDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

