'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Link2, Fan, Package, Check, X } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'
import toast from 'react-hot-toast'

interface Compatibility {
  id: number
  accessoryId: number
  accessoryName: string
  accessorySku: string
  fanId: number
  fanName: string
  fanSku: string
  compatibilityLevel: 'perfect' | 'compatible' | 'partial'
  notes?: string
}

interface Fan {
  id: number
  name: string
  sku: string
}

interface Accessory {
  id: number
  name: string
  sku: string
}

export default function AccessoryCompatibilityPage() {
  const [compatibilities, setCompatibilities] = useState<Compatibility[]>([])
  const [fans, setFans] = useState<Fan[]>([])
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedAccessory, setSelectedAccessory] = useState<number | null>(null)
  const [selectedFan, setSelectedFan] = useState<number | null>(null)
  const { language } = useLanguageStore()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls when backend is ready
      // const [compatData, fansData, accessoriesData] = await Promise.all([
      //   AccessoryCompatibilityService.getAll(),
      //   ProductService.getFans(),
      //   ProductService.getAccessories()
      // ])
      setCompatibilities([])
      setFans([])
      setAccessories([])
    } catch (error) {
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = compatibilities.filter(c => 
    c.accessoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fanName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group by accessory
  const groupedByAccessory = accessories.map(acc => ({
    ...acc,
    compatibleFans: compatibilities.filter(c => c.accessoryId === acc.id)
  }))

  const getCompatibilityBadge = (level: string) => {
    switch (level) {
      case 'perfect':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Hoàn hảo</span>
      case 'compatible':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Tương thích</span>
      case 'partial':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Một phần</span>
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'vi' ? 'Tương thích Phụ kiện - Quạt' : 'Accessory-Fan Compatibility'}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === 'vi' ? 'Quản lý phụ kiện nào phù hợp với quạt nào' : 'Manage which accessories fit which fans'}
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {language === 'vi' ? 'Thêm tương thích' : 'Add Compatibility'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={language === 'vi' ? 'Tìm kiếm phụ kiện hoặc quạt...' : 'Search accessory or fan...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Compatibility Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            {language === 'vi' ? 'Đang tải...' : 'Loading...'}
          </div>
        ) : groupedByAccessory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">{language === 'vi' ? 'Chưa có dữ liệu tương thích' : 'No compatibility data yet'}</p>
          </div>
        ) : (
          groupedByAccessory.map((acc) => (
            <div key={acc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{acc.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {acc.sku}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {acc.compatibleFans.length} {language === 'vi' ? 'quạt tương thích' : 'compatible fans'}
                  </span>
                </div>
              </div>
              
              {acc.compatibleFans.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {acc.compatibleFans.map((comp) => (
                    <div key={comp.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <div className="flex items-center gap-2">
                          <Fan className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-900">{comp.fanName}</span>
                          <span className="text-gray-400 text-sm">({comp.fanSku})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getCompatibilityBadge(comp.compatibilityLevel)}
                        {comp.notes && (
                          <span className="text-sm text-gray-500 italic">{comp.notes}</span>
                        )}
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {language === 'vi' ? 'Chưa có quạt tương thích' : 'No compatible fans yet'}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {language === 'vi' ? 'Thêm tương thích mới' : 'Add New Compatibility'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'vi' ? 'Chọn phụ kiện' : 'Select Accessory'}
                </label>
                <select 
                  value={selectedAccessory || ''}
                  onChange={(e) => setSelectedAccessory(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{language === 'vi' ? '-- Chọn phụ kiện --' : '-- Select --'}</option>
                  {accessories.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.sku})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'vi' ? 'Chọn quạt' : 'Select Fan'}
                </label>
                <select 
                  value={selectedFan || ''}
                  onChange={(e) => setSelectedFan(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{language === 'vi' ? '-- Chọn quạt --' : '-- Select --'}</option>
                  {fans.map(fan => (
                    <option key={fan.id} value={fan.id}>{fan.name} ({fan.sku})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'vi' ? 'Mức độ tương thích' : 'Compatibility Level'}
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                  <option value="perfect">{language === 'vi' ? 'Hoàn hảo - Phù hợp 100%' : 'Perfect - 100% fit'}</option>
                  <option value="compatible">{language === 'vi' ? 'Tương thích - Có thể sử dụng' : 'Compatible - Can be used'}</option>
                  <option value="partial">{language === 'vi' ? 'Một phần - Cần điều chỉnh' : 'Partial - Needs adjustment'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'vi' ? 'Ghi chú' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={language === 'vi' ? 'Ghi chú thêm về tương thích...' : 'Additional notes...'}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                {language === 'vi' ? 'Thêm' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
