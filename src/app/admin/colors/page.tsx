'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import ColorService from '@/services/colorService'
import { Color } from '@/types'
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

export default function AdminColorsPage() {
  const [loading, setLoading] = useState(true)
  const [colors, setColors] = useState<Color[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editValues, setEditValues] = useState({ 
    name: '', 
    hexCode: '', 
    description: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newColor, setNewColor] = useState({ 
    name: '', 
    hexCode: '', 
    description: ''
  })
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)
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
    loadColors()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadColors = async () => {
    try {
      setLoading(true)
      const data = await ColorService.getAllColors()
      setColors(data)
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách màu sắc')
    } finally {
      setLoading(false)
    }
  }

  const handleAddColor = async () => {
    if (!newColor.name.trim()) {
      toast.error('Vui lòng nhập tên màu sắc')
      return
    }

    try {
      await ColorService.createColor({
        name: newColor.name.trim(),
        hexCode: newColor.hexCode.trim() || undefined,
        description: newColor.description.trim() || undefined
      })
      toast.success('Thêm màu sắc thành công!')
      setNewColor({ name: '', hexCode: '', description: '' })
      setShowAddForm(false)
      await loadColors()
      // Notify other tabs/windows about the update
      if (typeof window !== 'undefined') {
        localStorage.setItem('colorAdded', Date.now().toString())
        setTimeout(() => localStorage.removeItem('colorAdded'), 1000)
      }
    } catch (error: any) {
      console.error('Add color error:', error)
      const errorMessage = error.message || 'Không thể thêm màu sắc'
      toast.error(errorMessage)
    }
  }

  const handleViewDetails = (color: Color) => {
    setSelectedColor(color)
    setShowDetailModal(true)
  }

  const handleEdit = (color: Color) => {
    setSelectedColor(color)
    setEditValues({
      name: color.name,
      hexCode: color.hexCode || '',
      description: color.description || ''
    })
    setShowEditModal(true)
    setShowDetailModal(false) // Close detail modal if open
  }

  const handleEditFromDetailModal = () => {
    if (selectedColor) {
      setEditValues({
        name: selectedColor.name,
        hexCode: selectedColor.hexCode || '',
        description: selectedColor.description || ''
      })
      setShowEditModal(true)
      setShowDetailModal(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedColor) return
    
    if (!editValues.name.trim()) {
      toast.error('Tên màu sắc không được để trống')
      return
    }

    try {
      await ColorService.updateColor(selectedColor.id, {
        name: editValues.name.trim(),
        hexCode: editValues.hexCode.trim() || undefined,
        description: editValues.description.trim() || undefined
      })
      toast.success('Cập nhật màu sắc thành công!')
      setShowEditModal(false)
      setSelectedColor(null)
      setEditValues({ name: '', hexCode: '', description: '' })
      await loadColors()
      // Notify other tabs/windows about the update
      if (typeof window !== 'undefined') {
        localStorage.setItem('colorUpdated', Date.now().toString())
        setTimeout(() => localStorage.removeItem('colorUpdated'), 1000)
      }
    } catch (error: any) {
      console.error('Update color error:', error)
      const errorMessage = error.message || 'Không thể cập nhật màu sắc'
      toast.error(errorMessage)
    }
  }

  const handleCancelEdit = () => {
    setShowEditModal(false)
    setSelectedColor(null)
    setEditValues({ name: '', hexCode: '', description: '' })
  }

  const handleDelete = async (colorID: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa màu sắc này?')) {
      return
    }

    try {
      await ColorService.deleteColor(colorID)
      toast.success('Xóa màu sắc thành công!')
      loadColors()
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa màu sắc')
    }
  }

  const filteredColors = colors.filter(color =>
    color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (color.hexCode && color.hexCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (color.description && color.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Màu sắc</h1>
              <p className="mt-1 text-gray-600">Quản lý tất cả các màu sắc sản phẩm</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm màu sắc
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm màu sắc mới</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên màu sắc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newColor.name}
                    onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                    placeholder="VD: Đỏ, Xanh dương, Trắng"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã màu (Hex Code)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newColor.hexCode}
                      onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })}
                      placeholder="VD: #FF0000"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {newColor.hexCode && (
                      <div
                        className="w-10 h-10 rounded border border-gray-300"
                        style={{ backgroundColor: newColor.hexCode }}
                        title={newColor.hexCode}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={newColor.description}
                  onChange={(e) => setNewColor({ ...newColor, description: e.target.value })}
                  placeholder="Mô tả về màu sắc..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddColor}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Thêm
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewColor({ name: '', hexCode: '', description: '' })
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
              placeholder="Tìm kiếm màu sắc..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Colors List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredColors.map((color, index) => (
              <motion.div
                key={color.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-3">
                    {color.hexCode && (
                      <div
                        className="w-10 h-10 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: color.hexCode }}
                        title={color.hexCode}
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{color.name}</h3>
                      {color.hexCode && (
                        <p className="text-sm text-gray-500">{color.hexCode}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(color)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(color)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(color.id)}
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

          {filteredColors.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <p>Không tìm thấy màu sắc nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedColor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedColor.hexCode && (
                  <div
                    className="w-12 h-12 rounded border border-gray-300"
                    style={{ backgroundColor: selectedColor.hexCode }}
                    title={selectedColor.hexCode}
                  />
                )}
                <h2 className="text-2xl font-bold text-gray-900">{selectedColor.name}</h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {selectedColor.hexCode && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mã màu</h3>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded border border-gray-300"
                      style={{ backgroundColor: selectedColor.hexCode }}
                    />
                    <p className="text-gray-700 font-mono">{selectedColor.hexCode}</p>
                  </div>
                </div>
              )}

              {selectedColor.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedColor.description}
                  </p>
                </div>
              )}

              {!selectedColor.hexCode && !selectedColor.description && (
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedColor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa màu sắc</h2>
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
                    Tên màu sắc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editValues.name}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    placeholder="VD: Đỏ, Xanh dương, Trắng"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã màu (Hex Code)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editValues.hexCode}
                      onChange={(e) => setEditValues({ ...editValues, hexCode: e.target.value })}
                      placeholder="VD: #FF0000"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {editValues.hexCode && (
                      <div
                        className="w-10 h-10 rounded border border-gray-300"
                        style={{ backgroundColor: editValues.hexCode }}
                        title={editValues.hexCode}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editValues.description}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  placeholder="Mô tả về màu sắc..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
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






