'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import CategoryService from '@/services/categoryService'
import { CategoryDTO, CategoryType } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff, 
  Search,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Layers
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

// Category type labels in Vietnamese
const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  [CategoryType.FAN_TYPE]: 'Loại quạt',
  [CategoryType.SPACE]: 'Không gian',
  [CategoryType.PURPOSE]: 'Mục đích',
  [CategoryType.TECHNOLOGY]: 'Công nghệ',
  [CategoryType.PRICE_RANGE]: 'Khoảng giá',
  [CategoryType.CUSTOMER_TYPE]: 'Đối tượng',
  [CategoryType.STATUS]: 'Tình trạng',
  [CategoryType.ACCESSORY_TYPE]: 'Loại phụ kiện',
  [CategoryType.ACCESSORY_FUNCTION]: 'Chức năng phụ kiện'
}

// Category type colors for badges
const CATEGORY_TYPE_COLORS: Record<CategoryType, string> = {
  [CategoryType.FAN_TYPE]: 'bg-blue-100 text-blue-700',
  [CategoryType.SPACE]: 'bg-green-100 text-green-700',
  [CategoryType.PURPOSE]: 'bg-purple-100 text-purple-700',
  [CategoryType.TECHNOLOGY]: 'bg-orange-100 text-orange-700',
  [CategoryType.PRICE_RANGE]: 'bg-yellow-100 text-yellow-700',
  [CategoryType.CUSTOMER_TYPE]: 'bg-pink-100 text-pink-700',
  [CategoryType.STATUS]: 'bg-red-100 text-red-700',
  [CategoryType.ACCESSORY_TYPE]: 'bg-indigo-100 text-indigo-700',
  [CategoryType.ACCESSORY_FUNCTION]: 'bg-teal-100 text-teal-700'
}

interface CategoryTreeItemProps {
  category: CategoryDTO
  level: number
  onEdit: (category: CategoryDTO) => void
  onDelete: (id: number) => void
  onToggleActive: (id: number, isActive: boolean) => void
  expandedIds: Set<number>
  toggleExpand: (id: number) => void
}

function CategoryTreeItem({ 
  category, 
  level, 
  onEdit, 
  onDelete, 
  onToggleActive,
  expandedIds,
  toggleExpand
}: CategoryTreeItemProps) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedIds.has(category.id)
  
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-3 hover:bg-blue-50/50 transition-colors border-b border-gray-100 ${
          level > 0 ? 'ml-6 border-l-2 border-l-gray-200' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Expand/Collapse button */}
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            <div className="p-2 bg-blue-50 rounded-lg">
              <FolderTree className="w-4 h-4 text-blue-600" />
            </div>
            
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{category.name}</span>
              {category.slug && (
                <span className="text-xs text-gray-500">/{category.slug}</span>
              )}
            </div>
            
            <AdminBadge 
              variant={category.isActive ? 'success' : 'danger'} 
              size="sm"
              dot
            >
              {category.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </AdminBadge>
            
            {level > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                Cấp {level + 1}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleActive(category.id, category.isActive || false)}
              className={`p-2 rounded-lg transition-colors ${
                category.isActive
                  ? 'text-green-600 bg-green-50 hover:bg-green-100'
                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
              }`}
              title={category.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
            >
              {category.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              title="Chỉnh sửa"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
      
      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {category.children!.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                level={level + 1}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true)
  const [categoryTree, setCategoryTree] = useState<CategoryDTO[]>([])
  const [selectedType, setSelectedType] = useState<CategoryType>(CategoryType.FAN_TYPE)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    parentId: null as number | null,
    categoryType: CategoryType.FAN_TYPE,
    isActive: true
  })
  
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadCategoryTree()
  }, [hasHydrated, isAuthenticated, user, router, selectedType])

  const loadCategoryTree = async () => {
    try {
      setLoading(true)
      const data = await CategoryService.getCategoryTree(selectedType)
      setCategoryTree(data)
      // Expand all by default
      const allIds = new Set<number>()
      const collectIds = (categories: CategoryDTO[]) => {
        categories.forEach(cat => {
          allIds.add(cat.id)
          if (cat.children) collectIds(cat.children)
        })
      }
      collectIds(data)
      setExpandedIds(allIds)
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách danh mục')
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      displayOrder: 0,
      parentId: null,
      categoryType: selectedType,
      isActive: true
    })
    setEditingCategory(null)
    setShowAddForm(false)
  }

  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục')
      return
    }

    try {
      await CategoryService.createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        displayOrder: formData.displayOrder,
        parentId: formData.parentId,
        categoryType: formData.categoryType,
        isActive: formData.isActive
      })
      toast.success('Thêm danh mục thành công!')
      resetForm()
      loadCategoryTree()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Không thể thêm danh mục')
    }
  }

  const handleEdit = (category: CategoryDTO) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder || 0,
      parentId: category.parentId || null,
      categoryType: category.categoryType || selectedType,
      isActive: category.isActive ?? true
    })
    setShowAddForm(true)
  }

  const handleSaveEdit = async () => {
    if (!editingCategory) return
    if (!formData.name.trim()) {
      toast.error('Tên danh mục không được để trống')
      return
    }

    try {
      await CategoryService.updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        displayOrder: formData.displayOrder,
        parentId: formData.parentId,
        categoryType: formData.categoryType,
        isActive: formData.isActive
      })
      toast.success('Cập nhật danh mục thành công!')
      resetForm()
      loadCategoryTree()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Không thể cập nhật danh mục')
    }
  }

  const handleDelete = async (categoryID: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Danh mục có danh mục con sẽ không thể xóa.')) {
      return
    }

    try {
      await CategoryService.deleteCategory(categoryID)
      toast.success('Xóa danh mục thành công!')
      loadCategoryTree()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Không thể xóa danh mục')
    }
  }

  const handleToggleActive = async (categoryID: number, currentActive: boolean) => {
    try {
      await CategoryService.toggleActive(categoryID, !currentActive)
      toast.success(`Danh mục đã được ${!currentActive ? 'kích hoạt' : 'vô hiệu hóa'}`)
      loadCategoryTree()
    } catch (error: any) {
      toast.error(error.message || 'Không thể thay đổi trạng thái')
    }
  }

  // Filter categories by search term
  const filterCategories = (categories: CategoryDTO[], term: string): CategoryDTO[] => {
    if (!term.trim()) return categories
    
    const lowerTerm = term.toLowerCase()
    return categories.reduce<CategoryDTO[]>((acc, cat) => {
      const matchesName = cat.name.toLowerCase().includes(lowerTerm)
      const matchesSlug = cat.slug?.toLowerCase().includes(lowerTerm)
      const filteredChildren = cat.children ? filterCategories(cat.children, term) : []
      
      if (matchesName || matchesSlug || filteredChildren.length > 0) {
        acc.push({
          ...cat,
          children: filteredChildren.length > 0 ? filteredChildren : cat.children
        })
      }
      return acc
    }, [])
  }

  const filteredCategories = filterCategories(categoryTree, searchTerm)

  // Count categories
  const countCategories = (categories: CategoryDTO[]): number => {
    return categories.reduce((count, cat) => {
      return count + 1 + (cat.children ? countCategories(cat.children) : 0)
    }, 0)
  }

  const totalCount = countCategories(categoryTree)
  const activeCount = countCategories(categoryTree.filter(c => c.isActive))

  // Get flat list of categories for parent selection
  const getFlatCategories = (categories: CategoryDTO[], level = 0): { category: CategoryDTO; level: number }[] => {
    return categories.reduce<{ category: CategoryDTO; level: number }[]>((acc, cat) => {
      // Only allow up to 2 levels deep (max 3 levels total)
      if (level < 2) {
        acc.push({ category: cat, level })
        if (cat.children) {
          acc.push(...getFlatCategories(cat.children, level + 1))
        }
      }
      return acc
    }, [])
  }

  const flatCategories = getFlatCategories(categoryTree)

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Type Selector */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
        </div>
        <AdminButton
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => {
            resetForm()
            setFormData(prev => ({ ...prev, categoryType: selectedType }))
            setShowAddForm(true)
          }}
        >
          Thêm danh mục
        </AdminButton>
      </div>

      {/* Category Type Selector */}
      <AdminCard>
        <AdminCardHeader title="Chọn loại danh mục" />
        <AdminCardBody>
          <div className="flex flex-wrap gap-2">
            {Object.values(CategoryType).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : `${CATEGORY_TYPE_COLORS[type]} hover:opacity-80`
                }`}
              >
                {CATEGORY_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </AdminCardBody>
      </AdminCard>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminCard>
          <AdminCardBody className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FolderTree className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng danh mục</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
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
            <div className={`p-3 rounded-xl ${CATEGORY_TYPE_COLORS[selectedType]}`}>
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Loại đang xem</p>
              <p className="text-lg font-bold text-gray-900">{CATEGORY_TYPE_LABELS[selectedType]}</p>
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
                title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'} 
              />
              <AdminCardBody>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên danh mục *
                    </label>
                    <AdminInput
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nhập tên danh mục..."
                    />
                  </div>

                  {/* Category Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại danh mục *
                    </label>
                    <select
                      value={formData.categoryType}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        categoryType: e.target.value as CategoryType,
                        parentId: null // Reset parent when type changes
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!!editingCategory} // Can't change type when editing
                    >
                      {Object.values(CategoryType).map((type) => (
                        <option key={type} value={type}>
                          {CATEGORY_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Parent Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục cha (tùy chọn)
                    </label>
                    <select
                      value={formData.parentId || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        parentId: e.target.value ? parseInt(e.target.value) : null 
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Không có (danh mục gốc) --</option>
                      {flatCategories
                        .filter(({ category }) => 
                          category.categoryType === formData.categoryType &&
                          category.id !== editingCategory?.id
                        )
                        .map(({ category, level }) => (
                          <option key={category.id} value={category.id}>
                            {'—'.repeat(level)} {category.name}
                          </option>
                        ))
                      }
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Tối đa 3 cấp danh mục</p>
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

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Nhập mô tả danh mục..."
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      Kích hoạt danh mục
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <AdminButton 
                    variant="primary" 
                    onClick={editingCategory ? handleSaveEdit : handleAddCategory}
                  >
                    {editingCategory ? 'Cập nhật' : 'Thêm'}
                  </AdminButton>
                  <AdminButton 
                    variant="secondary" 
                    onClick={resetForm}
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
            placeholder="Tìm kiếm danh mục..."
            icon={<Search className="w-5 h-5" />}
          />
        </AdminCardBody>
      </AdminCard>

      {/* Categories Tree */}
      <AdminCard>
        <AdminCardHeader 
          title={`Cây danh mục - ${CATEGORY_TYPE_LABELS[selectedType]}`}
          subtitle={`${countCategories(filteredCategories)} danh mục`}
        />
        <AdminCardBody className="p-0">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center">
              <FolderTree className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {searchTerm ? 'Không tìm thấy danh mục nào' : 'Chưa có danh mục nào trong loại này'}
              </p>
              {!searchTerm && (
                <AdminButton
                  variant="primary"
                  className="mt-4"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => {
                    resetForm()
                    setFormData(prev => ({ ...prev, categoryType: selectedType }))
                    setShowAddForm(true)
                  }}
                >
                  Thêm danh mục đầu tiên
                </AdminButton>
              )}
            </div>
          ) : (
            <div>
              {filteredCategories.map((category) => (
                <CategoryTreeItem
                  key={category.id}
                  category={category}
                  level={0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                />
              ))}
            </div>
          )}
        </AdminCardBody>
      </AdminCard>
    </div>
  )
}
