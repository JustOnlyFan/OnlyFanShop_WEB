'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { OrderService } from '@/services/orderService'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Search,
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Eye,
  Edit2,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface OrderDTO {
  orderID: number
  orderDate: string
  orderStatus: string
  paymentMethod: string
  billingAddress: string
  totalPrice: number
  firstProductName?: string
  firstProductImage?: string
  firstProductQuantity?: number
  firstProductPrice?: number
  products?: Array<{
    productName: string
    imageURL: string
    quantity: number
    price: number
  }>
  totalProductCount?: number
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderDTO[]>([])
  const [allOrders, setAllOrders] = useState<OrderDTO[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [size] = useState(12)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadOrders()
  }, [hasHydrated, isAuthenticated, user, router])

  useEffect(() => {
    if (!hasHydrated) return
    const handler = setTimeout(() => {
      loadOrders()
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm, statusFilter, hasHydrated])

  const loadOrders = async () => {
    try {
      setLoading(true)
      
      try {
        // Load all orders for statistics
        const allOrdersResp = await OrderService.getAllOrders({})
        setAllOrders(allOrdersResp.data || [])
      } catch (e: any) {
        console.warn('Failed to load all orders for statistics:', e.message)
        // Continue with filtered load even if statistics load fails
      }

      // Load filtered orders
      const resp = await OrderService.getAllOrders({
        status: statusFilter || undefined,
        page,
        size
      })
      let filteredOrders = resp.data || []
      
      // Client-side search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        filteredOrders = filteredOrders.filter(o =>
          o.orderID?.toString().includes(q) ||
          o.billingAddress?.toLowerCase().includes(q) ||
          o.firstProductName?.toLowerCase().includes(q) ||
          o.paymentMethod?.toLowerCase().includes(q)
        )
      }
      
      setOrders(filteredOrders)
    } catch (e: any) {
      console.error('Error loading orders:', e)
      toast.error(e.message || 'Không thể tải danh sách đơn hàng')
      // Set empty arrays on error
      setOrders([])
      setAllOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = allOrders.length
    const pending = allOrders.filter(o => o.orderStatus === 'pending').length
    const confirmed = allOrders.filter(o => o.orderStatus === 'confirmed').length
    const processing = allOrders.filter(o => o.orderStatus === 'processing').length
    const shipping = allOrders.filter(o => o.orderStatus === 'shipping').length
    const completed = allOrders.filter(o => o.orderStatus === 'completed').length
    const canceled = allOrders.filter(o => o.orderStatus === 'canceled').length
    const totalRevenue = allOrders
      .filter(o => o.orderStatus === 'completed')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0)
    
    return {
      total,
      pending,
      confirmed,
      processing,
      shipping,
      completed,
      canceled,
      totalRevenue
    }
  }, [allOrders])

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await OrderService.setOrderStatus(orderId, newStatus)
      toast.success('Đã cập nhật trạng thái đơn hàng')
      loadOrders()
    } catch (e: any) {
      toast.error(e.message || 'Không thể cập nhật trạng thái')
    }
  }

  const handleViewOrder = async (orderId: number) => {
    try {
      const resp = await OrderService.getOrderDetails(orderId)
      // TODO: Show order details in modal or navigate to detail page
      toast.success('Đang tải chi tiết đơn hàng...')
      console.log('Order details:', resp.data)
    } catch (e: any) {
      toast.error(e.message || 'Không thể tải chi tiết đơn hàng')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'shipping':
        return 'bg-indigo-100 text-indigo-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Chờ xác nhận'
      case 'confirmed':
        return 'Đã xác nhận'
      case 'processing':
        return 'Đang xử lý'
      case 'shipping':
        return 'Đang giao hàng'
      case 'completed':
        return 'Hoàn thành'
      case 'canceled':
        return 'Đã hủy'
      case 'refunded':
        return 'Đã hoàn tiền'
      default:
        return status || 'Không xác định'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'processing':
        return <Package className="w-4 h-4" />
      case 'shipping':
        return <Truck className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'canceled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (!hasHydrated || (loading && orders.length === 0)) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-6">
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
              <p className="text-sm text-gray-500 mt-0.5">Quản lý tất cả đơn hàng trong hệ thống</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Tổng đơn hàng</p>
              <p className="text-3xl font-bold">{statistics.total}</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium mb-1">Chờ xác nhận</p>
              <p className="text-3xl font-bold">{statistics.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Đang xử lý</p>
              <p className="text-3xl font-bold">{statistics.processing}</p>
            </div>
            <Package className="w-12 h-12 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-1">Đang giao</p>
              <p className="text-3xl font-bold">{statistics.shipping}</p>
            </div>
            <Truck className="w-12 h-12 text-indigo-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Hoàn thành</p>
              <p className="text-3xl font-bold">{statistics.completed}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium mb-1">Đã hủy</p>
              <p className="text-3xl font-bold">{statistics.canceled}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Đã xác nhận</p>
              <p className="text-3xl font-bold">{statistics.confirmed}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-orange-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Doanh thu</p>
              <p className="text-2xl font-bold">{statistics.totalRevenue.toLocaleString('vi-VN')} ₫</p>
            </div>
            <TrendingUp className="w-12 h-12 text-emerald-200" />
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
              placeholder="Tìm kiếm theo mã đơn, địa chỉ, sản phẩm..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* Status Filter */}
          <div className="relative sm:w-64">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 appearance-none cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="completed">Hoàn thành</option>
              <option value="canceled">Đã hủy</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách đơn hàng {searchTerm || statusFilter ? `(${orders.length} kết quả)` : `(${allOrders.length} đơn hàng)`}
          </h3>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Không tìm thấy đơn hàng nào</p>
            <p className="text-sm mt-2">Thử thay đổi bộ lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <motion.tr
                    key={order.orderID}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.orderID}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {order.firstProductImage && (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={order.firstProductImage}
                              alt={order.firstProductName || 'Product'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.firstProductName || 'N/A'}</div>
                          {order.totalProductCount && order.totalProductCount > 1 && (
                            <div className="text-xs text-gray-500">+{order.totalProductCount - 1} sản phẩm khác</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.billingAddress || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.orderStatus || ''}
                        onChange={(e) => handleStatusChange(order.orderID, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.orderStatus || '')} cursor-pointer`}
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipping">Đang giao hàng</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="canceled">Đã hủy</option>
                        <option value="refunded">Đã hoàn tiền</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.paymentMethod || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {order.totalPrice?.toLocaleString('vi-VN') || '0'} ₫
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(order.orderDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewOrder(order.orderID)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
