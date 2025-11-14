'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { UserAdminService, UserDTO } from '@/services/userAdminService'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Calendar,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Ban,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserDTO[]>([])
  const [allUsers, setAllUsers] = useState<UserDTO[]>([])
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(12)
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
    const handler = setTimeout(() => {
      loadUsers()
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm, roleFilter, statusFilter, page, hasHydrated])

  const loadUsers = async (opts?: { resetPage?: boolean }) => {
    try {
      setLoading(true)
      const effectivePage = opts?.resetPage ? 0 : page
      
      try {
        // Load all users for statistics (with larger page size)
        const allUsersResp = await UserAdminService.getAllUsers(
          undefined,
          undefined,
          0,
          1000,
          'username',
          'ASC'
        )
        const allUsersData = allUsersResp.data?.content || []
        const nonStaffUsers = allUsersData.filter(
          u => (u.roleName || u.role?.name || '').toLowerCase() !== 'staff'
        )
        setAllUsers(nonStaffUsers)
      } catch (e: any) {
        console.warn('Failed to load all users for statistics:', e.message)
        // Continue with paginated load even if statistics load fails
      }

      // Load paginated users
      const resp = await UserAdminService.getAllUsers(
        searchTerm || undefined,
        roleFilter || undefined,
        effectivePage,
        size,
        'username',
        'ASC'
      )
      const data = resp.data
      
      let filteredUsers = data?.content || []
      filteredUsers = filteredUsers.filter(
        u => (u.roleName || u.role?.name || '').toLowerCase() !== 'staff'
      )
      
      // Client-side filter by status
      if (statusFilter) {
        filteredUsers = filteredUsers.filter(u => u.status === statusFilter)
      }
      
      setUsers(filteredUsers)
      setTotalPages(data?.totalPages || 0)
      setTotalElements(data?.totalElements || 0)
      if (opts?.resetPage) setPage(0)
    } catch (e: any) {
      console.error('Error loading users:', e)
      toast.error(e.message || 'Không thể tải danh sách người dùng')
      // Set empty arrays on error
      setUsers([])
      setAllUsers([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = allUsers.length
    const active = allUsers.filter(u => u.status === 'active').length
    const inactive = allUsers.filter(u => u.status === 'inactive').length
    const banned = allUsers.filter(u => u.status === 'banned').length
    const admins = allUsers.filter(u => u.roleName?.toLowerCase() === 'admin' || u.role?.name?.toLowerCase() === 'admin').length
    const customers = total - admins
    
    return {
      total,
      active,
      inactive,
      banned,
      admins,
      customers
    }
  }, [allUsers])

  const handleStatusChange = async (userId: number, newStatus: 'active' | 'inactive' | 'banned') => {
    // TODO: Implement backend endpoint for updating user status
    toast.info('Tính năng cập nhật trạng thái người dùng đang được phát triển')
    // try {
    //   await UserAdminService.updateUserStatus(userId, newStatus)
    //   toast.success(`Đã cập nhật trạng thái người dùng`)
    //   loadUsers()
    // } catch (e: any) {
    //   toast.error(e.message || 'Không thể cập nhật trạng thái')
    // }
  }

  const handleDeleteUser = async (userId: number, userName: string) => {
    // TODO: Implement backend endpoint for deleting users
    toast.info('Tính năng xóa người dùng đang được phát triển')
    // if (!confirm(`Xác nhận xóa người dùng "${userName}"?`)) return
    // try {
    //   await UserAdminService.deleteUser(userId)
    //   toast.success('Đã xóa người dùng')
    //   loadUsers()
    // } catch (e: any) {
    //   toast.error(e.message || 'Không thể xóa người dùng')
    // }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'banned':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động'
      case 'inactive':
        return 'Tạm dừng'
      case 'banned':
        return 'Đã khóa'
      default:
        return status
    }
  }

  const getRoleLabel = (roleName?: string) => {
    if (!roleName) return 'Người dùng'
    const roleLower = roleName.toLowerCase()
    if (roleLower === 'admin') return 'Quản trị viên'
    if (roleLower === 'staff') return 'Nhân viên'
    return 'Khách hàng'
  }

  if (!hasHydrated || (loading && users.length === 0)) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
              <p className="text-sm text-gray-500 mt-0.5">Quản lý tất cả người dùng trong hệ thống</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Tổng người dùng</p>
              <p className="text-3xl font-bold">{statistics.total}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium mb-1">Đang hoạt động</p>
              <p className="text-3xl font-bold">{statistics.active}</p>
              <p className="text-green-100 text-xs mt-1">
                {statistics.total > 0 ? Math.round((statistics.active / statistics.total) * 100) : 0}%
              </p>
            </div>
            <UserCheck className="w-12 h-12 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium mb-1">Tạm dừng</p>
              <p className="text-3xl font-bold">{statistics.inactive}</p>
            </div>
            <UserX className="w-12 h-12 text-gray-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium mb-1">Đã khóa</p>
              <p className="text-3xl font-bold">{statistics.banned}</p>
            </div>
            <Ban className="w-12 h-12 text-red-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Quản trị viên</p>
              <p className="text-3xl font-bold">{statistics.admins}</p>
            </div>
            <Shield className="w-12 h-12 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Khách hàng</p>
              <p className="text-3xl font-bold">{statistics.customers}</p>
            </div>
            <Users className="w-12 h-12 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* Role Filter */}
          <div className="relative sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0) }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 appearance-none cursor-pointer"
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="customer">Khách hàng</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 appearance-none cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
              <option value="banned">Đã khóa</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Danh sách người dùng {searchTerm || roleFilter || statusFilter ? `(${users.length} kết quả)` : `(${totalElements} người dùng)`}
          </h3>
        </div>
        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Không tìm thấy người dùng nào</p>
            <p className="text-sm mt-2">Thử thay đổi bộ lọc</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <motion.tr
                    key={user.userID}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {user.fullName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName || user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.roleName?.toLowerCase() === 'admin' || user.role?.name?.toLowerCase() === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getRoleLabel(user.roleName || user.role?.name)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phoneNumber || user.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {user.phoneNumber || user.phone}
                        </div>
                      ) : (
                        <span className="text-gray-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {user.status !== 'active' && (
                          <button
                            onClick={() => handleStatusChange(user.userID, 'active')}
                            className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                            title="Kích hoạt"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {user.status !== 'banned' && (
                          <button
                            onClick={() => handleStatusChange(user.userID, 'banned')}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Khóa tài khoản"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        )}
                        {user.status !== 'inactive' && user.status !== 'banned' && (
                          <button
                            onClick={() => handleStatusChange(user.userID, 'inactive')}
                            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Tạm dừng"
                          >
                            <UserX className="w-5 h-5" />
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-700">
              Hiển thị <span className="font-medium">{page * size + 1}</span> đến{' '}
              <span className="font-medium">{Math.min((page + 1) * size, totalElements)}</span> trong tổng số{' '}
              <span className="font-medium">{totalElements}</span> người dùng
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Trước
              </button>
              <div className="text-sm">Trang {page + 1} / {totalPages}</div>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
