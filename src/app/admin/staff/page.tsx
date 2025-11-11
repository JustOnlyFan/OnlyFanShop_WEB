'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StaffService, Staff, CreateStaffRequest } from '@/services/staffService'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, User, Mail, Phone, MapPin, Store, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

export default function AdminStaffPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<Staff[]>([])
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStore, setSelectedStore] = useState<number | undefined>()
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadStaff()
    loadStores()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadStaff = async () => {
    try {
      setLoading(true)
      const response = await StaffService.getAllStaff(0, 100, selectedStore)
      if (response.data) {
        setStaff(response.data.staff || [])
      }
    } catch (error: any) {
      console.error('Error loading staff:', error)
      // If API doesn't exist yet, show empty state
      setStaff([])
    } finally {
      setLoading(false)
    }
  }

  const loadStores = async () => {
    try {
      const response = await StoreLocationService.getStoreLocations()
      if (response.data) {
        const storesData = Array.isArray(response.data) ? response.data : (response.data.stores || [])
        setStores(storesData)
      }
    } catch (error: any) {
      console.error('Error loading stores:', error)
    }
  }

  const handleDelete = async (staffId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return

    try {
      await StaffService.deleteStaff(staffId)
      toast.success('Xóa nhân viên thành công')
      loadStaff()
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa nhân viên')
    }
  }

  const filteredStaff = staff.filter(s => {
    const matchesSearch = 
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý nhân viên</h1>
              <p className="text-gray-600 mt-1">Quản lý tài khoản nhân viên và cửa hàng</p>
            </div>
            <Button
              onClick={() => {
                setEditingStaff(null)
                setShowModal(true)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Thêm nhân viên
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedStore || ''}
              onChange={(e) => setSelectedStore(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả cửa hàng</option>
              {stores.map((store) => (
                <option key={store.id || (store as any).locationID} value={store.id || (store as any).locationID}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có nhân viên nào</p>
              <p className="text-gray-400 text-sm mt-2">Thêm nhân viên mới để bắt đầu</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cửa hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.map((s) => (
                    <motion.tr
                      key={s.userID}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{s.username}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              {s.email}
                            </div>
                            {s.phoneNumber && (
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {s.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {s.storeLocation ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <Store className="w-4 h-4 mr-2 text-blue-600" />
                            {s.storeLocation.name}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Chưa gán</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          s.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : s.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {s.status === 'active' ? 'Hoạt động' : s.status === 'inactive' ? 'Không hoạt động' : 'Bị cấm'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingStaff(s)
                              setShowModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.userID)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Staff Modal - Placeholder for now */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? 'Sửa nhân viên' : 'Thêm nhân viên'}
            </h2>
            <p className="text-gray-600 mb-4">
              Tính năng này sẽ được hoàn thiện khi backend API sẵn sàng.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





