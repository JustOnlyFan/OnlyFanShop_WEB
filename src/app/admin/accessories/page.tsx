'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Package, Filter } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'
import toast from 'react-hot-toast'

interface Accessory {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  categoryName: string
  compatibleFansCount: number
  status: 'active' | 'inactive'
  imageUrl?: string
}

export default function AccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const { language } = useLanguageStore()

  useEffect(() => {
    fetchAccessories()
  }, [])

  const fetchAccessories = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await AccessoryService.getAll()
      // setAccessories(response)
      setAccessories([])
    } catch (error) {
      toast.error('Không thể tải danh sách phụ kiện')
    } finally {
      setLoading(false)
    }
  }

  const filteredAccessories = accessories.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'vi' ? 'Quản lý Phụ kiện' : 'Accessories Management'}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === 'vi' ? 'Quản lý cánh quạt, lồng quạt, linh kiện sửa chữa' : 'Manage fan blades, cages, repair parts'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="w-5 h-5" />
          {language === 'vi' ? 'Thêm phụ kiện' : 'Add Accessory'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'vi' ? 'Tìm kiếm phụ kiện...' : 'Search accessories...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{language === 'vi' ? 'Tất cả loại' : 'All Types'}</option>
            <option value="blades">{language === 'vi' ? 'Cánh quạt' : 'Fan Blades'}</option>
            <option value="cages">{language === 'vi' ? 'Lồng quạt' : 'Fan Cages'}</option>
            <option value="motors">{language === 'vi' ? 'Motor' : 'Motors'}</option>
            <option value="electronics">{language === 'vi' ? 'Linh kiện điện' : 'Electronics'}</option>
            <option value="controls">{language === 'vi' ? 'Điều khiển' : 'Controls'}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {language === 'vi' ? 'Phụ kiện' : 'Accessory'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {language === 'vi' ? 'Loại' : 'Type'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {language === 'vi' ? 'Giá' : 'Price'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {language === 'vi' ? 'Tồn kho' : 'Stock'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {language === 'vi' ? 'Tương thích' : 'Compatible'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {language === 'vi' ? 'Trạng thái' : 'Status'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {language === 'vi' ? 'Thao tác' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                  </td>
                </tr>
              ) : filteredAccessories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {language === 'vi' ? 'Không tìm thấy phụ kiện' : 'No accessories found'}
                  </td>
                </tr>
              ) : (
                filteredAccessories.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="font-medium text-gray-900">{acc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{acc.sku}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {acc.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{formatPrice(acc.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${acc.stock < 20 ? 'text-red-600' : 'text-gray-900'}`}>
                        {acc.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-primary-600 font-medium">{acc.compatibleFansCount} quạt</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        acc.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {acc.status === 'active' 
                          ? (language === 'vi' ? 'Hoạt động' : 'Active')
                          : (language === 'vi' ? 'Ngừng bán' : 'Inactive')
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
