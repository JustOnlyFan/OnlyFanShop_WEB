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
  ArrowLeft,
  Check,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

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
      console.error('Add category error:', error)
      // Hiển thị thông báo lỗi chi tiết từ backend
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
      console.error('Update category error:', error)
      // Hiển thị thông báo lỗi chi tiết từ backend
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

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
              <p className="mt-1 text-gray-600">Quản lý tất cả các danh mục sản phẩm</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm danh mục
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm danh mục mới</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCategory}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewCategoryName('')
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
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.categoryID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {editingId === category.categoryID ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSaveEdit(category.categoryID)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900">{category.categoryName}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(category.categoryID, category.active)}
                      className={`p-2 rounded-lg transition-colors ${
                        category.active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={category.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    >
                      {category.active ? (
                        <Power className="w-5 h-5" />
                      ) : (
                        <PowerOff className="w-5 h-5" />
                      )}
                    </button>

                    {editingId !== category.categoryID && (
                      <>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.categoryID)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <p>Không tìm thấy danh mục nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
