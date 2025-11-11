'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Power, PowerOff, MapPin, Clock, Phone, Store, TrendingUp, Building2, ArrowLeft } from 'lucide-react'
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

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = allStores.length
    const active = allStores.filter(s => s.isActive).length
    const inactive = total - active
    const cities = new Set(allStores.map(s => s.city).filter(Boolean))
    const storesByCity = allStores.reduce((acc, store) => {
      const city = store.city || 'Không xác định'
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topCities = Object.entries(storesByCity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    return {
      total,
      active,
      inactive,
      citiesCount: cities.size,
      topCities
    }
  }, [allStores])

  const header = useMemo(() => (
    <div className="flex flex-col gap-6">
      {/* Title Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 text-gray-700 hover:text-gray-900 hover:border-gray-400 hover:shadow-sm"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý cửa hàng</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý tất cả các cửa hàng của hệ thống</p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, địa chỉ, SĐT"
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* City Filter */}
        <div className="relative sm:w-64">
          <select
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setPage(0) }}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-gray-700 appearance-none cursor-pointer"
          >
            <option value="">Tất cả tỉnh/thành</option>
            {StoreLocationService.getVietnameseCities().map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm cửa hàng</span>
        </button>
      </div>
    </div>
  ), [searchTerm, cityFilter, router])

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

      {/* Statistics Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Tổng số cửa hàng</p>
              <p className="text-3xl font-bold">{statistics.total}</p>
            </div>
            <Store className="w-12 h-12 text-blue-200" />
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
                {statistics.total > 0 ? Math.round((statistics.active / statistics.total) * 100) : 0}% tổng số
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium mb-1">Tạm dừng</p>
              <p className="text-3xl font-bold">{statistics.inactive}</p>
              <p className="text-red-100 text-xs mt-1">
                {statistics.total > 0 ? Math.round((statistics.inactive / statistics.total) * 100) : 0}% tổng số
              </p>
            </div>
            <PowerOff className="w-12 h-12 text-red-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Tỉnh/Thành phố</p>
              <p className="text-3xl font-bold">{statistics.citiesCount}</p>
              <p className="text-purple-100 text-xs mt-1">Địa điểm có cửa hàng</p>
            </div>
            <Building2 className="w-12 h-12 text-purple-200" />
          </div>
        </motion.div>
      </div>

      {/* Top Cities */}
      {statistics.topCities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white rounded-xl p-6 shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Top 5 tỉnh/thành có nhiều cửa hàng nhất
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {statistics.topCities.map(([city, count], index) => (
              <div
                key={city}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200"
              >
                <div className="text-2xl font-bold text-green-600 mb-1">{count}</div>
                <div className="text-sm font-medium text-gray-700 text-center">{city}</div>
                <div className="text-xs text-gray-500 mt-1">cửa hàng</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Store List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Danh sách cửa hàng {searchTerm || cityFilter ? `(${stores.length} kết quả)` : `(${allStores.length} cửa hàng)`}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((s, idx) => (
          <motion.div key={s.id ?? `${s.name}-${s.latitude}-${s.longitude}-${idx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-gray-900 text-base">{s.name}</div>
                <div className="text-sm text-gray-600 mt-1">{StoreLocationService.formatStoreAddress(s)}</div>
                {(s.phone || s.phoneNumber) && (
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span className="font-bold">SĐT: {(s as any).phone || s.phoneNumber}</span>
                  </div>
                )}
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
























