'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Tag,
  Plus,
  Percent,
  Calendar,
  Gift,
  Search,
  Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPromotionsPage() {
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
            <div className="p-2 bg-pink-100 rounded-lg">
              <Tag className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Khuyến mãi & Mã giảm giá</h1>
              <p className="text-sm text-gray-500 mt-0.5">Quản lý các chương trình khuyến mãi và mã giảm giá</p>
            </div>
          </div>
          <button
            onClick={() => toast.info('Tính năng đang phát triển')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm khuyến mãi</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium mb-1">Tổng khuyến mãi</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <Tag className="w-12 h-12 text-pink-200" />
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
              <p className="text-3xl font-bold">0</p>
            </div>
            <Gift className="w-12 h-12 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Đã sử dụng</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <Percent className="w-12 h-12 text-blue-200" />
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
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm khuyến mãi..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-12 text-center border-2 border-pink-200"
      >
        <Tag className="w-16 h-16 mx-auto mb-4 text-pink-600" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Tính năng đang phát triển</h3>
        <p className="text-gray-600">
          Trang quản lý Khuyến mãi & Mã giảm giá đang được phát triển.
          <br />
          Sẽ sớm có mặt trong các bản cập nhật tiếp theo.
        </p>
      </motion.div>
    </div>
  )
}
