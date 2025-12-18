'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreLocationService, StoreLocation, StoreStatus } from '@/services/storeLocationService'
import { StaffService } from '@/services/staffService'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, PowerOff, Clock, Phone, Store, TrendingUp, Building2, User, MapPin, Mail, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { AdminCard, AdminCardHeader, AdminCardBody, AdminInput, AdminStats } from '@/components/admin/ui'

export default function AdminStoresPage() {
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [allStores, setAllStores] = useState<StoreLocation[]>([])
  const [page, setPage] = useState(0)
  const [size] = useState(12)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  const [storeStaffMap, setStoreStaffMap] = useState<Record<number, any[]>>({})


  // Initial load
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return
    loadStores({ resetPage: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated, user?.role])

  // Filter/search changes
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return
    const t = setTimeout(() => loadStores(), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, cityFilter, page])

  const loadStores = async (opts?: { resetPage?: boolean }) => {
    try {
      setLoading(true)
      const effectivePage = opts?.resetPage ? 0 : page
      const resp = await StoreLocationService.getStoreLocations(undefined, undefined, cityFilter || undefined)
      const data = resp.data
      const rawItems: any[] = Array.isArray(data) ? data : (data?.stores || [])
      let items: StoreLocation[] = rawItems.map((it, i) => {
        const normalizedStatus = StoreLocationService.resolveStoreStatus(it)
        const resolvedId = it.id ?? it.locationID ?? i
        return { ...it, id: resolvedId, status: normalizedStatus, isActive: normalizedStatus === 'ACTIVE' } as StoreLocation
      })
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        items = items.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || (s.phoneNumber || '').toLowerCase().includes(q))
      }
      setAllStores(items)
      const total = Math.max(1, Math.ceil(items.length / size))
      setTotalPages(total)
      const paginated = items.slice(effectivePage * size, (effectivePage + 1) * size)
      setStores(paginated)
      
      const staffMap: Record<number, any[]> = {}
      await Promise.all(items.map(async (store) => {
        const storeId = store.id ?? (store as any).locationID
        if (storeId) {
          try {
            const staffResp = await StaffService.getStaffByStoreLocation(storeId)
            staffMap[storeId] = staffResp.data || []
          } catch { staffMap[storeId] = [] }
        }
      }))
      setStoreStaffMap(staffMap)
      if (opts?.resetPage) setPage(0)
    } catch (e: any) {
      toast.error(e.message || 'Không thể tải danh sách cửa hàng')
    } finally {
      setLoading(false)
    }
  }

  // handleAdd removed - using Link to /admin/stores/new instead

  // handleEdit removed - using Link to /admin/stores/[id]/settings instead

  const handleDelete = async (s: StoreLocation) => {
    if (!confirm(`Xoá cửa hàng "${s.name}"?`)) return
    try {
      const storeId = s.id ?? (s as any).locationID
      if (typeof storeId !== 'number') { toast.error('Không tìm thấy ID cửa hàng hợp lệ'); return }
      await StoreLocationService.deleteStoreLocation(storeId)
      toast.success('Đã xoá cửa hàng')
      loadStores()
    } catch (e: any) { toast.error(e.message || 'Không thể xoá cửa hàng') }
  }

  const handleChangeStatus = async (s: StoreLocation, newStatus: StoreStatus) => {
    const currentStatus = StoreLocationService.resolveStoreStatus(s)
    if (currentStatus === newStatus) return
    if (newStatus === 'CLOSED' && !confirm(`Xác nhận đóng cửa "${s.name}"? Nhân viên sẽ bị khóa tài khoản.`)) return
    try {
      const storeId = s.id ?? (s as any).locationID
      if (typeof storeId !== 'number') { toast.error('Không tìm thấy ID cửa hàng hợp lệ'); return }
      await StoreLocationService.updateStoreLocation(storeId, { status: newStatus })
      toast.success(`Đã cập nhật trạng thái cửa hàng sang "${StoreLocationService.getStoreStatusLabel(newStatus)}"`)
      loadStores()
    } catch (e: any) { toast.error(e.message || 'Không thể đổi trạng thái') }
  }

  const statistics = useMemo(() => {
    const total = allStores.length
    const statusOf = (store: StoreLocation) => StoreLocationService.resolveStoreStatus(store)
    const active = allStores.filter(s => statusOf(s) === 'ACTIVE').length
    const paused = allStores.filter(s => statusOf(s) === 'PAUSED').length
    const closed = allStores.filter(s => statusOf(s) === 'CLOSED').length
    const cities = new Set(allStores.map(s => s.city).filter(Boolean))
    return { total, active, paused, closed, citiesCount: cities.size }
  }, [allStores])

  if (!hasHydrated || loading && stores.length === 0) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  return (
    <div className="space-y-6">
      {/* Action Button */}
      <div className="flex justify-end">
        <Link 
          href="/admin/stores/new" 
          className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium shadow-lg inline-flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          Thêm cửa hàng
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <AdminStats title="Tổng cửa hàng" value={statistics.total} icon={<Store className="w-5 h-5" />} color="blue" />
        <AdminStats title="Đang hoạt động" value={statistics.active} icon={<TrendingUp className="w-5 h-5" />} color="green" change={`${statistics.total > 0 ? Math.round((statistics.active / statistics.total) * 100) : 0}%`} trend="up" />
        <AdminStats title="Tạm dừng" value={statistics.paused} icon={<PowerOff className="w-5 h-5" />} color="orange" />
        <AdminStats title="Đã đóng cửa" value={statistics.closed} icon={<PowerOff className="w-5 h-5" />} color="red" />
        <AdminStats title="Tỉnh/Thành phố" value={statistics.citiesCount} icon={<Building2 className="w-5 h-5" />} color="purple" />
      </div>

      {/* Filters */}
      <AdminCard>
        <AdminCardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <AdminInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm theo tên, địa chỉ, SĐT" icon={<Search className="w-5 h-5" />} />
            </div>
            <div className="sm:w-64">
              <select value={cityFilter} onChange={(e) => { setCityFilter(e.target.value); setPage(0) }} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                <option value="">Tất cả tỉnh/thành</option>
                {StoreLocationService.getVietnameseCities().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </AdminCardBody>
      </AdminCard>

      {/* Store List - Table View */}
      <AdminCard>
        <AdminCardHeader title="Danh sách cửa hàng" subtitle={`${allStores.length} cửa hàng`} />
        <AdminCardBody className="p-0">
          {stores.length === 0 ? (
            <div className="p-12 text-center"><Store className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">Không tìm thấy cửa hàng nào</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cửa hàng</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Liên hệ</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quản lý</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {stores.map((s, idx) => {
                    const status = StoreLocationService.resolveStoreStatus(s)
                    const storeId = s.id ?? (s as any).locationID
                    const staffList = storeId ? storeStaffMap[storeId] || [] : []
                    const storeImage = (s as any).imageUrl || s.images?.[0]
                    
                    return (
                      <motion.tr 
                        key={storeId || idx} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: idx * 0.03 }} 
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        {/* Store Info with Image */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            {/* Store Image */}
                            <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border border-gray-200">
                              {storeImage ? (
                                <Image 
                                  src={storeImage} 
                                  alt={s.name} 
                                  width={80} 
                                  height={80} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Store className="w-8 h-8 text-blue-400" />
                                </div>
                              )}
                            </div>
                            {/* Store Details */}
                            <div className="min-w-0">
                              <Link href={`/admin/stores/${storeId}`} className="font-semibold text-gray-900 text-base hover:text-indigo-600 transition-colors">
                                {s.name}
                              </Link>
                              <div className="flex items-start gap-1 mt-1 text-sm text-gray-500">
                                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{StoreLocationService.formatStoreAddress(s)}</span>
                              </div>
                              {s.openingHours && (
                                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  <span>{s.openingHours}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            {(s.phone || s.phoneNumber) && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                  <Phone className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-gray-700 font-medium">{(s as any).phone || s.phoneNumber}</span>
                              </div>
                            )}
                            {s.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <Mail className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="text-gray-600 truncate max-w-[150px]">{s.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Staff Manager */}
                        <td className="px-4 py-4">
                          {staffList.length > 0 ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                {(staffList[0].username || staffList[0].fullName || 'S').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{staffList[0].username || staffList[0].fullName}</p>
                                <p className="text-xs text-gray-500">{staffList[0].email || 'Nhân viên quản lý'}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-400">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400" />
                              </div>
                              <span className="text-sm">Chưa có nhân viên</span>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <select 
                            value={status} 
                            onChange={(e) => handleChangeStatus(s, e.target.value as StoreStatus)} 
                            className={`px-3 py-2 text-sm font-medium rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer transition-colors ${
                              status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-700 focus:ring-green-500' 
                                : status === 'PAUSED' 
                                  ? 'bg-yellow-100 text-yellow-700 focus:ring-yellow-500' 
                                  : 'bg-red-100 text-red-700 focus:ring-red-500'
                            }`}
                          >
                            <option value="ACTIVE">🟢 Hoạt động</option>
                            <option value="PAUSED">🟡 Tạm dừng</option>
                            <option value="CLOSED">🔴 Đã đóng</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link 
                              href={`/admin/stores/${storeId}`}
                              className="p-2.5 rounded-xl text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all hover:scale-105" 
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link 
                              href={`/admin/stores/${storeId}/settings`}
                              className="p-2.5 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all hover:scale-105" 
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => handleDelete(s)} 
                              className="p-2.5 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-all hover:scale-105" 
                              title="Xoá cửa hàng"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <span className="text-sm text-gray-600">
                Hiển thị {page * size + 1} - {Math.min((page + 1) * size, allStores.length)} / {allStores.length} cửa hàng
              </span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 0} 
                  onClick={() => setPage(p => Math.max(0, p - 1))} 
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
                >
                  ← Trước
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i
                    if (totalPages > 5) {
                      if (page < 3) pageNum = i
                      else if (page > totalPages - 4) pageNum = totalPages - 5 + i
                      else pageNum = page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${
                          page === pageNum 
                            ? 'bg-blue-600 text-white' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}
                </div>
                <button 
                  disabled={page >= totalPages - 1} 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-white transition-colors"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </AdminCardBody>
      </AdminCard>

    </div>
  )
}
