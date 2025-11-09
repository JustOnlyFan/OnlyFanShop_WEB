'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import WarrantyService from '@/services/warrantyService'
import { Warranty } from '@/types'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  ArrowLeft,
  Check,
  X,
  Eye,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminWarrantiesPage() {
  const [loading, setLoading] = useState(true)
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editValues, setEditValues] = useState({ 
    name: '', 
    durationMonths: 0, 
    description: '', 
    termsAndConditions: '',
    coverage: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWarranty, setNewWarranty] = useState({ 
    name: '', 
    durationMonths: 0, 
    description: '', 
    termsAndConditions: '',
    coverage: ''
  })
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
    if (!newWarranty.name.trim()) {
      toast.error('Vui lòng nhập tên bảo hành')
      return
    }
    if (!newWarranty.durationMonths || newWarranty.durationMonths <= 0) {
      toast.error('Thời gian bảo hành phải lớn hơn 0')
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
      // Notify other tabs/windows about the update
      if (typeof window !== 'undefined') {
        localStorage.setItem('warrantyAdded', Date.now().toString())
        setTimeout(() => localStorage.removeItem('warrantyAdded'), 1000)
      }
    } catch (error: any) {
      console.error('Add warranty error:', error)
      const errorMessage = error.message || 'Không thể thêm bảo hành'
      toast.error(errorMessage)
    }
  }

  const handleViewDetails = (warranty: Warranty) => {
    setSelectedWarranty(warranty)
    setShowDetailModal(true)
  }

  const handleEdit = (warranty: Warranty) => {
    setSelectedWarranty(warranty)
    setEditValues({
      name: warranty.name,
      durationMonths: warranty.durationMonths,
      description: warranty.description || '',
      termsAndConditions: warranty.termsAndConditions || '',
      coverage: warranty.coverage || ''
    })
    setShowEditModal(true)
    setShowDetailModal(false) // Close detail modal if open
  }

  const handleEditFromDetailModal = () => {
    if (selectedWarranty) {
      setEditValues({
        name: selectedWarranty.name,
        durationMonths: selectedWarranty.durationMonths,
        description: selectedWarranty.description || '',
        termsAndConditions: selectedWarranty.termsAndConditions || '',
        coverage: selectedWarranty.coverage || ''
      })
      setShowEditModal(true)
      setShowDetailModal(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedWarranty) return
    
    if (!editValues.name.trim()) {
      toast.error('Tên bảo hành không được để trống')
      return
    }
    if (!editValues.durationMonths || editValues.durationMonths <= 0) {
      toast.error('Thời gian bảo hành phải lớn hơn 0')
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
      // Notify other tabs/windows about the update
      if (typeof window !== 'undefined') {
        localStorage.setItem('warrantyUpdated', Date.now().toString())
        setTimeout(() => localStorage.removeItem('warrantyUpdated'), 1000)
      }
    } catch (error: any) {
      console.error('Update warranty error:', error)
      const errorMessage = error.message || 'Không thể cập nhật bảo hành'
      toast.error(errorMessage)
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setSelectedWarranty(null)
    setEditValues({ name: '', durationMonths: 0, description: '', termsAndConditions: '', coverage: '' })
  }

  const handleDelete = async (warrantyID: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bảo hành này?')) {
      return
    }

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Bảo hành</h1>
              <p className="mt-1 text-gray-600">Quản lý tất cả các thông tin bảo hành</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm bảo hành
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm bảo hành mới</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên bảo hành <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newWarranty.name}
                    onChange={(e) => setNewWarranty({ ...newWarranty, name: e.target.value })}
                    placeholder="VD: Bảo hành chính hãng 12 tháng"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian bảo hành (tháng) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newWarranty.durationMonths || ''}
                    onChange={(e) => setNewWarranty({ ...newWarranty, durationMonths: parseInt(e.target.value) || 0 })}
                    placeholder="VD: 12"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={newWarranty.description}
                  onChange={(e) => setNewWarranty({ ...newWarranty, description: e.target.value })}
                  placeholder="Mô tả về bảo hành..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điều khoản và điều kiện
                </label>
                <textarea
                  value={newWarranty.termsAndConditions}
                  onChange={(e) => setNewWarranty({ ...newWarranty, termsAndConditions: e.target.value })}
                  placeholder="Điều khoản và điều kiện bảo hành..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phạm vi bảo hành
                </label>
                <textarea
                  value={newWarranty.coverage}
                  onChange={(e) => setNewWarranty({ ...newWarranty, coverage: e.target.value })}
                  placeholder="Phạm vi bảo hành..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddWarranty}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Thêm
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewWarranty({ name: '', durationMonths: 0, description: '', termsAndConditions: '', coverage: '' })
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
            </div>
          </motion.div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bảo hành..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Warranties List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredWarranties.map((warranty, index) => (
              <motion.div
                key={warranty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">
                      {warranty.name}
                    </h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                      {warranty.durationMonths} tháng
                    </span>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(warranty)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(warranty)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(warranty.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredWarranties.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <p>Không tìm thấy bảo hành nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedWarranty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{selectedWarranty.name}</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                  {selectedWarranty.durationMonths} tháng
                </span>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {selectedWarranty.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedWarranty.description}
                  </p>
                </div>
              )}

              {selectedWarranty.termsAndConditions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Điều khoản và điều kiện</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedWarranty.termsAndConditions}
                  </p>
                </div>
              )}

              {selectedWarranty.coverage && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Phạm vi bảo hành</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedWarranty.coverage}
                  </p>
                </div>
              )}

              {!selectedWarranty.description && !selectedWarranty.termsAndConditions && !selectedWarranty.coverage && (
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Chưa có thông tin chi tiết</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleEditFromDetailModal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedWarranty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa bảo hành</h2>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên bảo hành <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editValues.name}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    placeholder="VD: Bảo hành chính hãng 12 tháng"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian bảo hành (tháng) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editValues.durationMonths || ''}
                    onChange={(e) => setEditValues({ ...editValues, durationMonths: parseInt(e.target.value) || 0 })}
                    placeholder="VD: 12"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editValues.description}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  placeholder="Mô tả về bảo hành..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điều khoản và điều kiện
                </label>
                <textarea
                  value={editValues.termsAndConditions}
                  onChange={(e) => setEditValues({ ...editValues, termsAndConditions: e.target.value })}
                  placeholder="Điều khoản và điều kiện bảo hành..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phạm vi bảo hành
                </label>
                <textarea
                  value={editValues.coverage}
                  onChange={(e) => setEditValues({ ...editValues, coverage: e.target.value })}
                  placeholder="Phạm vi bảo hành..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Lưu thay đổi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

