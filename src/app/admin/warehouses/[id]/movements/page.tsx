'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { WarehouseService, Warehouse, StockMovement } from '@/services/warehouseService'
import { motion } from 'framer-motion'
import { ArrowLeft, History, TrendingUp, TrendingDown, ArrowRight, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function WarehouseMovementsPage() {
  const router = useRouter()
  const params = useParams()
  const warehouseId = parseInt(params.id as string)
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
      router.push('/')
      return
    }
    loadData()
  }, [hasHydrated, isAuthenticated, user, router, warehouseId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [warehouseRes, movementsRes] = await Promise.all([
        WarehouseService.getWarehouseById(warehouseId).catch(err => {
          console.error('Error loading warehouse:', err)
          return { data: null }
        }),
        WarehouseService.getStockMovements(warehouseId).catch(err => {
          console.error('Error loading movements:', err)
          return { data: [] }
        })
      ])
      setWarehouse(warehouseRes.data)
      setMovements(movementsRes.data || [])
    } catch (error: any) {
      console.error('Error loading data:', error)
      if (error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.')
      } else {
        toast.error(error.message || 'Không thể tải dữ liệu')
      }
    } finally {
      setLoading(false)
    }
  }

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      import: 'Nhập kho',
      export: 'Xuất kho',
      adjustment: 'Điều chỉnh',
      transfer: 'Chuyển kho'
    }
    return labels[type] || type
  }

  const getMovementTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      import: 'bg-green-100 text-green-800',
      export: 'bg-red-100 text-red-800',
      adjustment: 'bg-yellow-100 text-yellow-800',
      transfer: 'bg-blue-100 text-blue-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'import':
        return <TrendingUp className="w-4 h-4" />
      case 'export':
        return <TrendingDown className="w-4 h-4" />
      case 'transfer':
        return <ArrowRight className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/warehouses" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <History className="w-8 h-8 mr-3 text-indigo-600" />
              Lịch sử xuất nhập: {warehouse?.name}
            </h1>
            <p className="text-gray-600 mt-1">Mã kho: {warehouse?.code}</p>
          </div>
        </div>

        {/* Movements Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chuyển từ/đến</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <motion.tr
                    key={movement.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(movement.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(movement.createdAt).toLocaleTimeString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getMovementTypeColor(movement.type)}`}>
                        {getMovementIcon(movement.type)}
                        <span className="ml-1">{getMovementTypeLabel(movement.type)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">ID: {movement.productId}</div>
                      {movement.productVariantId && (
                        <div className="text-xs text-gray-500">Variant: {movement.productVariantId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        movement.type === 'import' || movement.type === 'transfer' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {movement.type === 'export' ? '-' : '+'}{movement.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {movement.type === 'transfer' && (
                        <div className="text-sm text-gray-500">
                          {movement.fromWarehouseId && (
                            <div>Từ kho: {movement.fromWarehouseId}</div>
                          )}
                          {movement.toWarehouseId && (
                            <div>Đến kho: {movement.toWarehouseId}</div>
                          )}
                        </div>
                      )}
                      {movement.type !== 'transfer' && (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{movement.note || '-'}</div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {movements.length === 0 && (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có lịch sử xuất nhập</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

