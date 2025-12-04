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
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Award
} from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { 
  AdminButton, 
  AdminCard, 
  AdminCardHeader, 
  AdminCardBody,
  AdminInput,
  AdminBadge
} from '@/components/admin/ui'

export default function AdminBrandsPage() {
  const [loading, setLoading] = useState(true)
  const [brands, setBrands] = useState<BrandManagement[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState({ name: '', country: '', description: '', imageURL: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBrand, setNewBrand] = useState({ name: '', country: '', description: '', imageURL: '' })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')
  const [editingImage, setEditingImage] = useState<File | null>(null)
  const [editingImageUrl, setEditingImageUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (editingId !== null) {
      setEditingImage(file)
      setEditingImageUrl(URL.createObjectURL(file))
    } else {
      setSelectedImage(file)
      setSelectedImageUrl(URL.createObjectURL(file))
    }
  }

  const handleAddBrand = async () => {
    if (!newBrand.name.trim() || !newBrand.description.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }
    try {
      setUploading(true)
      let imageURL = newBrand.imageURL || undefined
      if (selectedImage) {
        imageURL = await BrandAdminService.uploadImage(selectedImage)
      }
      await BrandAdminService.createBrand({ ...newBrand, imageURL })
      toast.success('Thêm thương hiệu thành công!')
      setNewBrand({ name: '', country: '', description: '', imageURL: '' })
      setSelectedImage(null)
      setSelectedImageUrl('')
      setShowAddForm(false)
      loadBrands()
    } catch (error: any) {
      toast.error(error.message || 'Không thể thêm thương hiệu')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (brand: BrandManagement) => {
    setEditingId(brand.brandID)
    setEditValues({ name: brand.name, country: brand.country, description: brand.description, imageURL: brand.imageURL || '' })
    setEditingImageUrl(brand.imageURL || '')
    setEditingImage(null)
  }

  const handleSaveEdit = async (brandID: number) => {
    if (!editValues.name.trim() || !editValues.description.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }
    try {
      setUploading(true)
      let imageURL = editValues.imageURL || undefined
      if (editingImage) {
        imageURL = await BrandAdminService.uploadImage(editingImage)
      }
      await BrandAdminService.updateBrand(brandID, { ...editValues, imageURL })
      toast.success('Cập nhật thương hiệu thành công!')
      setEditingId(null)
      setEditValues({ name: '', country: '', description: '', imageURL: '' })
      setEditingImage(null)
      setEditingImageUrl('')
      loadBrands()
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật thương hiệu')
    } finally {
      setUploading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues({ name: '', country: '', description: '', imageURL: '' })
    setEditingImage(null)
    setEditingImageUrl('')
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

  const activeCount = brands.filter(b => b.active).length

  if (!hasHydrated || loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <AdminButton variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => setShowAddForm(!showAddForm)}>
          Thêm thương hiệu
        </AdminButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminCard><AdminCardBody className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl"><Award className="w-6 h-6 text-purple-600" /></div>
          <div><p className="text-sm text-gray-500">Tổng</p><p className="text-2xl font-bold">{brands.length}</p></div>
        </AdminCardBody></AdminCard>
        <AdminCard><AdminCardBody className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl"><Power className="w-6 h-6 text-green-600" /></div>
          <div><p className="text-sm text-gray-500">Hoạt động</p><p className="text-2xl font-bold text-green-600">{activeCount}</p></div>
        </AdminCardBody></AdminCard>
        <AdminCard><AdminCardBody className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-xl"><PowerOff className="w-6 h-6 text-red-600" /></div>
          <div><p className="text-sm text-gray-500">Tạm dừng</p><p className="text-2xl font-bold text-red-600">{brands.length - activeCount}</p></div>
        </AdminCardBody></AdminCard>
      </div>

      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <AdminCard>
            <AdminCardHeader title="Thêm thương hiệu mới" />
            <AdminCardBody>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <AdminInput value={newBrand.name} onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })} placeholder="Tên *" label="Tên" />
                <AdminInput value={newBrand.country} onChange={(e) => setNewBrand({ ...newBrand, country: e.target.value })} placeholder="Quốc gia" label="Quốc gia" />
                <AdminInput value={newBrand.description} onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })} placeholder="Mô tả *" label="Mô tả" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  {selectedImageUrl && <div className="relative w-20 h-20 border rounded-xl overflow-hidden bg-gray-50"><Image src={selectedImageUrl} alt="Preview" fill className="object-contain p-2" /></div>}
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 cursor-pointer font-medium">
                    <Upload className="w-4 h-4" />Chọn ảnh<input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <AdminButton variant="primary" onClick={handleAddBrand} loading={uploading}>Thêm</AdminButton>
                <AdminButton variant="secondary" onClick={() => { setShowAddForm(false); setNewBrand({ name: '', country: '', description: '', imageURL: '' }); setSelectedImage(null); setSelectedImageUrl('') }}>Hủy</AdminButton>
              </div>
            </AdminCardBody>
          </AdminCard>
        </motion.div>
      )}

      <AdminCard><AdminCardBody><AdminInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm..." icon={<Search className="w-5 h-5" />} /></AdminCardBody></AdminCard>

      <AdminCard>
        <AdminCardHeader title="Danh sách thương hiệu" subtitle={`${filteredBrands.length} thương hiệu`} />
        <AdminCardBody className="p-0">
          {filteredBrands.length === 0 ? (
            <div className="p-12 text-center"><Award className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">Không tìm thấy</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredBrands.map((brand, index) => (
                <motion.div key={brand.brandID} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="p-4 hover:bg-purple-50/50 transition-colors">
                  {editingId === brand.brandID ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-3">
                        <input type="text" value={editValues.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Tên" />
                        <input type="text" value={editValues.country} onChange={(e) => setEditValues({ ...editValues, country: e.target.value })} className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Quốc gia" />
                        <input type="text" value={editValues.description} onChange={(e) => setEditValues({ ...editValues, description: e.target.value })} className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Mô tả" />
                      </div>
                      <div className="flex items-center gap-4">
                        {editingImageUrl && <div className="relative w-16 h-16 border rounded-xl overflow-hidden bg-gray-50"><Image src={editingImageUrl} alt="Preview" fill className="object-contain p-1" /></div>}
                        <label className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer text-sm font-medium">
                          <Upload className="w-4 h-4" />{editingImageUrl ? 'Đổi ảnh' : 'Chọn ảnh'}<input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                        </label>
                        <button onClick={() => handleSaveEdit(brand.brandID)} disabled={uploading} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg disabled:opacity-50"><Check className="w-5 h-5" /></button>
                        <button onClick={handleCancelEdit} disabled={uploading} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50"><X className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {brand.imageURL ? (
                          <div className="relative w-14 h-14 border rounded-xl overflow-hidden bg-gray-50 flex-shrink-0"><Image src={brand.imageURL} alt={brand.name} fill className="object-contain p-1" /></div>
                        ) : (
                          <div className="w-14 h-14 border rounded-xl flex items-center justify-center bg-gray-50 flex-shrink-0"><ImageIcon className="w-6 h-6 text-gray-400" /></div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                            <AdminBadge variant={brand.active ? 'success' : 'danger'} size="sm" dot>{brand.active ? 'Hoạt động' : 'Tạm dừng'}</AdminBadge>
                          </div>
                          <p className="text-sm text-gray-500">{brand.country || 'Chưa có quốc gia'}</p>
                          <p className="text-sm text-gray-400 line-clamp-1">{brand.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleToggleActive(brand.brandID, brand.active)} className={`p-2 rounded-lg transition-colors ${brand.active ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}>
                          {brand.active ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                        </button>
                        <button onClick={() => handleEdit(brand)} className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg"><Edit2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AdminCardBody>
      </AdminCard>
    </div>
  )
}
