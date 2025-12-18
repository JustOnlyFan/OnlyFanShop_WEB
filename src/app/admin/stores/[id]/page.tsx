'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { ArrowLeft, Store, MapPin, Phone, Mail, Clock, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function StoreDetailPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = Number(params.id)
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<StoreLocation | null>(null)

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return
    loadStore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated, user?.role, storeId])

  const loadStore = async () => {
    try {
      setLoading(true)
      const resp = await StoreLocationService.getStoreLocations()
      const stores = Array.isArray(resp.data) ? resp.data : (resp.data?.stores || [])
      const found = stores.find((s: any) => (s.id ?? s.locationID) === storeId)
      if (found) {
        setStore({ ...found, id: found.id ?? found.locationID })
      }
    } catch (e: any) {
      toast.error('Không thể tải thông tin cửa hàng')
    } finally {
      setLoading(false)
    }
  }

  if (!hasHydrated || loading) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  if (!store) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Không tìm thấy cửa hàng</p>
          <Link href="/admin/stores" className="mt-4 inline-block text-indigo-600 hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  const storeImage = (store as any).imageUrl || store.images?.[0]
  const status = StoreLocationService.resolveStoreStatus(store)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/stores" className="text-gray-500 hover:text-indigo-600 transition-colors">
          Cửa hàng
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{store.name}</span>
      </div>

      {/* Back Button & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
            <p className="text-sm text-gray-500">{StoreLocationService.formatStoreAddress(store)}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
          status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
          status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {status === 'ACTIVE' ? '🟢 Hoạt động' : status === 'PAUSED' ? '🟡 Tạm dừng' : '🔴 Đã đóng'}
        </div>
      </div>

      {/* Store Info Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Store Image */}
          <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-indigo-100 to-blue-100 flex-shrink-0">
            {storeImage ? (
              <Image src={storeImage} alt={store.name} width={256} height={192} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="w-16 h-16 text-indigo-300" />
              </div>
            )}
          </div>
          {/* Store Details */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Địa chỉ</p>
                  <p className="text-sm font-medium text-gray-900">{StoreLocationService.formatStoreAddress(store)}</p>
                </div>
              </div>
              {(store.phone || store.phoneNumber) && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Điện thoại</p>
                    <p className="text-sm font-medium text-gray-900">{(store as any).phone || store.phoneNumber}</p>
                  </div>
                </div>
              )}
              {store.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{store.email}</p>
                  </div>
                </div>
              )}
              {store.openingHours && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Giờ mở cửa</p>
                    <p className="text-sm font-medium text-gray-900">{store.openingHours}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nhân viên */}
        <Link href={`/admin/staff?storeId=${storeId}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Nhân viên</h3>
            <p className="text-sm text-gray-500">Quản lý nhân viên làm việc tại cửa hàng</p>
          </motion.div>
        </Link>

        {/* Cài đặt cửa hàng */}
        <Link href={`/admin/stores/${storeId}/settings`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
              <Settings className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Cài đặt</h3>
            <p className="text-sm text-gray-500">Chỉnh sửa thông tin, trạng thái cửa hàng</p>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}
