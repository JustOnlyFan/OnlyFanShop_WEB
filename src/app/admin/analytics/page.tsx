'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, DollarSign, Users, ShoppingCart, Package, Activity } from 'lucide-react'
import { AdminCard, AdminCardHeader, AdminCardBody, AdminStats } from '@/components/admin/ui'

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const [loading] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
  }, [hasHydrated, isAuthenticated, user, router])

  if (!hasHydrated || loading) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStats title="Tổng doanh thu" value="0 ₫" icon={<DollarSign className="w-5 h-5" />} color="blue" change="+0%" trend="up" />
        <AdminStats title="Đơn hàng" value={0} icon={<ShoppingCart className="w-5 h-5" />} color="green" change="+0%" trend="up" />
        <AdminStats title="Người dùng" value={0} icon={<Users className="w-5 h-5" />} color="purple" change="+0%" trend="up" />
        <AdminStats title="Sản phẩm" value={0} icon={<Package className="w-5 h-5" />} color="orange" change="+0%" trend="up" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard>
          <AdminCardHeader title="Doanh thu theo tháng" />
          <AdminCardBody>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                <p>Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
              </div>
            </div>
          </AdminCardBody>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader title="Đơn hàng theo trạng thái" />
          <AdminCardBody>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Activity className="w-16 h-16 mx-auto mb-4" />
                <p>Biểu đồ đơn hàng sẽ được hiển thị ở đây</p>
              </div>
            </div>
          </AdminCardBody>
        </AdminCard>
      </div>

      {/* Coming Soon */}
      <AdminCard>
        <AdminCardBody>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Tính năng đang phát triển</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Trang Analytics đang được phát triển với các biểu đồ và thống kê chi tiết. Sẽ sớm có mặt trong các bản cập nhật tiếp theo.
            </p>
          </motion.div>
        </AdminCardBody>
      </AdminCard>
    </div>
  )
}
