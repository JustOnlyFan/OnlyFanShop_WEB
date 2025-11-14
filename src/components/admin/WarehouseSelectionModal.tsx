'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Building2 } from 'lucide-react'
import { Warehouse } from '@/services/warehouseService'

interface WarehouseSelectionModalProps {
  isOpen: boolean
  warehouses: Warehouse[]
  selectedWarehouseIds: number[]
  onClose: () => void
  onConfirm: (warehouseIds: number[]) => void
}

export function WarehouseSelectionModal({
  isOpen,
  warehouses,
  selectedWarehouseIds,
  onClose,
  onConfirm
}: WarehouseSelectionModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(selectedWarehouseIds)

  const mainWarehouses = warehouses.filter(w => w.type === 'main')

  const toggleWarehouse = (warehouseId: number) => {
    setSelectedIds(prev => {
      if (prev.includes(warehouseId)) {
        return prev.filter(id => id !== warehouseId)
      } else {
        return [...prev, warehouseId]
      }
    })
  }

  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      return
    }
    onConfirm(selectedIds)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Building2 className="w-6 h-6 mr-2 text-indigo-600" />
                Chọn kho tổng
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Chọn một hoặc nhiều kho tổng để thêm sản phẩm ({selectedIds.length} đã chọn)
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {mainWarehouses.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Chưa có kho tổng nào</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mainWarehouses.map((warehouse) => {
                  const isSelected = selectedIds.includes(warehouse.id)
                  return (
                    <motion.div
                      key={warehouse.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => toggleWarehouse(warehouse.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-500'
                                : 'border-gray-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{warehouse.name}</h3>
                            <p className="text-sm text-gray-600">Mã: {warehouse.code}</p>
                            {warehouse.addressLine1 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {warehouse.addressLine1}, {warehouse.city}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Kho Tổng
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp tục ({selectedIds.length} kho)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}








