'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, MapPin, Upload as UploadIcon, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoreLocationService, CreateStoreLocationRequest, UpdateStoreLocationRequest, StoreStatus } from '@/services/storeLocationService'
import AddressPickerModal from './AddressPickerModal'

interface StoreManagementModalProps {
  store: (Partial<CreateStoreLocationRequest> & { id?: number; isActive?: boolean; status?: StoreStatus }) | null
  onClose: () => void
  onSaved?: () => void
}

export default function StoreManagementModal({ store, onClose, onSaved }: StoreManagementModalProps) {
  const [loading, setLoading] = useState(false)
  const isEditMode = !!store && typeof (store as any).id === 'number'

  const [formData, setFormData] = useState<CreateStoreLocationRequest>({
    name: '', address: '', city: '', district: '', ward: '',
    latitude: 0, longitude: 0, phoneNumber: '', email: '',
    openingHours: '', description: '', images: [], services: [], status: 'ACTIVE'
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)

  useEffect(() => {
    if (store) {
      setFormData(prev => ({
        ...prev,
        name: (store.name as string) || '',
        address: (store.address as string) || '',
        city: (store.city as string) || '',
        district: (store.district as string) || '',
        ward: (store.ward as string) || '',
        latitude: (store.latitude as number) ?? 0,
        longitude: (store.longitude as number) ?? 0,
        phoneNumber: (store.phoneNumber as string) || '',
        email: (store.email as string) || '',
        openingHours: (store.openingHours as string) || '',
        description: (store.description as string) || '',
        images: (store.images as string[]) || [],
        services: (store.services as string[]) || [],
        status: (store.status as StoreStatus) || 'ACTIVE'
      }))
    }
  }, [store])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = StoreLocationService.validateStoreLocationData(formData)
    if (!validation.isValid) {
      toast.error(validation.errors[0] || 'Vui lòng kiểm tra lại thông tin')
      return
    }

    setLoading(true)
    try {
      if (isEditMode && store && typeof (store as any).id === 'number') {
        await StoreLocationService.updateStoreLocation((store as any).id, { ...formData, status: formData.status || 'ACTIVE' })
        toast.success('Cập nhật cửa hàng thành công!')
      } else {
        await StoreLocationService.createStoreLocation({ ...formData, status: formData.status || 'ACTIVE' })
        toast.success('Thêm cửa hàng thành công!')
      }
      onSaved?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message || `Không thể ${isEditMode ? 'cập nhật' : 'thêm'} cửa hàng`)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Vui lòng chọn file ảnh hợp lệ'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('Kích thước file không được vượt quá 10MB'); return }
    
    setUploadingImage(true)
    try {
      const res = await StoreLocationService.uploadStoreImage(file)
      const responseData = res?.data as any
      const url = typeof responseData === 'string' ? responseData 
        : responseData?.data || responseData?.url || responseData
      
      if (url) {
        setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }))
        toast.success('Tải ảnh thành công')
      } else {
        toast.error('Không nhận được URL ảnh từ server')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể tải ảnh')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleRemoveImage = (idx: number) => {
    setFormData(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }))
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên cửa hàng *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái hoạt động *</label>
                <select value={formData.status || 'ACTIVE'} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as StoreStatus }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="PAUSED">Tạm dừng sửa chữa</option>
                  <option value="CLOSED">Đã đóng cửa</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Trạng thái này sẽ tự động đồng bộ trạng thái tài khoản nhân viên của cửa hàng.</p>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                  <button type="button" onClick={() => setAddressModalOpen(true)} className="px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm shadow-sm transition-colors border bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
                    <MapPin className="w-4 h-4" /> Địa chỉ
                  </button>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate">{[formData.address, formData.ward, formData.city].filter(Boolean).join(', ') || 'Chưa chọn'}</span>
                    {Number.isFinite(formData.latitude) && Number.isFinite(formData.longitude) && (formData.latitude !== 0 || formData.longitude !== 0) && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Hidden fields for form data */}
              <input type="hidden" value={formData.city} />
              <input type="hidden" value={formData.district} />
              <input type="hidden" value={formData.ward} />
              <input type="hidden" value={formData.latitude} />
              <input type="hidden" value={formData.longitude} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giờ mở cửa *</label>
                <input type="text" value={formData.openingHours} onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))} placeholder="08:00 - 21:00" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh cửa hàng</label>
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(formData.images || []).map((url, idx) => (
                      <div key={`${url}-${idx}`} className="relative group">
                        <img src={url} alt="Store" className="w-full h-24 object-cover rounded-lg border" />
                        <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 p-1 bg-white/80 rounded-full border text-red-600 opacity-0 group-hover:opacity-100 transition" title="Xoá ảnh">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="flex flex-col items-center justify-center w-36 h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin text-gray-600" /> : <UploadIcon className="w-6 h-6 mb-1 text-gray-600" />}
                    <span className="text-xs text-gray-600">{uploadingImage ? 'Đang tải...' : 'Tải ảnh'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleSelectImage} disabled={uploadingImage} />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">Hủy</button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isEditMode ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
          {addressModalOpen && (
            <AddressPickerModal
              initial={{ address: formData.address || '', city: formData.city || '', district: formData.district || '', ward: formData.ward || '', latitude: formData.latitude || 10.776, longitude: formData.longitude || 106.7 }}
              onClose={() => setAddressModalOpen(false)}
              onApply={(v) => { setFormData(prev => ({ ...prev, ...v })); setAddressModalOpen(false) }}
            />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
