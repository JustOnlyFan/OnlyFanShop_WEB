'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import ColorService from '@/services/colorService'
import { Color } from '@/types'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Check, X, Eye, Info, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminButton, AdminCard, AdminCardHeader, AdminCardBody, AdminInput } from '@/components/admin/ui'

export default function AdminColorsPage() {
  const [loading, setLoading] = useState(true)
  const [colors, setColors] = useState<Color[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editValues, setEditValues] = useState({ name: '', hexCode: '', description: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newColor, setNewColor] = useState({ name: '', hexCode: '', description: '' })
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
    } catch (error: any) {
      toast.error(error.message || 'Không thể thêm màu sắc')
    }
  }

  const handleViewDetails = (color: Color) => {
    setSelectedColor(color)
    setShowDetailModal(true)
  }

  const handleEdit = (color: Color) => {
    setSelectedColor(color)
    setEditValues({ name: color.name, hexCode: color.hexCode || '', description: color.description || '' })
    setShowEditModal(true)
    setShowDetailModal(false)
  }

  const handleSaveEdit = async () => {
    if (!selectedColor || !editValues.name.trim()) {
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
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật màu sắc')
    }
  }

  const handleDelete = async (colorID: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa màu sắc này?')) return
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
    (color.hexCode && color.hexCode.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (!hasHydrated || loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <AdminButton variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => setShowAddForm(!showAddForm)}>
          Thêm màu sắc
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminCard>
          <AdminCardBody className="flex items-center gap-4">
            <div className="p-3 bg-pink-100 rounded-xl"><Palette className="w-6 h-6 text-pink-600" /></div>
            <div><p className="text-sm text-gray-500">Tổng màu sắc</p><p className="text-2xl font-bold">{colors.length}</p></div>
          </AdminCardBody>
        </AdminCard>
        <AdminCard>
          <AdminCardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl"><Palette className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Có mã màu</p><p className="text-2xl font-bold">{colors.filter(c => c.hexCode).length}</p></div>
          </AdminCardBody>
        </AdminCard>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <AdminCard>
            <AdminCardHeader title="Thêm màu sắc mới" />
            <AdminCardBody>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <AdminInput value={newColor.name} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })} placeholder="VD: Đỏ, Xanh dương" label="Tên màu sắc *" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã màu (Hex)</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={newColor.hexCode} onChange={(e) => setNewColor({ ...newColor, hexCode: e.target.value })} placeholder="#FF0000" className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    {newColor.hexCode && <div className="w-12 h-12 rounded-xl border-2 border-gray-200" style={{ backgroundColor: newColor.hexCode }} />}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea value={newColor.description} onChange={(e) => setNewColor({ ...newColor, description: e.target.value })} placeholder="Mô tả về màu sắc..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div className="flex gap-3">
                <AdminButton variant="primary" onClick={handleAddColor}>Thêm</AdminButton>
                <AdminButton variant="secondary" onClick={() => { setShowAddForm(false); setNewColor({ name: '', hexCode: '', description: '' }) }}>Hủy</AdminButton>
              </div>
            </AdminCardBody>
          </AdminCard>
        </motion.div>
      )}

      {/* Search */}
      <AdminCard><AdminCardBody><AdminInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm màu sắc..." icon={<Search className="w-5 h-5" />} /></AdminCardBody></AdminCard>

      {/* Colors List */}
      <AdminCard>
        <AdminCardHeader title="Danh sách màu sắc" subtitle={`${filteredColors.length} màu sắc`} />
        <AdminCardBody className="p-0">
          {filteredColors.length === 0 ? (
            <div className="p-12 text-center"><Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">Không tìm thấy màu sắc nào</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredColors.map((color, index) => (
                <motion.div key={color.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="p-4 hover:bg-pink-50/50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {color.hexCode ? (
                        <div className="w-12 h-12 rounded-xl border-2 border-gray-200 flex-shrink-0 shadow-sm" style={{ backgroundColor: color.hexCode }} title={color.hexCode} />
                      ) : (
                        <div className="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 flex-shrink-0">
                          <Palette className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{color.name}</h3>
                        {color.hexCode && <p className="text-sm text-gray-500 font-mono">{color.hexCode}</p>}
                        {color.description && <p className="text-sm text-gray-400 line-clamp-1">{color.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleViewDetails(color)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Xem chi tiết"><Eye className="w-5 h-5" /></button>
                      <button onClick={() => handleEdit(color)} className="p-2 text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors" title="Chỉnh sửa"><Edit2 className="w-5 h-5" /></button>
                      <button onClick={() => handleDelete(color.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Xóa"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AdminCardBody>
      </AdminCard>

      {/* Detail Modal */}
      {showDetailModal && selectedColor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedColor.hexCode && <div className="w-12 h-12 rounded-xl border-2 border-gray-200" style={{ backgroundColor: selectedColor.hexCode }} />}
                <h2 className="text-xl font-bold text-gray-900">{selectedColor.name}</h2>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {selectedColor.hexCode && (
                <div><p className="text-sm font-medium text-gray-500 mb-1">Mã màu</p><p className="font-mono text-gray-900">{selectedColor.hexCode}</p></div>
              )}
              {selectedColor.description && (
                <div><p className="text-sm font-medium text-gray-500 mb-1">Mô tả</p><p className="text-gray-700">{selectedColor.description}</p></div>
              )}
              {!selectedColor.hexCode && !selectedColor.description && (
                <div className="text-center py-4 text-gray-500"><Info className="w-10 h-10 mx-auto mb-2 text-gray-400" /><p>Chưa có thông tin chi tiết</p></div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <AdminButton variant="secondary" onClick={() => setShowDetailModal(false)}>Đóng</AdminButton>
              <AdminButton variant="primary" icon={<Edit2 className="w-4 h-4" />} onClick={() => handleEdit(selectedColor)}>Chỉnh sửa</AdminButton>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedColor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa màu sắc</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedColor(null) }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <AdminInput value={editValues.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} placeholder="Tên màu sắc" label="Tên màu sắc *" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã màu (Hex)</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={editValues.hexCode} onChange={(e) => setEditValues({ ...editValues, hexCode: e.target.value })} placeholder="#FF0000" className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  {editValues.hexCode && <div className="w-12 h-12 rounded-xl border-2 border-gray-200" style={{ backgroundColor: editValues.hexCode }} />}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea value={editValues.description} onChange={(e) => setEditValues({ ...editValues, description: e.target.value })} placeholder="Mô tả..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <AdminButton variant="secondary" onClick={() => { setShowEditModal(false); setSelectedColor(null) }}>Hủy</AdminButton>
              <AdminButton variant="primary" icon={<Check className="w-4 h-4" />} onClick={handleSaveEdit}>Lưu thay đổi</AdminButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
