'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Layers, ChevronRight } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'
import toast from 'react-hot-toast'

interface AccessoryType {
  id: number
  name: string
  slug: string
  description: string
  productCount: number
  parentId: number | null
  parentName?: string
  icon?: string
}

export default function AccessoryTypesPage() {
  const [types, setTypes] = useState<AccessoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingType, setEditingType] = useState<AccessoryType | null>(null)
  const { language } = useLanguageStore()

  useEffect(() => {
    fetchTypes()
  }, [])

  const fetchTypes = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await CategoryService.getByType('ACCESSORY_TYPE')
      // setTypes(response)
      setTypes([])
    } catch (error) {
      toast.error('Không thể tải danh sách loại phụ kiện')
    } finally {
      setLoading(false)
    }
  }

  const filteredTypes = types.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const parentTypes = types.filter(t => t.parentId === null)
  const getChildTypes = (parentId: number) => types.filter(t => t.parentId === parentId)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'vi' ? 'Loại Phụ kiện' : 'Accessory Types'}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === 'vi' ? 'Quản lý danh mục phụ kiện: cánh quạt, lồng quạt, motor...' : 'Manage accessory categories'}
          </p>
        </div>
        <button 
          onClick={() => { setEditingType(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {language === 'vi' ? 'Thêm loại' : 'Add Type'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={language === 'vi' ? 'Tìm kiếm loại phụ kiện...' : 'Search types...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            {language === 'vi' ? 'Đang tải...' : 'Loading...'}
          </div>
        ) : parentTypes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{language === 'vi' ? 'Chưa có loại phụ kiện nào' : 'No accessory types found'}</p>
          </div>
        ) : (
          parentTypes.map((type) => {
            const children = getChildTypes(type.id)
            return (
              <div key={type.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{type.name}</h3>
                        <p className="text-sm text-gray-500">{type.productCount} sản phẩm</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => { setEditingType(type); setShowModal(true) }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{type.description}</p>
                </div>
                
                {children.length > 0 && (
                  <div className="p-3 bg-gray-50">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      {language === 'vi' ? 'Danh mục con:' : 'Subcategories:'}
                    </p>
                    <div className="space-y-1">
                      {children.map((child) => (
                        <div key={child.id} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{child.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{child.productCount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingType 
                  ? (language === 'vi' ? 'Sửa loại phụ kiện' : 'Edit Type')
                  : (language === 'vi' ? 'Thêm loại phụ kiện' : 'Add Type')
                }
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'vi' ? 'Tên loại' : 'Type Name'}
                </label>
                <input
                  type="text"
                  defaultValue={editingType?.name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="VD: Cánh quạt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'vi' ? 'Danh mục cha' : 'Parent Category'}
                </label>
                <select 
                  defaultValue={editingType?.parentId || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{language === 'vi' ? '-- Không có --' : '-- None --'}</option>
                  {parentTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'vi' ? 'Mô tả' : 'Description'}
                </label>
                <textarea
                  defaultValue={editingType?.description}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={language === 'vi' ? 'Mô tả loại phụ kiện...' : 'Description...'}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                {language === 'vi' ? 'Lưu' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
