'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import WarrantyService from '@/services/warrantyService'
import { Warranty } from '@/types'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Check, X, Eye, Info, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminButton, AdminCard, AdminCardHeader, AdminCardBody, AdminInput, AdminBadge, AdminStats } from '@/components/admin/ui'

export default function AdminWarrantiesPage() {
  const [loading, setLoading] = useState(true)
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editValues, setEditValues] = useState({ name: '', durationMonths: 0, description: '', termsAndConditions: '', coverage: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWarranty, setNewWarranty] = useState({ name: '', durationMonths: 0, description: '', termsAndConditions: '', coverage: '' })
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
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

  const handleAddWarranty = async () => {
    if (!newWarranty.name.trim() || !newWarranty.durationMonths || newWarranty.durationMonths <= 0) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }
    try {
      await WarrantyService.createWarranty({
        name: newWarranty.name.trim(),
        durationMonths: newWarranty.durationMonths,
        description: newWarranty.description.trim() || undefined,
        termsAndConditions: newWarranty.termsAndConditions.trim() || undefined,
        coverage: newWarranty.coverage.trim() || undefined
      })
      toast.success('Thêm bảo hành thành công!')
      setNewWarranty({ name: '', durationMonths: 0, description: '', termsAndConditions: '', coverage: '' })
      setShowAddForm(false)
      await loadWarranties()
    } catch (error: any) {
      toast.error(error.message || 'Không thể thêm bảo hành')
    }
  }

  const handleViewDetails = (warranty: Warranty) => { setSelectedWarranty(warranty); setShowDetailModal(true) }

  const handleEdit = (warranty: Warranty) => {
    setSelectedWarranty(warranty)
    setEditValues({ name: warranty.name, durationMonths: warranty.durationMonths, description: warranty.description || '', termsAndConditions: warranty.termsAndConditions || '', coverage: warranty.coverage || '' })
    setShowEditModal(true)
    setShowDetailModal(false)
  }

  const handleSaveEdit = async () => {
    if (!selectedWarranty || !editValues.name.trim() || !editValues.durationMonths || editValues.durationMonths <= 0) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }
    try {
      await WarrantyService.updateWarranty(selectedWarranty.id, {
        name: editValues.name.trim(),
        durationMonths: editValues.durationMonths,
        description: editValues.description.trim() || undefined,
        termsAndConditions: editValues.termsAndConditions.trim() || undefined,
        coverage: editValues.coverage.trim() || undefined
      })
      toast.success('Cập nhật bảo hành thành công!')
      setShowEditModal(false)
      setSelectedWarranty(null)
      setEditValues({ name: '', durationMonths: 0, description: '', termsAndConditions: '', coverage: '' })
      await loadWarranties()
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật bảo hành')
    }
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
        <AdminButton variant="success" icon={<Plus className="w-5 h-5" />} onClick={() => setShowAddForm(!showAddForm)}>Thêm bảo hành</AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminStats title="Tổng bảo hành" value={warranties.length} icon={<Shield className="w-5 h-5" />} color="green" />
        <AdminStats title="Trung bình" value={warranties.length > 0 ? `${Math.round(warranties.reduce((sum, w) => sum + w.durationMonths, 0) / warranties.length)} tháng` : '0 tháng'} icon={<Shield className="w-5 h-5" />} color="blue" />
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <AdminCard>
            <AdminCardHeader title="Thêm bảo hành mới" />
            <AdminCardBody>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <AdminInput value={newWarranty.name} onChange={(e) => setNewWarranty({ ...newWarranty, name: e.target.value })} placeholder="Tên bảo hành *" label="Tên bảo hành" />
                <AdminInput type="number" value={newWarranty.durationMonths || ''} onChange={(e) => setNewWarranty({ ...newWarranty, durationMonths: parseInt(e.target.value) || 0 })} placeholder="12" label="Thời gian (tháng) *" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea value={newWarranty.description} onChange={(e) => setNewWarranty({ ...newWarranty, description: e.target.value })} placeholder="Mô tả..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div className="flex gap-3">
                <AdminButton variant="success" onClick={handleAddWarranty}>Thêm</AdminButton>
                <AdminButton variant="secondary" onClick={() => { setShowAddForm(false); setNewWarranty({ name: '', durationMonths: 0, description: '', termsAndConditions: '', coverage: '' }) }}>Hủy</AdminButton>
              </div>
            </AdminCardBody>
          </AdminCard>
        </motion.div>
      )}

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
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleViewDetails(warranty)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Xem chi tiết"><Eye className="w-5 h-5" /></button>
                      <button onClick={() => handleEdit(warranty)} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors" title="Chỉnh sửa"><Edit2 className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(warranty.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Xóa"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AdminCardBody>
      </AdminCard>

      {/* Detail Modal */}
      {showDetailModal && selectedWarranty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{selectedWarranty.name}</h2>
                <AdminBadge variant="success">{selectedWarranty.durationMonths} tháng</AdminBadge>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {selectedWarranty.description && <div><p className="text-sm font-medium text-gray-500 mb-1">Mô tả</p><p className="text-gray-700">{selectedWarranty.description}</p></div>}
              {selectedWarranty.termsAndConditions && <div><p className="text-sm font-medium text-gray-500 mb-1">Điều khoản</p><p className="text-gray-700">{selectedWarranty.termsAndConditions}</p></div>}
              {selectedWarranty.coverage && <div><p className="text-sm font-medium text-gray-500 mb-1">Phạm vi</p><p className="text-gray-700">{selectedWarranty.coverage}</p></div>}
              {!selectedWarranty.description && !selectedWarranty.termsAndConditions && !selectedWarranty.coverage && (
                <div className="text-center py-4 text-gray-500"><Info className="w-10 h-10 mx-auto mb-2 text-gray-400" /><p>Chưa có thông tin chi tiết</p></div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <AdminButton variant="secondary" onClick={() => setShowDetailModal(false)}>Đóng</AdminButton>
              <AdminButton variant="success" icon={<Edit2 className="w-4 h-4" />} onClick={() => handleEdit(selectedWarranty)}>Chỉnh sửa</AdminButton>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedWarranty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa bảo hành</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedWarranty(null) }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <AdminInput value={editValues.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} placeholder="Tên" label="Tên bảo hành *" />
                <AdminInput type="number" value={editValues.durationMonths || ''} onChange={(e) => setEditValues({ ...editValues, durationMonths: parseInt(e.target.value) || 0 })} placeholder="12" label="Thời gian (tháng) *" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea value={editValues.description} onChange={(e) => setEditValues({ ...editValues, description: e.target.value })} placeholder="Mô tả..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <AdminButton variant="secondary" onClick={() => { setShowEditModal(false); setSelectedWarranty(null) }}>Hủy</AdminButton>
              <AdminButton variant="success" icon={<Check className="w-4 h-4" />} onClick={handleSaveEdit}>Lưu thay đổi</AdminButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
