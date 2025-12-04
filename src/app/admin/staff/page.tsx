'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StaffService, Staff } from '@/services/staffService'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { UserAdminService, UserDTO } from '@/services/userAdminService'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, User, Mail, Phone, Store, Key, Users, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import StaffModal from '@/components/admin/StaffModal'
import { AdminCard, AdminCardHeader, AdminCardBody, AdminInput, AdminBadge, AdminStats } from '@/components/admin/ui'

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
      const handler = setTimeout(() => loadAllStaffAccounts(), 300)
      return () => clearTimeout(handler)
    }
  }, [searchTerm, selectedStore, hasHydrated, isAuthenticated, user])

  const loadAllStaffAccounts = async () => {
    try {
      setLoading(true)
      const [staffResponse, candidatesResponse] = await Promise.all([
        StaffService.getAllStaff(0, 100, selectedStore).catch(() => ({ data: null })),
        UserAdminService.getStaffManagementAccounts(searchTerm || undefined, selectedStore, 0, 100, 'username', 'ASC').catch(() => ({ data: null }))
      ])
      const staffList = staffResponse.data?.content || staffResponse.data?.staff || []
      const candidatesList = candidatesResponse.data?.content || []
      const merged = [...staffList, ...candidatesList]
      const uniqueMap = new Map<number, Staff | UserDTO>()
      merged.forEach(item => {
        const id = (item as Staff).userID || (item as UserDTO).userID
        if (!uniqueMap.has(id)) uniqueMap.set(id, item)
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
          return { ...store, id: store.id ?? store.locationID ?? idx, status, isActive: status === 'ACTIVE' }
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

  const isStaffType = (item: Staff | UserDTO): item is Staff => 'role' in item && typeof (item as Staff).role === 'string'

  const filteredAccounts = allStaffAccounts.filter(item => {
    const username = isStaffType(item) ? item.username : (item.username || item.fullName || '')
    const email = item.email || ''
    const phone = isStaffType(item) ? (item.phoneNumber || '') : (item.phoneNumber || item.phone || '')
    return username.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase()) || phone.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const activeCount = filteredAccounts.filter(i => i.status === 'active').length
  const inactiveCount = filteredAccounts.filter(i => i.status === 'inactive').length

  if (!hasHydrated || loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <Button onClick={() => { setEditingStaff(null); setShowModal(true) }} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
          <Plus className="w-5 h-5 mr-2" />Thêm nhân viên
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStats title="Tổng nhân viên" value={filteredAccounts.length} icon={<Users className="w-5 h-5" />} color="blue" />
        <AdminStats title="Đang hoạt động" value={activeCount} icon={<UserCheck className="w-5 h-5" />} color="green" />
        <AdminStats title="Tạm dừng" value={inactiveCount} icon={<UserX className="w-5 h-5" />} color="orange" />
      </div>

      {/* Filters */}
      <AdminCard>
        <AdminCardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm nhân viên..." icon={<Search className="w-5 h-5" />} />
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select value={selectedStore || ''} onChange={(e) => setSelectedStore(e.target.value ? parseInt(e.target.value) : undefined)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white appearance-none">
                <option value="">Tất cả cửa hàng</option>
                {stores.map((store) => <option key={store.id || (store as any).locationID} value={store.id || (store as any).locationID}>{store.name}</option>)}
              </select>
            </div>
          </div>
        </AdminCardBody>
      </AdminCard>

      {/* Staff List */}
      <AdminCard>
        <AdminCardHeader title="Danh sách nhân viên" subtitle={`${filteredAccounts.length} nhân viên`} />
        <AdminCardBody className="p-0">
          {filteredAccounts.length === 0 ? (
            <div className="p-12 text-center"><User className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">Chưa có nhân viên nào</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nhân viên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vai trò</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cửa hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAccounts.map((item, index) => {
                    const isStaff = isStaffType(item)
                    const username = isStaff ? item.username : (item.username || item.fullName || '')
                    const email = item.email || ''
                    const phone = isStaff ? (item.phoneNumber || '') : (item.phoneNumber || item.phone || '')
                    const roleName = isStaff ? 'staff' : (item.roleName || item.role?.name || '')
                    const storeLocation = isStaff ? item.storeLocation : item.storeLocation
                    const status = item.status || 'active'
                    const userID = item.userID

                    return (
                      <motion.tr key={userID} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{username}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{email}</p>
                              {phone && <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <AdminBadge variant={roleName.toLowerCase() === 'staff' ? 'info' : 'purple'} size="sm">
                            {roleName.toLowerCase() === 'staff' ? 'Nhân viên' : roleName || 'Không xác định'}
                          </AdminBadge>
                        </td>
                        <td className="px-4 py-4">
                          {storeLocation ? (
                            <div className="flex items-center gap-2 text-sm"><Store className="w-4 h-4 text-blue-600" /><span>{storeLocation.name}</span></div>
                          ) : <span className="text-gray-400 text-sm">Chưa gán</span>}
                        </td>
                        <td className="px-4 py-4">
                          <AdminBadge variant={status === 'active' ? 'success' : status === 'inactive' ? 'warning' : 'danger'} size="sm" dot>
                            {status === 'active' ? 'Hoạt động' : status === 'inactive' ? 'Tạm dừng' : 'Đã khóa'}
                          </AdminBadge>
                        </td>
                        <td className="px-4 py-4">
                          {isStaff ? (
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => { setEditingStaff(item as Staff); setShowModal(true) }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Sửa"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => handleResetPassword(userID, username)} className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors" title="Reset mật khẩu"><Key className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(userID)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ) : <span className="text-gray-400 text-xs">Chỉ xem</span>}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AdminCardBody>
      </AdminCard>

      {showModal && <StaffModal staff={editingStaff} stores={stores} onClose={() => { setShowModal(false); setEditingStaff(null) }} onSave={() => { setShowModal(false); setEditingStaff(null); loadAllStaffAccounts() }} />}
    </div>
  )
}
