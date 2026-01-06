'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import TagService from '@/services/tagService'
import { TagDTO } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Tag,
  Palette,
  Hash
} from 'lucide-react'
import toast from 'react-hot-toast'
import { 
  AdminButton, 
  AdminCard, 
  AdminCardHeader, 
  AdminCardBody,
  AdminInput,
  AdminBadge
} from '@/components/admin/ui'

// Predefined badge colors
const BADGE_COLORS = [
  { name: 'Đỏ', value: '#EF4444', bg: 'bg-red-500' },
  { name: 'Cam', value: '#F97316', bg: 'bg-orange-500' },
  { name: 'Vàng', value: '#EAB308', bg: 'bg-yellow-500' },
  { name: 'Xanh lá', value: '#22C55E', bg: 'bg-green-500' },
  { name: 'Xanh dương', value: '#3B82F6', bg: 'bg-blue-500' },
  { name: 'Tím', value: '#8B5CF6', bg: 'bg-purple-500' },
  { name: 'Hồng', value: '#EC4899', bg: 'bg-pink-500' },
  { name: 'Xám', value: '#6B7280', bg: 'bg-gray-500' },
]

export default function AdminTagsPage() {
  const [loading, setLoading] = useState(true)
  const [tags, setTags] = useState<TagDTO[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTag, setEditingTag] = useState<TagDTO | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    displayName: '',
    badgeColor: '#3B82F6',
    displayOrder: 0
  })
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadTags()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadTags = async () => {
    try {
      setLoading(true)
      console.log('AdminTagsPage - Starting to load tags...')
      const data = await TagService.getAllTags()
      console.log('AdminTagsPage - Tags loaded:', data)
      setTags(data || [])
      console.log('AdminTagsPage - Tags set to state, count:', data?.length || 0)
    } catch (error: any) {
      console.error('AdminTagsPage - Error loading tags:', error)
      console.error('AdminTagsPage - Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      })
      toast.error(error.response?.data?.message || error.message || 'Không thể tải danh sách nhãn')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      displayName: '',
      badgeColor: '#3B82F6',
      displayOrder: 0
    })
    setEditingTag(null)
    setShowAddForm(false)
  }

  const handleAddTag = async () => {
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã nhãn')
      return
    }
    if (!formData.displayName.trim()) {
      toast.error('Vui lòng nhập tên hiển thị')
      return
    }

    // Validate code format (uppercase, no spaces)
    const codeRegex = /^[A-Z0-9_]+$/
    const normalizedCode = formData.code.trim().toUpperCase().replace(/\s+/g, '_')
    if (!codeRegex.test(normalizedCode)) {
      toast.error('Mã nhãn chỉ được chứa chữ cái in hoa, số và dấu gạch dưới')
      return
    }

    setSaving(true)
    try {
      await TagService.createTag({
        code: normalizedCode,
        displayName: formData.displayName.trim(),
        badgeColor: formData.badgeColor,
        displayOrder: formData.displayOrder
      })
      toast.success('Thêm nhãn thành công!')
      resetForm()
      loadTags()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Không thể thêm nhãn')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (tag: TagDTO) => {
    setEditingTag(tag)
    setFormData({
      code: tag.code,
      displayName: tag.displayName,
      badgeColor: tag.badgeColor || '#3B82F6',
      displayOrder: tag.displayOrder || 0
    })
    setShowAddForm(true)
  }

  const handleSaveEdit = async () => {
    if (!editingTag) return
    if (!formData.displayName.trim()) {
      toast.error('Tên hiển thị không được để trống')
      return
    }

    setSaving(true)
    try {
      await TagService.updateTag(editingTag.id, {
        // Code cannot be changed after creation
        displayName: formData.displayName.trim(),
        badgeColor: formData.badgeColor,
        displayOrder: formData.displayOrder
      })
      toast.success('Cập nhật nhãn thành công!')
      resetForm()
      loadTags()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Không thể cập nhật nhãn')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tagId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhãn này? Nhãn sẽ bị gỡ khỏi tất cả sản phẩm.')) {
      return
    }

    try {
      await TagService.deleteTag(tagId)
      toast.success('Xóa nhãn thành công!')
      loadTags()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Không thể xóa nhãn')
    }
  }

  // Filter tags by search term
  const filteredTags = tags.filter(tag =>
    tag.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhãn sản phẩm</h1>
        </div>
        <AdminButton
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }}
        >
          Thêm nhãn
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminCard>
          <AdminCardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số nhãn</p>
              <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
            </div>
          </AdminCardBody>
        </AdminCard>
        <AdminCard>
          <AdminCardBody className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Màu sắc có sẵn</p>
              <p className="text-2xl font-bold text-purple-600">{BADGE_COLORS.length}</p>
            </div>
          </AdminCardBody>
        </AdminCard>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AdminCard>
              <AdminCardHeader 
                title={editingTag ? 'Chỉnh sửa nhãn' : 'Thêm nhãn mới'} 
              />
              <AdminCardBody>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã nhãn * <span className="text-xs text-gray-500">(VD: NEW, BESTSELLER, SALE)</span>
                    </label>
                    <AdminInput
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        code: e.target.value.toUpperCase().replace(/\s+/g, '_')
                      }))}
                      placeholder="VD: NEW, BESTSELLER..."
                      disabled={!!editingTag}
                      icon={<Hash className="w-4 h-4" />}
                    />
                    {editingTag && (
                      <p className="mt-1 text-xs text-gray-500">Mã nhãn không thể thay đổi sau khi tạo</p>
                    )}
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên hiển thị *
                    </label>
                    <AdminInput
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="VD: Mới, Bán chạy, Giảm giá..."
                    />
                  </div>

                  {/* Badge Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu badge
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BADGE_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, badgeColor: color.value }))}
                          className={`w-8 h-8 rounded-full ${color.bg} transition-transform ${
                            formData.badgeColor === color.value 
                              ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' 
                              : 'hover:scale-105'
                          }`}
                          title={color.name}
                        />
                      ))}
                      {/* Custom color input */}
                      <div className="relative">
                        <input
                          type="color"
                          value={formData.badgeColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, badgeColor: e.target.value }))}
                          className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300"
                          title="Chọn màu tùy chỉnh"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Màu đã chọn: <span style={{ color: formData.badgeColor }}>{formData.badgeColor}</span>
                    </p>
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thứ tự hiển thị
                    </label>
                    <AdminInput
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>

                  {/* Preview */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xem trước
                    </label>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <span 
                        className="px-3 py-1 rounded-full text-white text-sm font-medium"
                        style={{ backgroundColor: formData.badgeColor }}
                      >
                        {formData.displayName || 'Tên nhãn'}
                      </span>
                      <span className="text-gray-500 text-sm">
                        Mã: {formData.code || 'CODE'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <AdminButton 
                    variant="primary" 
                    onClick={editingTag ? handleSaveEdit : handleAddTag}
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu...' : (editingTag ? 'Cập nhật' : 'Thêm')}
                  </AdminButton>
                  <AdminButton 
                    variant="secondary" 
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Hủy
                  </AdminButton>
                </div>
              </AdminCardBody>
            </AdminCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <AdminCard>
        <AdminCardBody>
          <AdminInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm nhãn..."
            icon={<Search className="w-5 h-5" />}
          />
        </AdminCardBody>
      </AdminCard>

      {/* Tags List */}
      <AdminCard>
        <AdminCardHeader 
          title="Danh sách nhãn" 
          subtitle={`${filteredTags.length} nhãn`}
        />
        <AdminCardBody className="p-0">
          {filteredTags.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {searchTerm ? 'Không tìm thấy nhãn nào' : 'Chưa có nhãn nào'}
              </p>
              {!searchTerm && (
                <AdminButton
                  variant="primary"
                  className="mt-4"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    resetForm()
                    setShowAddForm(true)
                  }}
                >
                  Thêm nhãn đầu tiên
                </AdminButton>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTags.map((tag, index) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Badge Preview */}
                      <span 
                        className="px-3 py-1 rounded-full text-white text-sm font-medium whitespace-nowrap"
                        style={{ backgroundColor: tag.badgeColor || '#3B82F6' }}
                      >
                        {tag.displayName}
                      </span>
                      
                      {/* Code */}
                      <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {tag.code}
                      </span>
                      
                      {/* Display Order */}
                      <span className="text-xs text-gray-400">
                        Thứ tự: {tag.displayOrder || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AdminCardBody>
      </AdminCard>

      {/* Common Tags Info */}
      <AdminCard>
        <AdminCardHeader title="Nhãn phổ biến" subtitle="Gợi ý các nhãn thường dùng" />
        <AdminCardBody>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { code: 'NEW', name: 'Mới', color: '#22C55E' },
              { code: 'BESTSELLER', name: 'Bán chạy', color: '#F97316' },
              { code: 'SALE', name: 'Giảm giá', color: '#EF4444' },
              { code: 'PREMIUM', name: 'Cao cấp', color: '#8B5CF6' },
              { code: 'IMPORTED', name: 'Nhập khẩu', color: '#3B82F6' },
              { code: 'AUTHENTIC', name: 'Chính hãng', color: '#14B8A6' },
            ].map((suggestion) => {
              const exists = tags.some(t => t.code === suggestion.code)
              return (
                <div 
                  key={suggestion.code}
                  className={`p-3 rounded-lg border ${exists ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <span 
                    className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                    style={{ backgroundColor: suggestion.color }}
                  >
                    {suggestion.name}
                  </span>
                  <p className="mt-2 text-xs text-gray-500 font-mono">{suggestion.code}</p>
                  {exists && (
                    <p className="mt-1 text-xs text-green-600">✓ Đã tạo</p>
                  )}
                </div>
              )
            })}
          </div>
        </AdminCardBody>
      </AdminCard>
    </div>
  )
}
