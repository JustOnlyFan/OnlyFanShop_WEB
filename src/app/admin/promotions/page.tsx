'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { motion } from 'framer-motion'
import { Tag, Plus, Percent, Gift, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminButton, AdminCard, AdminCardBody, AdminInput, AdminStats } from '@/components/admin/ui'

export default function AdminPromotionsPage() {
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
      {/* Action Button */}
      <div className="flex justify-end">
        <AdminButton variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => toast('Tính năng đang phát triển', { icon: 'ℹ️' })}>
          Thêm khuyến mãi
        </AdminButton>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStats title="Tổng khuyến mãi" value={0} icon={<Tag className="w-5 h-5" />} color="purple" />
        <AdminStats title="Đang hoạt động" value={0} icon={<Gift className="w-5 h-5" />} color="green" />
        <AdminStats title="Đã sử dụng" value={0} icon={<Percent className="w-5 h-5" />} color="blue" />
      </div>

      {/* Filters */}
      <AdminCard>
        <AdminCardBody>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
          </div>
          <AdminInput placeholder="Tìm kiếm khuyến mãi..." icon={<Search className="w-5 h-5" />} />
        </AdminCardBody>
      </AdminCard>

      {/* Coming Soon */}
      <AdminCard>
        <AdminCardBody>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center">
              <Tag className="w-10 h-10 text-pink-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Tính năng đang phát triển</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Trang quản lý Khuyến mãi & Mã giảm giá đang được phát triển. Sẽ sớm có mặt trong các bản cập nhật tiếp theo.
            </p>
          </motion.div>
        </AdminCardBody>
      </AdminCard>
    </div>
  )
}
