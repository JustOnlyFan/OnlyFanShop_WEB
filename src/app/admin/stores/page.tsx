'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreLocationService, StoreLocation, StoreStatus } from '@/services/storeLocationService'
import { StaffService } from '@/services/staffService'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, PowerOff, Clock, Phone, Store, TrendingUp, Building2, User } from 'lucide-react'
import toast from 'react-hot-toast'
import StoreManagementModal from '@/components/admin/StoreManagementModal'
import { AdminButton, AdminCard, AdminCardHeader, AdminCardBody, AdminInput, AdminBadge, AdminStats } from '@/components/admin/ui'

export default function AdminStoresPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [allStores, setAllStores] = useState<StoreLocation[]>([])
  const [page, setPage] = useState(0)
  const [size] = useState(12)
  const [totalPages, setTotalPages] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingStore, setEditingStore] = useState<any | null>(null)
  const [storeStaffMap, setStoreStaffMap] = useState<Record<number, any[]>>({})

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadStores({ resetPage: true })
  }, [hasHydrated, isAuthenticated, user, router])

  useEffect(() => {
    if (!hasHydrated) return
    const t = setTimeout(() => loadStores(), 300)
    return () => clearTimeout(t)
  }, [searchTerm, cityFilter, page, hasHydrated])

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

  const handleAdd = () => { setEditingStore(null); setShowModal(true) }

  const handleEdit = (s: StoreLocation) => {
    setEditingStore({
      id: s.id ?? (s as any).locationID, name: s.name, address: s.address, city: s.city, district: s.district, ward: s.ward,
      latitude: s.latitude, longitude: s.longitude, phoneNumber: s.phoneNumber, email: s.email, openingHours: s.openingHours,
      description: s.description, images: s.images || [], services: s.services || [], status: StoreLocationService.resolveStoreStatus(s), isActive: s.isActive
    })
    setShowModal(true)
  }

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
        <AdminButton variant="success" icon={<Plus className="w-5 h-5" />} onClick={handleAdd}>Thêm cửa hàng</AdminButton>
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

      {/* Store List */}
      <AdminCard>
        <AdminCardHeader title="Danh sách cửa hàng" subtitle={`${allStores.length} cửa hàng`} />
        <AdminCardBody className="p-4">
          {stores.length === 0 ? (
            <div className="p-12 text-center"><Store className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">Không tìm thấy cửa hàng nào</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map((s, idx) => {
                const status = StoreLocationService.resolveStoreStatus(s)
                const storeId = s.id ?? (s as any).locationID
                const staffList = storeId ? storeStaffMap[storeId] || [] : []
                return (
                  <motion.div key={storeId || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{s.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{StoreLocationService.formatStoreAddress(s)}</p>
                        {(s.phone || s.phoneNumber) && (
                          <div className="text-sm text-gray-600 mt-1 flex items-center gap-1"><Phone className="w-3 h-3" /><span>{(s as any).phone || s.phoneNumber}</span></div>
                        )}
                        {s.openingHours && (
                          <div className="text-sm text-gray-600 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /><span>{s.openingHours}</span></div>
                        )}
                        <div className="mt-2">
                          <AdminBadge variant={status === 'ACTIVE' ? 'success' : status === 'PAUSED' ? 'warning' : 'danger'} size="sm" dot>
                            {StoreLocationService.getStoreStatusLabel(status)}
                          </AdminBadge>
                        </div>
                        {/* Staff Info */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {staffList.length > 0 ? (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-600">Nhân viên:</span>
                              <span className="text-gray-900 font-medium">{staffList[0].username}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-400"><User className="w-4 h-4" /><span>Chưa có nhân viên</span></div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <select value={status} onChange={(e) => handleChangeStatus(s, e.target.value as StoreStatus)} className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white">
                          <option value="ACTIVE">Hoạt động</option>
                          <option value="PAUSED">Tạm dừng</option>
                          <option value="CLOSED">Đã đóng cửa</option>
                        </select>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(s)} className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors" title="Sửa"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(s)} className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors" title="Xoá"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-100">
              <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors">Trước</button>
              <span className="text-sm text-gray-600">Trang {page + 1} / {totalPages}</span>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors">Sau</button>
            </div>
          )}
        </AdminCardBody>
      </AdminCard>

      {showModal && <StoreManagementModal store={editingStore} onClose={() => setShowModal(false)} onSaved={() => loadStores()} />}
    </div>
  )
}
