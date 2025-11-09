'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Power, PowerOff, MapPin, Clock, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import StoreManagementModal from '@/components/admin/StoreManagementModal'

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
      let items: StoreLocation[] = Array.isArray(data) ? data : (data.stores || [])
      items = items.map((it, i) => ({ ...it, id: (it as any).id ?? (it as any).locationID ?? i }))
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        items = items.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q) ||
          (s.phoneNumber || '').toLowerCase().includes(q)
        )
      }
      setAllStores(items)
      const total = Math.max(1, Math.ceil(items.length / size))
      setTotalPages(total)
      const paginated = items.slice(effectivePage * size, (effectivePage + 1) * size)
      setStores(paginated)
      if (opts?.resetPage) setPage(0)
    } catch (e: any) {
      toast.error(e.message || 'Không thể tải danh sách cửa hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingStore(null)
    setShowModal(true)
  }

  const handleEdit = (s: StoreLocation) => {
    setEditingStore({
      id: s.id ?? (s as any).locationID,
      name: s.name,
      address: s.address,
      city: s.city,
      district: s.district,
      ward: s.ward,
      latitude: s.latitude,
      longitude: s.longitude,
      phoneNumber: s.phoneNumber,
      email: s.email,
      openingHours: s.openingHours,
      description: s.description,
      images: s.images || [],
      services: s.services || [],
      isActive: s.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (s: StoreLocation) => {
    if (!confirm(`Xoá cửa hàng "${s.name}"?`)) return
    try {
      const storeId = s.id ?? (s as any).locationID
      if (typeof storeId !== 'number') {
        toast.error('Không tìm thấy ID cửa hàng hợp lệ')
        return
      }
      await StoreLocationService.deleteStoreLocation(storeId)
      toast.success('Đã xoá cửa hàng')
      loadStores()
    } catch (e: any) {
      toast.error(e.message || 'Không thể xoá cửa hàng')
    }
  }

  const handleToggleActive = async (s: StoreLocation) => {
    try {
      const storeId = s.id ?? (s as any).locationID
      if (typeof storeId !== 'number') {
        toast.error('Không tìm thấy ID cửa hàng hợp lệ')
        return
      }
      await StoreLocationService.updateStoreLocation(storeId, { isActive: !s.isActive })
      toast.success(!s.isActive ? 'Đã kích hoạt' : 'Đã tạm dừng')
      loadStores()
    } catch (e: any) {
      toast.error(e.message || 'Không thể đổi trạng thái')
    }
  }

  const header = useMemo(() => (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 text-gray-900 font-semibold text-xl">
        <MapPin className="w-6 h-6 text-green-600" />
        Quản lý cửa hàng
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, địa chỉ, SĐT"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={cityFilter}
          onChange={(e) => { setCityFilter(e.target.value); setPage(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Tất cả tỉnh/thành</option>
          {StoreLocationService.getVietnameseCities().map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm cửa hàng
        </button>
      </div>
    </div>
  ), [searchTerm, cityFilter])

  if (!hasHydrated || loading && stores.length === 0) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-8 py-6">
      {header}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((s, idx) => (
          <motion.div key={s.id ?? `${s.name}-${s.latitude}-${s.longitude}-${idx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-gray-900 text-base">{s.name}</div>
                <div className="text-sm text-gray-600 mt-1">{StoreLocationService.formatStoreAddress(s)}</div>
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span className="font-bold">SĐT: {s.phoneNumber}</span>
                </div>
                {s.openingHours && (
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-bold">{s.openingHours}</span>
                  </div>
                )}
                <div className={`mt-2 inline-block text-xs px-2 py-1 rounded-full font-medium ${StoreLocationService.getStoreStatusColor(s.isActive)}`}>
                  {StoreLocationService.getStoreStatusLabel(s.isActive)}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleActive(s)}
                  title={s.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                  className={`p-2 rounded-lg border hover:bg-gray-50 ${s.isActive ? 'text-red-600' : 'text-green-600'}`}
                >
                  {s.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                </button>
                <button onClick={() => handleEdit(s)} title="Sửa" className="p-2 rounded-lg border hover:bg-gray-50 text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s)} title="Xoá" className="p-2 rounded-lg border hover:bg-gray-50 text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="px-3 py-2 border rounded-lg disabled:opacity-50"
          >
            Trước
          </button>
          <div className="text-sm">Trang {page + 1} / {totalPages}</div>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            className="px-3 py-2 border rounded-lg disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {showModal && (
        <StoreManagementModal
          store={editingStore}
          onClose={() => setShowModal(false)}
          onSaved={() => loadStores()}
        />
      )}
    </div>
  )
}
























