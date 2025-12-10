'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { UserAdminService, UserDTO } from '@/services/userAdminService'
import { motion } from 'framer-motion'
import { Search, Users, UserCheck, UserX, Shield, Phone, Filter, Ban, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { AdminCard, AdminCardHeader, AdminCardBody, AdminInput, AdminBadge, AdminStats } from '@/components/admin/ui'

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserDTO[]>([])
  const [allUsers, setAllUsers] = useState<UserDTO[]>([])
  const [page, setPage] = useState(0)
  const [size] = useState(12)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadUsers({ resetPage: true })
  }, [hasHydrated, isAuthenticated, user, router])

  useEffect(() => {
    if (!hasHydrated) return
    const handler = setTimeout(() => loadUsers(), 300)
    return () => clearTimeout(handler)
  }, [searchTerm, roleFilter, statusFilter, page, hasHydrated])

  const loadUsers = async (opts?: { resetPage?: boolean }) => {
    try {
      setLoading(true)
      const effectivePage = opts?.resetPage ? 0 : page
      
      try {
        const allUsersResp = await UserAdminService.getAllUsers(undefined, undefined, 0, 1000, 'fullname', 'ASC')
        const allUsersData = allUsersResp.data?.content || []
        const nonStaffUsers = allUsersData.filter(u => (u.roleName || u.role?.name || '').toLowerCase() !== 'staff')
        setAllUsers(nonStaffUsers)
      } catch (e: any) {
        console.warn('Failed to load all users:', e.message)
      }

      const resp = await UserAdminService.getAllUsers(searchTerm || undefined, roleFilter || undefined, effectivePage, size, 'fullname', 'ASC')
      const data = resp.data
      let filteredUsers = data?.content || []
      filteredUsers = filteredUsers.filter(u => (u.roleName || u.role?.name || '').toLowerCase() !== 'staff')
      if (statusFilter) filteredUsers = filteredUsers.filter(u => u.status === statusFilter)
      
      setUsers(filteredUsers)
      setTotalPages(data?.totalPages || 0)
      setTotalElements(data?.totalElements || 0)
      if (opts?.resetPage) setPage(0)
    } catch (e: any) {
      toast.error(e.message || 'Không thể tải danh sách người dùng')
      setUsers([])
      setAllUsers([])
    } finally {
      setLoading(false)
    }
  }

  const statistics = useMemo(() => {
    const total = allUsers.length
    const active = allUsers.filter(u => u.status === 'active').length
    const inactive = allUsers.filter(u => u.status === 'inactive').length
    const banned = allUsers.filter(u => u.status === 'banned').length
    const admins = allUsers.filter(u => (u.roleName || u.role?.name || '').toLowerCase() === 'admin').length
    return { total, active, inactive, banned, admins, customers: total - admins }
  }, [allUsers])

  const handleStatusChange = async (_userId: number, _newStatus: 'active' | 'inactive' | 'banned') => {
    toast('Tính năng đang được phát triển', { icon: 'ℹ️' })
  }

  const getStatusVariant = (status: string): 'default' | 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'banned': return 'danger'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động'
      case 'inactive': return 'Tạm dừng'
      case 'banned': return 'Đã khóa'
      default: return status
    }
  }

  const getRoleLabel = (roleName?: string) => {
    if (!roleName) return 'Người dùng'
    const r = roleName.toLowerCase()
    if (r === 'admin') return 'Quản trị viên'
    if (r === 'staff') return 'Nhân viên'
    return 'Khách hàng'
  }

  if (!hasHydrated || (loading && users.length === 0)) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <AdminStats title="Tổng người dùng" value={statistics.total} icon={<Users className="w-5 h-5" />} color="blue" />
        <AdminStats title="Đang hoạt động" value={statistics.active} icon={<UserCheck className="w-5 h-5" />} color="green" change={`${statistics.total > 0 ? Math.round((statistics.active / statistics.total) * 100) : 0}%`} trend="up" />
        <AdminStats title="Tạm dừng" value={statistics.inactive} icon={<UserX className="w-5 h-5" />} color="orange" />
        <AdminStats title="Đã khóa" value={statistics.banned} icon={<Ban className="w-5 h-5" />} color="red" />
        <AdminStats title="Quản trị viên" value={statistics.admins} icon={<Shield className="w-5 h-5" />} color="purple" />
        <AdminStats title="Khách hàng" value={statistics.customers} icon={<Users className="w-5 h-5" />} color="blue" />
      </div>

      {/* Filters */}
      <AdminCard>
        <AdminCardBody>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <AdminInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm theo tên, email, SĐT..." icon={<Search className="w-5 h-5" />} />
            </div>
            <div className="sm:w-48">
              <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0) }} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                <option value="">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="customer">Khách hàng</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                <option value="">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
                <option value="banned">Đã khóa</option>
              </select>
            </div>
          </div>
        </AdminCardBody>
      </AdminCard>

      {/* Users List */}
      <AdminCard>
        <AdminCardHeader title="Danh sách người dùng" subtitle={`${users.length} người dùng`} />
        <AdminCardBody className="p-0">
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Người dùng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vai trò</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u, index) => (
                    <motion.tr key={u.userID} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {u.fullName?.charAt(0).toUpperCase() || u.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.fullName || u.username}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <AdminBadge variant={(u.roleName || u.role?.name || '').toLowerCase() === 'admin' ? 'purple' : 'info'} size="sm">
                          {getRoleLabel(u.roleName || u.role?.name)}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-4">
                        <AdminBadge variant={getStatusVariant(u.status)} size="sm" dot>
                          {getStatusLabel(u.status)}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {u.phoneNumber || u.phone ? (
                          <div className="flex items-center gap-1"><Phone className="w-4 h-4" />{u.phoneNumber || u.phone}</div>
                        ) : <span className="text-gray-400">Chưa có</span>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {u.status !== 'active' && (
                            <button onClick={() => handleStatusChange(u.userID, 'active')} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors" title="Kích hoạt">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {u.status !== 'banned' && (
                            <button onClick={() => handleStatusChange(u.userID, 'banned')} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Khóa">
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          {u.status !== 'inactive' && u.status !== 'banned' && (
                            <button onClick={() => handleStatusChange(u.userID, 'inactive')} className="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors" title="Tạm dừng">
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600">
                Hiển thị <span className="font-medium">{page * size + 1}</span> - <span className="font-medium">{Math.min((page + 1) * size, totalElements)}</span> / <span className="font-medium">{totalElements}</span>
              </div>
              <div className="flex items-center gap-2">
                <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors">Trước</button>
                <span className="text-sm text-gray-600">Trang {page + 1} / {totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors">Sau</button>
              </div>
            </div>
          )}
        </AdminCardBody>
      </AdminCard>
    </div>
  )
}
