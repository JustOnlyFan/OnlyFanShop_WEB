'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Clock, CheckCircle, Truck, PackageCheck, XCircle, User, Warehouse as WarehouseIcon, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { InventoryRequestService, InventoryRequest, InventoryRequestItem } from '@/services/inventoryRequestService'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  APPROVED: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  SHIPPING: { label: 'Đang vận chuyển', color: 'bg-purple-100 text-purple-700', icon: Truck },
  DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700', icon: PackageCheck },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
  CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700', icon: XCircle },
}

export default function WarehouseInventoryRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const warehouseId = Number(params.id)
  const requestId = Number(params.requestId)
  const { user, isAuthenticated, hasHydrated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [warehouse, setWarehouse] = useState<StoreLocation | null>(null)
  const [request, setRequest] = useState<InventoryRequest | null>(null)

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') return
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, isAuthenticated, user?.role, warehouseId, requestId])

  const loadData = async () => {
    try {
      setLoading(true)
      const storeResp = await StoreLocationService.getStoreLocations()
      const stores = Array.isArray(storeResp.data) ? storeResp.data : (storeResp.data?.stores || [])
      const found = stores.find((s: any) => (s.id ?? s.locationID) === warehouseId)
      if (found) {
        setWarehouse({ ...found, id: found.id ?? found.locationID })
      }
      
      const resp = await InventoryRequestService.getRequest(requestId)
      setRequest(resp.data)
    } catch (e: any) {
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }


  const handleApprove = async () => {
    if (!request) return
    try {
      await InventoryRequestService.approveRequest(request.id, {
        approvedQuantity: request.requestedQuantity || 0,
        adminNote: ''
      })
      toast.success('Đã duyệt yêu cầu')
      loadData()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể duyệt')
    }
  }

  const handleReject = async () => {
    if (!request) return
    try {
      await InventoryRequestService.rejectRequest(request.id, { adminNote: '' })
      toast.success('Đã từ chối yêu cầu')
      loadData()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể từ chối')
    }
  }

  const handleStartShipping = async () => {
    if (!request) return
    try {
      await InventoryRequestService.startShipping(request.id)
      toast.success('Đã chuyển sang trạng thái vận chuyển')
      loadData()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể cập nhật')
    }
  }

  const handleDelivered = async () => {
    if (!request) return
    try {
      await InventoryRequestService.completeDelivery(request.id)
      toast.success('Đã giao hàng - Số lượng kho đã được cập nhật')
      loadData()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể cập nhật')
    }
  }

  if (!hasHydrated || loading) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  if (!request) {
    return <div className="min-h-[60vh] grid place-items-center text-gray-500">Không tìm thấy yêu cầu</div>
  }

  const config = statusConfig[request.status] || statusConfig.PENDING
  const StatusIcon = config.icon
  const items: InventoryRequestItem[] = request.items || (request.productId ? [{
    productId: request.productId,
    productName: request.productName,
    productImageUrl: request.productImageUrl,
    requestedQuantity: request.requestedQuantity || 0,
    approvedQuantity: request.approvedQuantity
  }] : [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/warehouses" className="text-gray-500 hover:text-indigo-600 transition-colors">Kho hàng</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">{warehouse?.name || 'Chi tiết'}</span>
        <span className="text-gray-400">/</span>
        <Link href={`/admin/warehouses/${warehouseId}/inventory-requests`} className="text-gray-500 hover:text-indigo-600 transition-colors">Yêu cầu nhập hàng</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">#{request.id}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yêu cầu #{request.id}</h1>
            <p className="text-sm text-gray-500">{warehouse?.name}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2 ${config.color}`}>
          <StatusIcon className="w-5 h-5" />
          {config.label}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Danh sách sản phẩm ({items.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <motion.div key={item.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.productImageUrl ? (
                      <Image src={item.productImageUrl} alt="" width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{item.productName || `Sản phẩm #${item.productId}`}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="text-gray-500">Yêu cầu: <span className="font-semibold text-gray-900">{item.requestedQuantity}</span></span>
                      {item.approvedQuantity !== undefined && item.approvedQuantity !== null && (
                        <span className="text-green-600">Duyệt: <span className="font-semibold">{item.approvedQuantity}</span></span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {(request.requestNote || request.adminNote) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              {request.requestNote && (<div><p className="text-sm font-medium text-gray-500 mb-1">Ghi chú từ kho</p><p className="text-gray-900">{request.requestNote}</p></div>)}
              {request.adminNote && (<div><p className="text-sm font-medium text-gray-500 mb-1">Ghi chú từ admin</p><p className="text-gray-900">{request.adminNote}</p></div>)}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Thông tin</h3>
            
            {/* Source Warehouse Info - Requirements: 3.1 */}
            {(request.sourceWarehouseId || request.sourceWarehouseName) && (
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <WarehouseIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">Kho nguồn</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {request.sourceWarehouseName || `Kho #${request.sourceWarehouseId}`}
                </p>
              </div>
            )}

            {/* Transfer Direction Indicator */}
            {request.sourceWarehouseName && warehouse && (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-600">
                <span className="font-medium">{request.sourceWarehouseName}</span>
                <ArrowRight className="w-4 h-4 text-indigo-500" />
                <span className="font-medium">{warehouse.name}</span>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><User className="w-4 h-4 text-gray-400" /><div><p className="text-gray-500">Người tạo</p><p className="font-medium text-gray-900">{request.requesterName || 'N/A'}</p></div></div>
              <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-gray-400" /><div><p className="text-gray-500">Ngày tạo</p><p className="font-medium text-gray-900">{new Date(request.createdAt).toLocaleString('vi-VN')}</p></div></div>
              {request.approverName && (<div className="flex items-center gap-3"><CheckCircle className="w-4 h-4 text-gray-400" /><div><p className="text-gray-500">Người duyệt</p><p className="font-medium text-gray-900">{request.approverName}</p></div></div>)}
              {request.approvedAt && (<div className="flex items-center gap-3"><Clock className="w-4 h-4 text-gray-400" /><div><p className="text-gray-500">Ngày duyệt</p><p className="font-medium text-gray-900">{new Date(request.approvedAt).toLocaleString('vi-VN')}</p></div></div>)}
              {request.completedAt && (<div className="flex items-center gap-3"><PackageCheck className="w-4 h-4 text-gray-400" /><div><p className="text-gray-500">Ngày hoàn thành</p><p className="font-medium text-gray-900">{new Date(request.completedAt).toLocaleString('vi-VN')}</p></div></div>)}
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Tổng sản phẩm</span><span className="font-semibold text-gray-900">{items.length} loại</span></div>
              <div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Tổng số lượng</span><span className="font-semibold text-gray-900">{items.reduce((sum, i) => sum + i.requestedQuantity, 0)}</span></div>
            </div>
          </div>

          {request.status === 'PENDING' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <button onClick={handleApprove} className="w-full py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">Duyệt yêu cầu</button>
              <button onClick={handleReject} className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors">Từ chối</button>
            </div>
          )}
          {request.status === 'APPROVED' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <button onClick={handleStartShipping} className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">Bắt đầu vận chuyển</button>
            </div>
          )}
          {request.status === 'SHIPPING' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <button onClick={handleDelivered} className="w-full py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">Xác nhận đã giao hàng</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
