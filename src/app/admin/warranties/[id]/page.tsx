'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import WarrantyService from '@/services/warrantyService'
import { Warranty } from '@/types'
import { ArrowLeft, Edit2, Trash2, Shield, Clock, DollarSign, FileText, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function WarrantyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const warrantyId = Number(params.id)
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [warranty, setWarranty] = useState<Warranty | null>(null)

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return
    loadWarranty()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated, user?.role, warrantyId])

  const loadWarranty = async () => {
    try {
      setLoading(true)
      const warranties = await WarrantyService.getAllWarranties()
      const found = warranties.find(w => w.id === warrantyId)
      setWarranty(found || null)
    } catch (e: any) {
      toast.error('Không thể tải thông tin bảo hành')
    } finally {
      setLoading(false)
    }
  }

  const formatVND = (value: number | undefined | null): string => {
    if (!value) return '0'
    return value.toLocaleString('vi-VN')
  }

  const handleDelete = async () => {
    if (!confirm(`Xác nhận xóa gói bảo hành "${warranty?.name}"?`)) return
    try {
      await WarrantyService.deleteWarranty(warrantyId)
      toast.success('Đã xóa gói bảo hành')
      router.push('/admin/warranties')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể xóa')
    }
  }

  if (!hasHydrated || loading) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  if (!warranty) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Không tìm thấy gói bảo hành</p>
          <Link href="/admin/warranties" className="mt-4 inline-block text-indigo-600 hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/warranties" className="text-gray-500 hover:text-indigo-600 transition-colors">
          Bảo hành
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">{warranty.name}</span>
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
            <h1 className="text-2xl font-bold text-gray-900">{warranty.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {warranty.durationMonths} tháng
              </span>
              {warranty.price && warranty.price > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {formatVND(warranty.price)} ₫
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/warranties/${warrantyId}/edit`}
            className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            <Edit2 className="w-5 h-5" />
            Chỉnh sửa
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors inline-flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Xóa
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Thông tin cơ bản
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Thời gian bảo hành</p>
                <p className="font-semibold text-gray-900">{warranty.durationMonths} tháng</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Giá gói bảo hành</p>
                <p className="font-semibold text-gray-900">
                  {warranty.price && warranty.price > 0 ? `${formatVND(warranty.price)} ₫` : 'Miễn phí'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Mô tả
          </h3>
          <p className="text-gray-600">
            {warranty.description || 'Chưa có mô tả'}
          </p>
        </div>
      </div>

      {/* Terms & Coverage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warranty.termsAndConditions && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Điều khoản & Điều kiện</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{warranty.termsAndConditions}</p>
          </div>
        )}
        {warranty.coverage && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Phạm vi bảo hành
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap">{warranty.coverage}</p>
          </div>
        )}
      </div>
    </div>
  )
}
