'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import CategoryAdminService from '@/services/categoryAdminService'
import { CategoryManagement } from '@/types'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff, 
  Search,
  Check,
  X,
  FolderTree
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

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<CategoryManagement[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadCategories()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await CategoryAdminService.getAllCategories()
      setCategories(data)
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách danh mục')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    try {
      await CategoryAdminService.createCategory({
        categoryName: newCategoryName.trim(),
        active: true
      })
      toast.success('Thêm danh mục thành công!')
      setNewCategoryName('')
      setShowAddForm(false)
      loadCategories()
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể thêm danh mục'
      toast.error(errorMessage)
    }
  }

  const handleEdit = (category: CategoryManagement) => {
    setEditingId(category.categoryID)
    setEditValue(category.categoryName)
  }

  const handleSaveEdit = async (categoryID: number) => {
    if (!editValue.trim()) {
      toast.error('Tên danh mục không được để trống')
      return
    }

    try {
      await CategoryAdminService.updateCategory(categoryID, {
        categoryName: editValue.trim()
      })
      toast.success('Cập nhật danh mục thành công!')
      setEditingId(null)
      setEditValue('')
      loadCategories()
    } catch (error: any) {
      const errorMessage = error.message || 'Không thể cập nhật danh mục'
      toast.error(errorMessage)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const handleDelete = async (categoryID: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return
    }

    try {
      await CategoryAdminService.deleteCategory(categoryID)
      toast.success('Xóa danh mục thành công!')
      loadCategories()
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa danh mục')
    }
  }

  const handleToggleActive = async (categoryID: number, currentActive: boolean) => {
    try {
      await CategoryAdminService.toggleActive(categoryID, !currentActive)
      toast.success(`Danh mục đã được ${!currentActive ? 'kích hoạt' : 'vô hiệu hóa'}`)
      loadCategories()
    } catch (error: any) {
      toast.error(error.message || 'Không thể thay đổi trạng thái')
    }
  }

  const filteredCategories = categories.filter(cat =>
    cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCount = categories.filter(c => c.active).length
  const inactiveCount = categories.length - activeCount

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <AdminButton
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Thêm danh mục
        </AdminButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminCard>
          <AdminCardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FolderTree className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng danh mục</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </AdminCardBody>
        </AdminCard>
        <AdminCard>
          <AdminCardBody className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Power className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
          </AdminCardBody>
        </AdminCard>
        <AdminCard>
          <AdminCardBody className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <PowerOff className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tạm dừng</p>
              <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
            </div>
          </AdminCardBody>
        </AdminCard>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AdminCard>
            <AdminCardHeader title="Thêm danh mục mới" />
            <AdminCardBody>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <AdminInput
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nhập tên danh mục..."
                  />
                </div>
                <div className="flex gap-2">
                  <AdminButton variant="primary" onClick={handleAddCategory}>
                    Thêm
                  </AdminButton>
                  <AdminButton 
                    variant="secondary" 
                    onClick={() => {
                      setShowAddForm(false)
                      setNewCategoryName('')
                    }}
                  >
                    Hủy
                  </AdminButton>
                </div>
              </div>
            </AdminCardBody>
          </AdminCard>
        </motion.div>
      )}

      {/* Search */}
      <AdminCard>
        <AdminCardBody>
          <AdminInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm danh mục..."
            icon={<Search className="w-5 h-5" />}
          />
        </AdminCardBody>
      </AdminCard>

      {/* Categories List */}
      <AdminCard>
        <AdminCardHeader 
          title="Danh sách danh mục" 
          subtitle={`${filteredCategories.length} danh mục`}
        />
        <AdminCardBody className="p-0">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center">
              <FolderTree className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Không tìm thấy danh mục nào</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.categoryID}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {editingId === category.categoryID ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(category.categoryID)}
                            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FolderTree className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">{category.categoryName}</span>
                          <AdminBadge 
                            variant={category.active ? 'success' : 'danger'} 
                            size="sm"
                            dot
                          >
                            {category.active ? 'Hoạt động' : 'Tạm dừng'}
                          </AdminBadge>
                        </>
                      )}
                    </div>

                    {editingId !== category.categoryID && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleActive(category.categoryID, category.active)}
                          className={`p-2 rounded-lg transition-colors ${
                            category.active
                              ? 'text-green-600 bg-green-50 hover:bg-green-100'
                              : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                          }`}
                          title={category.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {category.active ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.categoryID)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
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
