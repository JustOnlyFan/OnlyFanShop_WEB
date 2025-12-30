'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, Check, FolderTree } from 'lucide-react'
import CategoryService from '@/services/categoryService'
import { CategoryDTO, CategoryType } from '@/types'

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

// Category type colors
const CATEGORY_TYPE_COLORS: Record<CategoryType, string> = {
  [CategoryType.FAN_TYPE]: 'border-blue-200 bg-blue-50/50',
  [CategoryType.SPACE]: 'border-green-200 bg-green-50/50',
  [CategoryType.PURPOSE]: 'border-purple-200 bg-purple-50/50',
  [CategoryType.TECHNOLOGY]: 'border-orange-200 bg-orange-50/50',
  [CategoryType.PRICE_RANGE]: 'border-yellow-200 bg-yellow-50/50',
  [CategoryType.CUSTOMER_TYPE]: 'border-pink-200 bg-pink-50/50',
  [CategoryType.STATUS]: 'border-red-200 bg-red-50/50',
  [CategoryType.ACCESSORY_TYPE]: 'border-indigo-200 bg-indigo-50/50',
  [CategoryType.ACCESSORY_FUNCTION]: 'border-teal-200 bg-teal-50/50'
}

interface CategoryTreeItemProps {
  category: CategoryDTO
  level: number
  selectedIds: number[]
  onToggle: (id: number) => void
  expandedIds: Set<number>
  onToggleExpand: (id: number) => void
}

function CategoryTreeItem({ 
  category, 
  level, 
  selectedIds, 
  onToggle, 
  expandedIds,
  onToggleExpand 
}: CategoryTreeItemProps) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedIds.has(category.id)
  const isSelected = selectedIds.includes(category.id)
  
  return (
    <div>
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors ${
          isSelected ? 'bg-green-100' : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(category.id)
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}
        
        {/* Checkbox */}
        <label className="flex items-center gap-2 flex-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggle(category.id)}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className={`text-sm ${isSelected ? 'font-medium text-green-700' : 'text-gray-700'}`}>
            {category.name}
          </span>
          {level > 0 && (
            <span className="text-xs text-gray-400">Cấp {level + 1}</span>
          )}
        </label>
      </div>
      
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
                selectedIds={selectedIds}
                onToggle={onToggle}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Category types to hide (for fan shop, we don't need accessory categories)
const HIDDEN_CATEGORY_TYPES: CategoryType[] = [
  CategoryType.ACCESSORY_TYPE,
  CategoryType.ACCESSORY_FUNCTION
]

interface CategoryTreeSelectorProps {
  selectedIds: number[]
  onChange: (ids: number[]) => void
  requiredTypes?: CategoryType[]
  hiddenTypes?: CategoryType[]
}

export function CategoryTreeSelector({ 
  selectedIds, 
  onChange,
  requiredTypes = [CategoryType.FAN_TYPE],
  hiddenTypes = HIDDEN_CATEGORY_TYPES
}: CategoryTreeSelectorProps) {
  const [categoryTrees, setCategoryTrees] = useState<Record<CategoryType, CategoryDTO[]>>({} as Record<CategoryType, CategoryDTO[]>)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<CategoryType>(CategoryType.FAN_TYPE)

  useEffect(() => {
    loadCategoryTrees()
  }, [])

  // Auto-expand parent categories when selectedIds change
  useEffect(() => {
    if (selectedIds.length > 0 && Object.keys(categoryTrees).length > 0) {
      // Find all parent categories of selected items and expand them
      const findAndExpandParents = (cats: CategoryDTO[], parentIds: number[] = []): number[] => {
        let idsToExpand: number[] = []
        cats.forEach(cat => {
          if (selectedIds.includes(cat.id)) {
            // Expand all parents
            idsToExpand = [...idsToExpand, ...parentIds, cat.id]
          }
          if (cat.children && cat.children.length > 0) {
            idsToExpand = [...idsToExpand, ...findAndExpandParents(cat.children, [...parentIds, cat.id])]
          }
        })
        return idsToExpand
      }
      
      const idsToExpand: number[] = []
      Object.values(categoryTrees).forEach(tree => {
        idsToExpand.push(...findAndExpandParents(tree))
      })
      
      if (idsToExpand.length > 0) {
        setExpandedIds(prev => {
          const newSet = new Set(prev)
          idsToExpand.forEach(id => newSet.add(id))
          return newSet
        })
      }
      
      // Switch to tab that has selected items
      const selectedCategories = getSelectedCategoriesFromTrees(categoryTrees, selectedIds)
      if (selectedCategories.length > 0) {
        const firstSelectedType = selectedCategories[0].type
        if (firstSelectedType) {
          setActiveTab(firstSelectedType)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds, categoryTrees])

  // Helper function to get selected categories from trees
  const getSelectedCategoriesFromTrees = (trees: Record<CategoryType, CategoryDTO[]>, ids: number[]): { id: number; name: string; type: CategoryType }[] => {
    const result: { id: number; name: string; type: CategoryType }[] = []
    
    const findCategory = (cats: CategoryDTO[], type: CategoryType) => {
      cats.forEach(cat => {
        if (ids.includes(cat.id)) {
          result.push({ id: cat.id, name: cat.name, type })
        }
        if (cat.children) {
          findCategory(cat.children, type)
        }
      })
    }
    
    Object.entries(trees).forEach(([type, tree]) => {
      findCategory(tree, type as CategoryType)
    })
    
    return result
  }

  const loadCategoryTrees = async () => {
    try {
      setLoading(true)
      const categoryTypes = Object.values(CategoryType)
      const treesMap: Record<CategoryType, CategoryDTO[]> = {} as Record<CategoryType, CategoryDTO[]>
      
      await Promise.all(
        categoryTypes.map(async (type) => {
          try {
            const tree = await CategoryService.getCategoryTree(type)
            treesMap[type] = tree
          } catch {
            treesMap[type] = []
          }
        })
      )
      
      setCategoryTrees(treesMap)
      
      // Auto expand first level
      const allFirstLevelIds = new Set<number>()
      Object.values(treesMap).forEach(tree => {
        tree.forEach(cat => allFirstLevelIds.add(cat.id))
      })
      setExpandedIds(allFirstLevelIds)
    } catch (error) {
      console.error('Failed to load category trees:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: number) => {
    if (selectedIds.includes(categoryId)) {
      onChange(selectedIds.filter(id => id !== categoryId))
    } else {
      onChange([...selectedIds, categoryId])
    }
  }

  const toggleExpand = (categoryId: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Get all selected categories with their names
  const getSelectedCategories = (): { id: number; name: string; type: CategoryType }[] => {
    return getSelectedCategoriesFromTrees(categoryTrees, selectedIds)
  }

  // Check if has required category type
  const hasRequiredType = () => {
    const selected = getSelectedCategories()
    return selected.some(cat => requiredTypes.includes(cat.type))
  }

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2" />
        Đang tải danh mục...
      </div>
    )
  }

  const selectedCategories = getSelectedCategories()
  // Filter out hidden types and empty trees
  const availableTypes = Object.entries(categoryTrees)
    .filter(([type, tree]) => tree.length > 0 && !hiddenTypes.includes(type as CategoryType))

  return (
    <div className="space-y-4">
      {/* Tabs for category types */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {availableTypes.map(([type]) => {
          const categoryType = type as CategoryType
          const isRequired = requiredTypes.includes(categoryType)
          const hasSelected = selectedCategories.some(c => c.type === categoryType)
          
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveTab(categoryType)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === categoryType
                  ? 'bg-green-600 text-white'
                  : hasSelected
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : isRequired
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_TYPE_LABELS[categoryType]}
              {isRequired && !hasSelected && <span className="text-red-500 ml-1">*</span>}
              {hasSelected && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/30 rounded text-xs">
                  {selectedCategories.filter(c => c.type === categoryType).length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Validation message */}
      {!hasRequiredType() && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            ⚠️ Vui lòng chọn ít nhất một danh mục từ <strong>Loại quạt</strong>
          </p>
        </div>
      )}

      {/* Category tree for active tab */}
      <div className={`border rounded-lg p-3 max-h-64 overflow-y-auto ${CATEGORY_TYPE_COLORS[activeTab]}`}>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
          <FolderTree className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">{CATEGORY_TYPE_LABELS[activeTab]}</span>
          {requiredTypes.includes(activeTab) && (
            <span className="text-xs text-red-500">(Bắt buộc)</span>
          )}
        </div>
        
        {categoryTrees[activeTab]?.length > 0 ? (
          <div className="space-y-0.5">
            {categoryTrees[activeTab].map((category) => (
              <CategoryTreeItem
                key={category.id}
                category={category}
                level={0}
                selectedIds={selectedIds}
                onToggle={toggleCategory}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            Chưa có danh mục nào trong loại này
          </p>
        )}
      </div>

      {/* Selected categories summary */}
      {selectedCategories.length > 0 && (
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-700 mb-2">
            Đã chọn {selectedCategories.length} danh mục:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <span 
                key={cat.id} 
                className="inline-flex items-center gap-1 px-2 py-1 bg-white text-green-700 rounded text-xs border border-green-200"
              >
                <span className="text-gray-400">[{CATEGORY_TYPE_LABELS[cat.type].slice(0, 2)}]</span>
                {cat.name}
                <button 
                  type="button" 
                  onClick={() => toggleCategory(cat.id)} 
                  className="hover:text-red-500 ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryTreeSelector
