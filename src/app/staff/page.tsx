'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StaffService, Staff } from '@/services/staffService'
import { motion } from 'framer-motion'
import { Store, User, Mail, Phone, MapPin, Package, ShoppingCart, TrendingUp } from 'lucide-react'

export default function StaffDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [staffProfile, setStaffProfile] = useState<Staff | null>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'STAFF') {
      router.push('/')
      return
    }
    loadProfile()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await StaffService.getMyProfile()
      if (response.data) {
        setStaffProfile(response.data)
      }
    } catch (error: any) {
      console.error('Error loading staff profile:', error)
      // If API doesn't exist, use user data
      if (user) {
        setStaffProfile({
          userID: user.userID,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          role: 'STAFF',
          status: 'active',
          createdAt: new Date().toISOString(),
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển nhân viên</h1>
          <p className="text-gray-600 mt-1">Chào mừng, {staffProfile?.username || user?.username}</p>
        </div>

        {/* Staff Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Thông tin nhân viên</h2>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Tên đăng nhập</p>
                <p className="font-medium text-gray-900">{staffProfile?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{staffProfile?.email}</p>
              </div>
            </div>
            {staffProfile?.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-gray-900">{staffProfile.phoneNumber}</p>
                </div>
              </div>
            )}
            {staffProfile?.storeLocation && (
              <div className="flex items-center gap-3">
                <Store className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Cửa hàng</p>
                  <p className="font-medium text-gray-900">{staffProfile.storeLocation.name}</p>
                  <p className="text-sm text-gray-500">{staffProfile.storeLocation.address}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Đơn hàng hôm nay</p>
                <p className="text-3xl font-bold mt-2">0</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Sản phẩm</p>
                <p className="text-3xl font-bold mt-2">0</p>
              </div>
              <Package className="w-12 h-12 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Doanh thu</p>
                <p className="text-3xl font-bold mt-2">0₫</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-200" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <Package className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Quản lý đơn hàng</p>
              <p className="text-sm text-gray-500 mt-1">Xem và xử lý đơn hàng</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <Store className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-medium text-gray-900">Quản lý cửa hàng</p>
              <p className="text-sm text-gray-500 mt-1">Thông tin cửa hàng</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">Báo cáo</p>
              <p className="text-sm text-gray-500 mt-1">Xem báo cáo doanh thu</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}





