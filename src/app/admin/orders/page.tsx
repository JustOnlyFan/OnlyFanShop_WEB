'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { OrderService } from '@/services/orderService'
import { motion } from 'framer-motion'
import { Search, ShoppingCart, Package, Truck, CheckCircle, XCircle, Clock, Filter, Eye, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { AdminCard, AdminCardHeader, AdminCardBody, AdminInput, AdminStats } from '@/components/admin/ui'

interface OrderDTO {
  orderID: number
  orderDate: string
  orderStatus: string
  paymentMethod: string
  billingAddress: string
  totalPrice: number
  firstProductName?: string
  firstProductImage?: string
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
    const handler = setTimeout(() => loadOrders(), 300)
    return () => clearTimeout(handler)
  }, [searchTerm, statusFilter, hasHydrated])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const allOrdersResp = await OrderService.getAllOrders({})
      const mappedOrders: OrderDTO[] = (allOrdersResp.data || []).map((order) => ({
        orderID: order.id,
        orderDate: order.createdAt,
        orderStatus: order.orderStatus.toLowerCase(),
        paymentMethod: order.paymentMethod,
        billingAddress: order.shippingAddress?.address || '',
        totalPrice: order.totalAmount,
        firstProductName: order.items?.[0]?.productName,
        firstProductImage: order.items?.[0]?.productImage,
        totalProductCount: order.totalItems
      }))
      setAllOrders(mappedOrders)

      let filteredOrders = mappedOrders
      if (statusFilter) filteredOrders = filteredOrders.filter(o => o.orderStatus === statusFilter)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        filteredOrders = filteredOrders.filter(o =>
          o.orderID?.toString().includes(q) ||
          o.billingAddress?.toLowerCase().includes(q) ||
          o.firstProductName?.toLowerCase().includes(q)
        )
      }
      setOrders(filteredOrders)
    } catch (e: any) {
      toast.error(e.message || 'Không thể tải danh sách đơn hàng')
      setOrders([])
      setAllOrders([])
    } finally {
      setLoading(false)
    }
  }

  const statistics = useMemo(() => {
    const total = allOrders.length
    const pending = allOrders.filter(o => o.orderStatus === 'pending').length
    const processing = allOrders.filter(o => o.orderStatus === 'processing').length
    const shipping = allOrders.filter(o => o.orderStatus === 'shipping').length
    const completed = allOrders.filter(o => o.orderStatus === 'completed').length
    const canceled = allOrders.filter(o => o.orderStatus === 'canceled').length
    const totalRevenue = allOrders.filter(o => o.orderStatus === 'completed').reduce((sum, o) => sum + (o.totalPrice || 0), 0)
    return { total, pending, processing, shipping, completed, canceled, totalRevenue }
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return dateString }
  }

  if (!hasHydrated || (loading && orders.length === 0)) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <AdminStats title="Tổng đơn" value={statistics.total} icon={<ShoppingCart className="w-5 h-5" />} color="blue" />
        <AdminStats title="Chờ xác nhận" value={statistics.pending} icon={<Clock className="w-5 h-5" />} color="orange" />
        <AdminStats title="Đang xử lý" value={statistics.processing} icon={<Package className="w-5 h-5" />} color="purple" />
        <AdminStats title="Đang giao" value={statistics.shipping} icon={<Truck className="w-5 h-5" />} color="blue" />
        <AdminStats title="Hoàn thành" value={statistics.completed} icon={<CheckCircle className="w-5 h-5" />} color="green" />
        <AdminStats title="Đã hủy" value={statistics.canceled} icon={<XCircle className="w-5 h-5" />} color="red" />
        <AdminStats title="Doanh thu" value={`${(statistics.totalRevenue / 1000000).toFixed(1)}M`} icon={<TrendingUp className="w-5 h-5" />} color="green" />
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
              <AdminInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm theo mã đơn, địa chỉ..." icon={<Search className="w-5 h-5" />} />
            </div>
            <div className="sm:w-56">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="completed">Hoàn thành</option>
                <option value="canceled">Đã hủy</option>
              </select>
            </div>
          </div>
        </AdminCardBody>
      </AdminCard>

      {/* Orders List */}
      <AdminCard>
        <AdminCardHeader title="Danh sách đơn hàng" subtitle={`${orders.length} đơn hàng`} />
        <AdminCardBody className="p-0">
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Địa chỉ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thanh toán</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tổng tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày đặt</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order, index) => (
                    <motion.tr key={order.orderID} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">#{order.orderID}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {order.firstProductImage && (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                              <Image src={order.firstProductImage} alt="" fill className="object-cover" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{order.firstProductName || 'N/A'}</p>
                            {order.totalProductCount && order.totalProductCount > 1 && (
                              <p className="text-xs text-gray-500">+{order.totalProductCount - 1} sản phẩm khác</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 max-w-[200px] truncate">{order.billingAddress || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <select value={order.orderStatus || ''} onChange={(e) => handleStatusChange(order.orderID, e.target.value)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer">
                          <option value="pending">Chờ xác nhận</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipping">Đang giao</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="canceled">Đã hủy</option>
                        </select>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{order.paymentMethod || 'N/A'}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-green-600">{order.totalPrice?.toLocaleString('vi-VN')} ₫</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatDate(order.orderDate)}</td>
                      <td className="px-4 py-4 text-center">
                        <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCardBody>
      </AdminCard>
    </div>
  )
}
