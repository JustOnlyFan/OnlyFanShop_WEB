'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import WarrantyService from '@/services/warrantyService'
import { Warranty } from '@/types'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Eye, Shield } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AdminCard, AdminCardHeader, AdminCardBody, AdminInput, AdminBadge, AdminStats } from '@/components/admin/ui'

export default function AdminWarrantiesPage() {
  const [loading, setLoading] = useState(true)
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadWarranties()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadWarranties = async () => {
    try {
      setLoading(true)
      const data = await WarrantyService.getAllWarranties()
      setWarranties(data)
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách bảo hành')
    } finally {
      setLoading(false)
    }
  }

  // Format VND
  const formatVND = (value: number | undefined | null): string => {
    if (value === undefined || value === null || value === 0) return ''
    return value.toLocaleString('vi-VN')
  }

  const handleDelete = async (warrantyID: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bảo hành này?')) return
    try {
      await WarrantyService.deleteWarranty(warrantyID)
      toast.success('Xóa bảo hành thành công!')
      loadWarranties()
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa bảo hành')
    }
  }

  const filteredWarranties = warranties.filter(warranty =>
    warranty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (warranty.description && warranty.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!hasHydrated || loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <Link 
          href="/admin/warranties/new" 
          className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium shadow-lg inline-flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          Thêm bảo hành
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminStats title="Tổng bảo hành" value={warranties.length} icon={<Shield className="w-5 h-5" />} color="green" />
        <AdminStats title="Trung bình" value={warranties.length > 0 ? `${Math.round(warranties.reduce((sum, w) => sum + w.durationMonths, 0) / warranties.length)} tháng` : '0 tháng'} icon={<Shield className="w-5 h-5" />} color="blue" />
      </div>

      {/* Search */}
      <AdminCard><AdminCardBody><AdminInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm bảo hành..." icon={<Search className="w-5 h-5" />} /></AdminCardBody></AdminCard>

      {/* Warranties List */}
      <AdminCard>
        <AdminCardHeader title="Danh sách bảo hành" subtitle={`${filteredWarranties.length} bảo hành`} />
        <AdminCardBody className="p-0">
          {filteredWarranties.length === 0 ? (
            <div className="p-12 text-center"><Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">Không tìm thấy bảo hành nào</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredWarranties.map((warranty, index) => (
                <motion.div key={warranty.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="p-4 hover:bg-green-50/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-green-50 rounded-lg"><Shield className="w-5 h-5 text-green-600" /></div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{warranty.name}</h3>
                        {warranty.description && <p className="text-sm text-gray-500 line-clamp-1">{warranty.description}</p>}
                      </div>
                      <AdminBadge variant="success" size="sm">{warranty.durationMonths} tháng</AdminBadge>
                      {warranty.price && warranty.price > 0 && (
                        <AdminBadge variant="info" size="sm">{formatVND(warranty.price)} ₫</AdminBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/warranties/${warranty.id}`} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Xem chi tiết"><Eye className="w-5 h-5" /></Link>
                      <Link href={`/admin/warranties/${warranty.id}/edit`} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors" title="Chỉnh sửa"><Edit2 className="w-5 h-5" /></Link>
                      <button onClick={() => handleDelete(warranty.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Xóa"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AdminCardBody>
      </AdminCard>
    </div>
  )
}
