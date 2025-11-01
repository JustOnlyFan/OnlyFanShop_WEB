'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import BrandAdminService from '@/services/brandAdminService'
import { BrandManagement } from '@/types'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Power, 
  PowerOff, 
  Search,
  ArrowLeft,
  Check,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminBrandsPage() {
  const [loading, setLoading] = useState(true)
  const [brands, setBrands] = useState<BrandManagement[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState({ name: '', country: '', description: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBrand, setNewBrand] = useState({ name: '', country: '', description: '' })
  
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadBrands()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadBrands = async () => {
    try {
      setLoading(true)
      const data = await BrandAdminService.getAllBrands()
      setBrands(data)
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách thương hiệu')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBrand = async () => {
    if (!newBrand.name.trim() || !newBrand.country.trim() || !newBrand.description.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      await BrandAdminService.createBrand(newBrand)
      toast.success('Thêm thương hiệu thành công!')
      setNewBrand({ name: '', country: '', description: '' })
      setShowAddForm(false)
      loadBrands()
    } catch (error: any) {
      toast.error(error.message || 'Không thể thêm thương hiệu')
    }
  }

  const handleEdit = (brand: BrandManagement) => {
    setEditingId(brand.brandID)
    setEditValues({
      name: brand.name,
      country: brand.country,
      description: brand.description
    })
  }

  const handleSaveEdit = async (brandID: number) => {
    if (!editValues.name.trim() || !editValues.country.trim() || !editValues.description.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      await BrandAdminService.updateBrand(brandID, editValues)
      toast.success('Cập nhật thương hiệu thành công!')
      setEditingId(null)
      setEditValues({ name: '', country: '', description: '' })
      loadBrands()
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật thương hiệu')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues({ name: '', country: '', description: '' })
  }

  const handleToggleActive = async (brandID: number, currentActive: boolean) => {
    try {
      await BrandAdminService.toggleActive(brandID, !currentActive)
      toast.success(`Thương hiệu đã được ${!currentActive ? 'kích hoạt' : 'vô hiệu hóa'}`)
      loadBrands()
    } catch (error: any) {
      toast.error(error.message || 'Không thể thay đổi trạng thái')
    }
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.country.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Thương hiệu</h1>
              <p className="mt-1 text-gray-600">Quản lý tất cả các thương hiệu sản phẩm</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm thương hiệu
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm thương hiệu mới</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="text"
                value={newBrand.name}
                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                placeholder="Tên thương hiệu..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                value={newBrand.country}
                onChange={(e) => setNewBrand({ ...newBrand, country: e.target.value })}
                placeholder="Quốc gia..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                value={newBrand.description}
                onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
                placeholder="Mô tả..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleAddBrand}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Thêm
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewBrand({ name: '', country: '', description: '' })
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
              placeholder="Tìm kiếm thương hiệu hoặc quốc gia..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Brands List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredBrands.map((brand, index) => (
              <motion.div
                key={brand.brandID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingId === brand.brandID ? (
                      <div className="grid md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Tên"
                        />
                        <input
                          type="text"
                          value={editValues.country}
                          onChange={(e) => setEditValues({ ...editValues, country: e.target.value })}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Quốc gia"
                        />
                        <input
                          type="text"
                          value={editValues.description}
                          onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                          className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Mô tả"
                        />
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-4 gap-4 items-center">
                        <div>
                          <p className="font-medium text-gray-900">{brand.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{brand.country}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{brand.description}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {editingId === brand.brandID ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(brand.brandID)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleActive(brand.brandID, brand.active)}
                          className={`p-2 rounded-lg transition-colors ${
                            brand.active
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={brand.active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {brand.active ? (
                            <Power className="w-5 h-5" />
                          ) : (
                            <PowerOff className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(brand)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredBrands.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <p>Không tìm thấy thương hiệu nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
