'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StaffService, Staff } from '@/services/staffService'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { UserAdminService, UserDTO } from '@/services/userAdminService'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, User, Mail, Phone, Store, ArrowLeft, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import StaffModal from '@/components/admin/StaffModal'

export default function AdminStaffPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [allStaffAccounts, setAllStaffAccounts] = useState<(Staff | UserDTO)[]>([])
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
    loadStores()
  }, [hasHydrated, isAuthenticated, user, router])

  useEffect(() => {
    if (hasHydrated && isAuthenticated && user?.role === 'ADMIN') {
      const handler = setTimeout(() => {
        loadAllStaffAccounts()
      }, 300)
      return () => clearTimeout(handler)
    }
  }, [searchTerm, selectedStore, hasHydrated, isAuthenticated, user])

  const loadAllStaffAccounts = async () => {
    try {
      setLoading(true)
      
      // Load both staff and candidate accounts in parallel
      const [staffResponse, candidatesResponse] = await Promise.all([
        StaffService.getAllStaff(0, 100, selectedStore).catch(() => ({ data: null })),
        UserAdminService.getStaffManagementAccounts(
          searchTerm || undefined,
          selectedStore,
          0,
          100,
          'username',
          'ASC'
        ).catch(() => ({ data: null }))
      ])

      const staffList = staffResponse.data?.content || staffResponse.data?.staff || []
      const candidatesList = candidatesResponse.data?.content || []

      // Merge and deduplicate by userID
      const merged = [...staffList, ...candidatesList]
      const uniqueMap = new Map<number, Staff | UserDTO>()
      
      merged.forEach(item => {
        const id = (item as Staff).userID || (item as UserDTO).userID
        if (!uniqueMap.has(id)) {
          uniqueMap.set(id, item)
        }
      })

      setAllStaffAccounts(Array.from(uniqueMap.values()))
    } catch (error: any) {
      console.error('Error loading staff accounts:', error)
      setAllStaffAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const loadStores = async () => {
    try {
      const response = await StoreLocationService.getStoreLocations()
      if (response.data) {
        const rawStores: any[] = Array.isArray(response.data) ? response.data : (response.data.stores || [])
        const normalizedStores: StoreLocation[] = rawStores.map((store, idx) => {
          const status = StoreLocationService.resolveStoreStatus(store)
          return {
            ...store,
            id: store.id ?? store.locationID ?? idx,
            status,
            isActive: status === 'ACTIVE'
          }
        })
        setStores(normalizedStores)
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
      loadAllStaffAccounts()
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa nhân viên')
    }
  }

  const handleResetPassword = async (staffId: number, username: string) => {
    if (!confirm(`Xác nhận reset mật khẩu của "${username}" về mặc định (Staff@123)?`)) return

    try {
      await StaffService.resetStaffPassword(staffId)
      toast.success(`Đã reset mật khẩu của "${username}" về mặc định: Staff@123`)
    } catch (error: any) {
      toast.error(error.message || 'Không thể reset mật khẩu')
    }
  }

  const getRoleBadgeStyle = (roleName?: string) => {
    if (!roleName) return 'bg-gray-100 text-gray-800'
    const normalized = roleName.toLowerCase()
    if (normalized === 'staff') return 'bg-blue-100 text-blue-800'
    return 'bg-violet-100 text-violet-800'
  }

  const getRoleLabel = (roleName?: string) => {
    if (!roleName) return 'Không xác định'
    const normalized = roleName.toLowerCase()
    if (normalized === 'staff') return 'Nhân viên'
    return roleName
  }

  const isStaffType = (item: Staff | UserDTO): item is Staff => {
    return 'role' in item && typeof (item as Staff).role === 'string'
  }

  const filteredAccounts = allStaffAccounts.filter(item => {
    const username = isStaffType(item) ? item.username : (item.username || item.fullName || '')
    const email = item.email || ''
    const phone = isStaffType(item) ? (item.phoneNumber || '') : (item.phoneNumber || item.phone || '')
    
    const matchesSearch = 
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase())
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
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý nhân viên</h1>
                <p className="text-gray-600 mt-1">Quản lý tài khoản nhân viên và cửa hàng</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingStaff(null)
                setShowModal(true)
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Thêm nhân viên
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedStore || ''}
                onChange={(e) => setSelectedStore(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:shadow-md appearance-none bg-white"
              >
                <option value="">Tất cả cửa hàng</option>
                {stores.map((store) => (
                  <option key={store.id || (store as any).locationID} value={store.id || (store as any).locationID}>
                    {store.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Staff List - Combined */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Danh sách nhân viên
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredAccounts.length} {filteredAccounts.length === 1 ? 'nhân viên' : 'nhân viên'}
                </p>
              </div>
            </div>
          </div>
          {filteredAccounts.length === 0 ? (
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
                      Vai trò
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
                  {filteredAccounts.map((item) => {
                    const isStaff = isStaffType(item)
                    const username = isStaff ? item.username : (item.username || item.fullName || '')
                    const displayInitial = username ? username.charAt(0).toUpperCase() : 'U'
                    const email = item.email || ''
                    const phone = isStaff ? (item.phoneNumber || '') : (item.phoneNumber || item.phone || '')
                    const roleName = isStaff ? 'staff' : (item.roleName || item.role?.name || '')
                    const storeLocation = isStaff ? item.storeLocation : item.storeLocation
                    const storeStatus = storeLocation?.status
                    const status = item.status || 'active'
                    const userID = item.userID

                    return (
                      <motion.tr
                        key={userID}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600 font-semibold">
                              {displayInitial}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{username}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {email}
                              </div>
                              {phone && (
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                  <Phone className="w-3 h-3" />
                                  {phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeStyle(roleName)}`}>
                            {getRoleLabel(roleName)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        {storeLocation ? (
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Store className="w-4 h-4 mr-2 text-blue-600" />
                              {storeLocation.name}
                            </div>
                            {storeStatus && (
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${StoreLocationService.getStoreStatusColor(storeStatus)}`}>
                                {StoreLocationService.getStoreStatusLabel(storeStatus)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Chưa gán</span>
                        )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status === 'active' ? 'Hoạt động' : status === 'inactive' ? 'Tạm dừng' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isStaff ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingStaff(item as Staff)
                                  setShowModal(true)
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Sửa nhân viên"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleResetPassword(userID, username)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Reset mật khẩu về mặc định (Staff@123)"
                              >
                                <Key className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(userID)}
                                className="text-red-600 hover:text-red-900"
                                title="Xóa nhân viên"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Chỉ xem</span>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Staff Modal */}
      {showModal && (
        <StaffModal
          staff={editingStaff}
          stores={stores}
          onClose={() => {
            setShowModal(false)
            setEditingStaff(null)
          }}
          onSave={() => {
            setShowModal(false)
            setEditingStaff(null)
            loadAllStaffAccounts()
          }}
        />
      )}
    </div>
  )
}






