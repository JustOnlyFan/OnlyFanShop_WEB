'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import WarrantyService from '@/services/warrantyService'
import { ArrowLeft, Save, Shield } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NewWarrantyPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    durationMonths: 12,
    price: 0,
    description: '',
    termsAndConditions: '',
    coverage: ''
  })

  const formatVND = (value: number): string => {
    if (!value) return ''
    return value.toLocaleString('vi-VN')
  }

  const parseVND = (value: string): number => {
    const numericValue = value.replace(/[^\d]/g, '')
    return numericValue ? parseInt(numericValue, 10) : 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || formData.durationMonths <= 0) {
      toast.error('Vui lòng nhập tên và thời gian bảo hành')
      return
    }

    try {
      setSaving(true)
      await WarrantyService.createWarranty({
        name: formData.name.trim(),
        durationMonths: formData.durationMonths,
        price: formData.price || 0,
        description: formData.description.trim() || undefined,
        termsAndConditions: formData.termsAndConditions.trim() || undefined,
        coverage: formData.coverage.trim() || undefined
      })
      toast.success('Đã tạo gói bảo hành mới')
      router.push('/admin/warranties')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể tạo bảo hành')
    } finally {
      setSaving(false)
    }
  }

  if (!hasHydrated) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/warranties" className="text-gray-500 hover:text-indigo-600 transition-colors">
          Bảo hành
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
          <h1 className="text-2xl font-bold text-gray-900">Thêm gói bảo hành</h1>
          <p className="text-sm text-gray-500">Tạo gói bảo hành mới cho sản phẩm</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Thông tin bảo hành
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói bảo hành *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Bảo hành mở rộng 12 tháng"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (tháng) *</label>
              <input
                type="number"
                value={formData.durationMonths}
                onChange={(e) => setFormData(prev => ({ ...prev, durationMonths: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min={1}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatVND(formData.price)}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseVND(e.target.value) }))}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="500.000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₫</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Mô tả chi tiết về gói bảo hành..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Điều khoản & Điều kiện</label>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Các điều khoản áp dụng..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phạm vi bảo hành</label>
              <textarea
                value={formData.coverage}
                onChange={(e) => setFormData(prev => ({ ...prev, coverage: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Các hạng mục được bảo hành..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/warranties"
            className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
          >
            {saving ? <LoadingSpinner /> : <Save className="w-5 h-5" />}
            Tạo bảo hành
          </button>
        </div>
      </form>
    </div>
  )
}
