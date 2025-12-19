'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StaffService, Staff } from '@/services/staffService'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, User, Mail, Phone, Store, Key, Trash2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function EditStaffPage() {
  const params = useParams()
  const router = useRouter()
  const staffId = Number(params.id)
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [staff, setStaff] = useState<Staff | null>(null)
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    storeLocationId: ''
  })

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated, user?.role, staffId])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load stores
      const storeResp = await StoreLocationService.getStoreLocations()
      const storeData = Array.isArray(storeResp.data) ? storeResp.data : (storeResp.data?.stores || [])
      setStores(storeData.map((s: any) => ({ ...s, id: s.id ?? s.locationID })))
      
      // Load staff
      const staffResp = await StaffService.getAllStaff()
      const staffList = staffResp.data?.content || staffResp.data?.staff || []
      const found = staffList.find((s: any) => s.id === staffId || s.userID === staffId)
      if (found) {
        setStaff(found)
        const staffData = found as any
        setFormData({
          username: staffData.username || '',
          email: staffData.email || '',
          fullName: staffData.fullName || staffData.fullname || '',
          phone: staffData.phone || staffData.phoneNumber || '',
          storeLocationId: staffData.storeLocationId?.toString() || ''
        })
      }
    } catch (e: any) {
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    try {
      setSaving(true)
      await StaffService.updateStaff(staffId, {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phone || undefined,
        storeLocationId: formData.storeLocationId ? Number(formData.storeLocationId) : undefined
      } as any)
      toast.success('Đã cập nhật thông tin nhân viên')
      router.push('/admin/staff')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể cập nhật')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!confirm('Xác nhận reset mật khẩu cho nhân viên này?')) return
    try {
      await StaffService.resetStaffPassword(staffId)
      toast.success('Đã reset mật khẩu')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể reset mật khẩu')
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Xác nhận xóa nhân viên "${staff?.username}"?`)) return
    try {
      await StaffService.deleteStaff(staffId)
      toast.success('Đã xóa nhân viên')
      router.push('/admin/staff')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể xóa')
    }
  }

  if (!hasHydrated || loading) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  if (!staff) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Không tìm thấy nhân viên</p>
          <Link href="/admin/staff" className="mt-4 inline-block text-indigo-600 hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/staff" className="text-gray-500 hover:text-indigo-600 transition-colors">
          Nhân viên
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Chỉnh sửa</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa nhân viên</h1>
            <p className="text-sm text-gray-500">{staff.username}</p>
          </div>
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
                required
              />
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-600" />
            Phân công cửa hàng
          </h3>
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
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResetPassword}
              className="px-4 py-2.5 text-purple-600 bg-purple-50 rounded-xl font-medium hover:bg-purple-100 transition-colors inline-flex items-center gap-2"
            >
              <Key className="w-5 h-5" />
              Reset mật khẩu
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2.5 text-red-600 bg-red-50 rounded-xl font-medium hover:bg-red-100 transition-colors inline-flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Xóa
            </button>
          </div>
          <div className="flex gap-3">
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
              Lưu thay đổi
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
