'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreLocationService, StoreLocation, StoreStatus } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Store, MapPin, Phone, Mail, Clock, Image as ImageIcon, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function StoreSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = Number(params.id)
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [store, setStore] = useState<StoreLocation | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    phoneNumber: '',
    email: '',
    openingHours: '',
    description: '',
    status: 'ACTIVE' as StoreStatus
  })

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
        const storeData = { ...found, id: found.id ?? found.locationID }
        setStore(storeData)
        setFormData({
          name: storeData.name || '',
          address: storeData.address || '',
          city: storeData.city || '',
          district: storeData.district || '',
          ward: storeData.ward || '',
          phoneNumber: storeData.phoneNumber || (storeData as any).phone || '',
          email: storeData.email || '',
          openingHours: storeData.openingHours || '',
          description: storeData.description || '',
          status: StoreLocationService.resolveStoreStatus(storeData)
        })
      }
    } catch (e: any) {
      toast.error('Không thể tải thông tin cửa hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên cửa hàng')
      return
    }
    try {
      setSaving(true)
      await StoreLocationService.updateStoreLocation(storeId, formData)
      toast.success('Đã cập nhật thông tin cửa hàng')
      loadStore()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể cập nhật')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Xác nhận xóa cửa hàng "${store?.name}"? Hành động này không thể hoàn tác.`)) return
    try {
      await StoreLocationService.deleteStoreLocation(storeId)
      toast.success('Đã xóa cửa hàng')
      router.push('/admin/stores')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể xóa cửa hàng')
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/stores" className="text-gray-500 hover:text-indigo-600 transition-colors">
          Cửa hàng
        </Link>
        <span className="text-gray-400">/</span>
        <Link href={`/admin/stores/${storeId}`} className="text-gray-500 hover:text-indigo-600 transition-colors">
          {store?.name || 'Chi tiết'}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Cài đặt</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt cửa hàng</h1>
            <p className="text-sm text-gray-500">Chỉnh sửa thông tin {store?.name}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
        >
          {saving ? <LoadingSpinner /> : <Save className="w-5 h-5" />}
          Lưu thay đổi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nhập tên cửa hàng"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Mô tả về cửa hàng"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Địa chỉ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Số nhà, tên đường..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Chọn tỉnh/thành</option>
                  {StoreLocationService.getVietnameseCities().map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nhập phường/xã"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Liên hệ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0xxx xxx xxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Giờ mở cửa</label>
                <input
                  type="text"
                  value={formData.openingHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="8:00 - 22:00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái</h3>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as StoreStatus }))}
              className={`w-full px-4 py-3 rounded-xl font-medium border-2 transition-colors ${
                formData.status === 'ACTIVE' 
                  ? 'border-green-200 bg-green-50 text-green-700' 
                  : formData.status === 'PAUSED' 
                    ? 'border-yellow-200 bg-yellow-50 text-yellow-700' 
                    : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              <option value="ACTIVE">🟢 Hoạt động</option>
              <option value="PAUSED">🟡 Tạm dừng</option>
              <option value="CLOSED">🔴 Đã đóng</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              {formData.status === 'ACTIVE' && 'Cửa hàng đang hoạt động bình thường'}
              {formData.status === 'PAUSED' && 'Cửa hàng tạm ngừng hoạt động'}
              {formData.status === 'CLOSED' && 'Cửa hàng đã đóng cửa vĩnh viễn'}
            </p>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <h3 className="font-semibold text-red-600 mb-4">Vùng nguy hiểm</h3>
            <p className="text-sm text-gray-600 mb-4">
              Xóa cửa hàng sẽ xóa tất cả dữ liệu liên quan bao gồm sản phẩm, nhân viên và lịch sử giao dịch.
            </p>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Xóa cửa hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
