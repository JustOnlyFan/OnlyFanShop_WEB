'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { Store as StoreIcon, Search, Settings, CheckCircle2, XCircle, Package } from 'lucide-react'
import { StoreProductModal } from '@/components/admin/StoreProductModal'
import toast from 'react-hot-toast'
import { AdminCard, AdminCardHeader, AdminCardBody, AdminInput, AdminBadge, AdminStats } from '@/components/admin/ui'

type StoreWithId = StoreLocation & { id?: number; locationID?: number }

export default function AdminWarehousesPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stores, setStores] = useState<StoreWithId[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedStore, setSelectedStore] = useState<StoreWithId | null>(null)
  const [storeProductStats, setStoreProductStats] = useState<Record<number, { available: number; total: number }>>({})

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadStores()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadStores = async () => {
    try {
      setLoading(true)
      const response = await StoreLocationService.getStoreLocations()
      const raw = response.data
      const list: StoreWithId[] = Array.isArray(raw) ? raw : raw?.stores || []
      const normalized = list.map((store, index) => ({
        ...store,
        id: store.id ?? store.locationID ?? index
      }))
      setStores(normalized)
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách cửa hàng')
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch = store.name?.toLowerCase().includes(searchTerm.toLowerCase()) || store.address?.toLowerCase().includes(searchTerm.toLowerCase()) || store.city?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCity = selectedCity ? store.city === selectedCity : true
      return matchesSearch && matchesCity
    })
  }, [stores, searchTerm, selectedCity])

  const statistics = useMemo(() => {
    const total = stores.length
    const active = stores.filter((s) => StoreLocationService.resolveStoreStatus(s) === 'ACTIVE').length
    const paused = stores.filter((s) => StoreLocationService.resolveStoreStatus(s) === 'PAUSED').length
    const closed = stores.filter((s) => StoreLocationService.resolveStoreStatus(s) === 'CLOSED').length
    return { total, active, paused, closed }
  }, [stores])

  const handleStatsChange = (storeId: number, stats: { available: number; total: number }) => {
    setStoreProductStats((prev) => ({ ...prev, [storeId]: stats }))
  }

  if (!hasHydrated || loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStats title="Tổng cửa hàng" value={statistics.total} icon={<StoreIcon className="w-5 h-5" />} color="blue" />
        <AdminStats title="Đang hoạt động" value={statistics.active} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
        <AdminStats title="Tạm dừng" value={statistics.paused} icon={<Package className="w-5 h-5" />} color="orange" />
        <AdminStats title="Đã đóng" value={statistics.closed} icon={<XCircle className="w-5 h-5" />} color="red" />
      </div>

      {/* Filters */}
      <AdminCard>
        <AdminCardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <AdminInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm theo tên, địa chỉ..." icon={<Search className="w-5 h-5" />} />
            </div>
            <div className="md:w-60">
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                <option value="">Tất cả tỉnh/thành</option>
                {[...new Set(stores.map((store) => store.city).filter(Boolean))].map((city) => (
                  <option key={city as string} value={city as string}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </AdminCardBody>
      </AdminCard>

      {/* Store list */}
      <AdminCard>
        <AdminCardHeader title="Danh sách cửa hàng" subtitle={`${filteredStores.length} cửa hàng`} />
        <AdminCardBody className="p-0">
          {filteredStores.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Không tìm thấy cửa hàng phù hợp</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cửa hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Địa chỉ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sản phẩm</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStores.map((store, index) => {
                    const storeId = store.id ?? (store as any).locationID
                    const status = StoreLocationService.resolveStoreStatus(store)
                    const stats = storeId ? storeProductStats[storeId] : undefined

                    return (
                      <motion.tr key={storeId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-semibold text-gray-900">{store.name}</div>
                          {store.phoneNumber && <div className="text-sm text-gray-500">{store.phoneNumber}</div>}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{StoreLocationService.formatStoreAddress(store)}</td>
                        <td className="px-4 py-4">
                          <AdminBadge variant={status === 'ACTIVE' ? 'success' : status === 'PAUSED' ? 'warning' : 'danger'} size="sm" dot>
                            {StoreLocationService.getStoreStatusLabel(status)}
                          </AdminBadge>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {stats ? (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-indigo-700">{stats.available}</span>
                              <span className="text-gray-400">/ {stats.total}</span>
                            </div>
                          ) : <span className="text-gray-400">Chưa tải</span>}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button onClick={() => setSelectedStore(store)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                            <Settings className="w-4 h-4" />
                            Quản lý
                          </button>
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

      {selectedStore && (
        <StoreProductModal store={selectedStore} onClose={() => setSelectedStore(null)} onStatsChange={handleStatsChange} />
      )}
    </div>
  )
}
