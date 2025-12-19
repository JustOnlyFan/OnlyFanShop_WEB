'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StaffService } from '@/services/staffService'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, User, Mail, Phone, Lock, Store, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewStaffPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    storeLocationId: ''
  })

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return
    loadStores()
  }, [hasHydrated, isAuthenticated, user?.role])

  const loadStores = async () => {
    try {
      setLoading(true)
      const resp = await StoreLocationService.getStoreLocations()
      const data = Array.isArray(resp.data) ? resp.data : (resp.data?.stores || [])
      setStores(data.map((s: any) => ({ ...s, id: s.id ?? s.locationID })))
    } catch (e: any) {
      toast.error('Không thể tải danh sách cửa hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setSaving(true)
      await StaffService.createStaff({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phone || undefined,
        storeLocationId: formData.storeLocationId ? Number(formData.storeLocationId) : undefined
      })
      toast.success('Đã tạo nhân viên mới')
      router.push('/admin/staff')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể tạo nhân viên')
    } finally {
      setSaving(false)
    }
  }

  if (!hasHydrated || loading) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/staff" className="text-gray-500 hover:text-indigo-600 transition-colors">
          Nhân viên
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Thêm mới</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm nhân viên mới</h1>
          <p className="text-sm text-gray-500">Tạo tài khoản nhân viên cho cửa hàng</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Thông tin tài khoản
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" />
            Thông tin cá nhân
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0xxx xxx xxx"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-600" />
            Phân công cửa hàng
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng làm việc</label>
            <select
              value={formData.storeLocationId}
              onChange={(e) => setFormData(prev => ({ ...prev, storeLocationId: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">-- Chọn cửa hàng --</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name} - {store.address}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Có thể để trống và phân công sau</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/staff"
            className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
          >
            {saving ? <LoadingSpinner /> : <Save className="w-5 h-5" />}
            Tạo nhân viên
          </button>
        </div>
      </form>
    </div>
  )
}
