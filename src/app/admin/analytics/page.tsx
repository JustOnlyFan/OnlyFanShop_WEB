'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Activity
} from 'lucide-react'

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
  }, [hasHydrated, isAuthenticated, user, router])

  if (!hasHydrated || loading) {
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
              <p className="text-sm text-gray-500 mt-0.5">Theo dõi hiệu suất và phân tích dữ liệu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Tổng doanh thu</p>
              <p className="text-3xl font-bold">0 ₫</p>
              <p className="text-blue-100 text-xs mt-1">+0% so với tháng trước</p>
            </div>
            <DollarSign className="w-12 h-12 text-blue-200" />
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
              <p className="text-green-100 text-sm font-medium mb-1">Đơn hàng</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-green-100 text-xs mt-1">+0% so với tháng trước</p>
            </div>
            <ShoppingCart className="w-12 h-12 text-green-200" />
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
              <p className="text-purple-100 text-sm font-medium mb-1">Người dùng</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-purple-100 text-xs mt-1">+0% so với tháng trước</p>
            </div>
            <Users className="w-12 h-12 text-purple-200" />
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
              <p className="text-orange-100 text-sm font-medium mb-1">Sản phẩm</p>
              <p className="text-3xl font-bold">0</p>
              <p className="text-orange-100 text-xs mt-1">+0% so với tháng trước</p>
            </div>
            <Package className="w-12 h-12 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4" />
              <p>Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng theo trạng thái</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Activity className="w-16 h-16 mx-auto mb-4" />
              <p>Biểu đồ đơn hàng sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-12 text-center border-2 border-purple-200"
      >
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-purple-600" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Tính năng đang phát triển</h3>
        <p className="text-gray-600">
          Trang Analytics đang được phát triển với các biểu đồ và thống kê chi tiết.
          <br />
          Sẽ sớm có mặt trong các bản cập nhật tiếp theo.
        </p>
      </motion.div>
    </div>
  )
}
