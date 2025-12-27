'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Package, Clock, CheckCircle, Truck, PackageCheck, XCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { InventoryRequestService, InventoryRequest } from '@/services/inventoryRequestService'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  APPROVED: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  SHIPPING: { label: 'Đang vận chuyển', color: 'bg-purple-100 text-purple-700', icon: Truck },
  DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: PackageCheck },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
  CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700', icon: XCircle },
}

export default function WarehouseInventoryRequestsPage() {
  const params = useParams()
  const router = useRouter()
  const warehouseId = Number(params.id)
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [warehouse, setWarehouse] = useState<StoreLocation | null>(null)
  const [requests, setRequests] = useState<InventoryRequest[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated, user?.role, warehouseId])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load warehouse (store) info
      const storeResp = await StoreLocationService.getStoreLocations()
      const stores = Array.isArray(storeResp.data) ? storeResp.data : storeResp.data?.stores || []
      const found = stores.find((s: any) => (s.id ?? s.locationID) === warehouseId)
      if (found) {
        setWarehouse({ ...found, id: found.id ?? found.locationID })
      }

      // Load inventory requests
      try {
        const resp = await InventoryRequestService.getStoreRequests(warehouseId)
        setRequests(Array.isArray(resp.data) ? resp.data : [])
      } catch {
        setRequests([])
      }
    } catch (e: any) {
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: number) => {
    try {
      const request = requests.find((r) => r.id === requestId)
      await InventoryRequestService.approveRequest(requestId, {
        approvedQuantity: request?.requestedQuantity || 0,
        adminNote: '',
      })
      toast.success('Đã duyệt yêu cầu')
      loadData()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể duyệt')
    }
  }

  const handleReject = async (requestId: number) => {
    try {
      await InventoryRequestService.rejectRequest(requestId, { adminNote: '' })
      toast.success('Đã từ chối yêu cầu')
      loadData()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể từ chối')
    }
  }

  const handleStartShipping = async (requestId: number) => {
    try {
      await InventoryRequestService.startShipping(requestId)
      toast.success('Đã chuyển sang trạng thái vận chuyển')
      loadData()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể cập nhật')
    }
  }

  const handleDelivered = async (requestId: number) => {
    try {
      await InventoryRequestService.completeDelivery(requestId)
      toast.success('Đã giao hàng - Số lượng kho đã được cập nhật')
      loadData()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể cập nhật')
    }
  }

  const filteredRequests = statusFilter === 'ALL' ? requests : requests.filter((r) => r.status === statusFilter)

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/warehouses" className="text-gray-500 hover:text-indigo-600 transition-colors">
          Kho hàng
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">{warehouse?.name || 'Chi tiết'}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Yêu cầu nhập hàng</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yêu cầu nhập hàng</h1>
            <p className="text-sm text-gray-500">Quản lý đơn yêu cầu nhập số lượng sản phẩm cho kho {warehouse?.name}</p>
          </div>
        </div>
        <Link
          href={`/admin/warehouses/${warehouseId}/inventory-requests/new`}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tạo yêu cầu mới
        </Link>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Tất cả ({requests.length})
          </button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = requests.filter((r) => r.status === key).length
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === key ? 'bg-gray-900 text-white' : `${config.color} hover:opacity-80`}`}
              >
                {config.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Chưa có yêu cầu nhập hàng nào</p>
            <Link href={`/admin/warehouses/${warehouseId}/inventory-requests/new`} className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:underline">
              <Plus className="w-4 h-4" />
              Tạo yêu cầu đầu tiên
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRequests.map((request, idx) => {
              const config = statusConfig[request.status] || statusConfig.PENDING
              const StatusIcon = config.icon
              const itemCount = request.totalItems || request.items?.length || 1
              const totalQty = request.totalQuantity || request.requestedQuantity || 0
              
              return (
                <motion.div 
                  key={request.id} 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: idx * 0.03 }} 
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/warehouses/${warehouseId}/inventory-requests/${request.id}`)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900">Yêu cầu #{request.id}</h4>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">{itemCount}</span> sản phẩm • 
                          Tổng SL: <span className="font-semibold text-gray-900">{totalQty}</span>
                        </p>
                        {request.sourceWarehouseName && (
                          <p className="text-xs text-indigo-600 mt-0.5">
                            Từ kho: {request.sourceWarehouseName}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span>Người tạo: {request.requesterName || 'N/A'}</span>
                          <span>•</span>
                          <span>{new Date(request.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1.5 ${config.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                      </div>

                      {/* Action buttons based on status */}
                      {request.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(request.id)} className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                            Duyệt
                          </button>
                          <button onClick={() => handleReject(request.id)} className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                            Từ chối
                          </button>
                        </div>
                      )}
                      {request.status === 'APPROVED' && (
                        <button onClick={() => handleStartShipping(request.id)} className="px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">
                          Đang vận chuyển
                        </button>
                      )}
                      {request.status === 'SHIPPING' && (
                        <button onClick={() => handleDelivered(request.id)} className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                          Đã giao hàng
                        </button>
                      )}

                      <Link href={`/admin/warehouses/${warehouseId}/inventory-requests/${request.id}`} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
