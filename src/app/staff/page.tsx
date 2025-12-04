'use client'

import { useAuthStore } from '@/store/authStore'
import { AdminCard, AdminCardBody, AdminStats } from '@/components/admin/ui'
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'

export default function StaffDashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <AdminCard>
        <AdminCardBody>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Xin chào, {user?.fullName || user?.username}!
          </h2>
          <p className="text-gray-600">
            Đây là trang quản lý dành cho nhân viên. Bạn có thể quản lý đơn hàng, sản phẩm và khách hàng tại cửa hàng của mình.
          </p>
        </AdminCardBody>
      </AdminCard>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStats
          title="Đơn hàng hôm nay"
          value={0}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="blue"
        />
        <AdminStats
          title="Sản phẩm"
          value={0}
          icon={<Package className="w-5 h-5" />}
          color="green"
        />
        <AdminStats
          title="Khách hàng"
          value={0}
          icon={<Users className="w-5 h-5" />}
          color="purple"
        />
        <AdminStats
          title="Doanh thu"
          value="0 ₫"
          icon={<TrendingUp className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Coming Soon */}
      <AdminCard>
        <AdminCardBody>
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tính năng đang phát triển</h3>
            <p className="text-gray-500">
              Trang quản lý nhân viên đang được phát triển. Sẽ sớm có mặt trong các bản cập nhật tiếp theo.
            </p>
          </div>
        </AdminCardBody>
      </AdminCard>
    </div>
  )
}
