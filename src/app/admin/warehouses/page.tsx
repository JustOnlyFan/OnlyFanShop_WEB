'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { WarehouseService, Warehouse, CreateWarehouseRequest } from '@/services/warehouseService'
import { StoreLocationService } from '@/services/storeLocationService'
import { AddressService } from '@/services/addressService'
import { VietnamProvince, VietnamWard } from '@/types'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Package, Building2, Warehouse as WarehouseIcon, ArrowLeft, MapPin, ArrowRight, History } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ProductManagementModal } from '@/components/admin/ProductManagementModal'
import { ProductService } from '@/services/productService'
import { Brand, Category } from '@/types'

export default function AdminWarehousesPage() {
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [storeLocations, setStoreLocations] = useState<any[]>([])
  const [provinces, setProvinces] = useState<VietnamProvince[]>([])
  const [wards, setWards] = useState<VietnamWard[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'main' | 'regional' | 'branch'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<CreateWarehouseRequest>({
    name: '',
    code: '',
    type: 'main',
    addressLine1: '',
    ward: '',
    district: '',
    city: '',
    country: 'Vietnam',
    phone: ''
  })

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadData()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadWarehouses(), loadStoreLocations(), loadProvinces(), loadBrandsAndCategories()])
    } finally {
      setLoading(false)
    }
  }

  const loadBrandsAndCategories = async () => {
    try {
      const [brandsResponse, categoriesResponse] = await Promise.all([
        ProductService.getBrands().catch(() => ({ data: [] })),
        ProductService.getCategories().catch(() => ({ data: [] }))
      ])
      setBrands(Array.isArray(brandsResponse?.data) ? brandsResponse.data : [])
      setCategories(Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : [])
    } catch (error: any) {
      console.error('Failed to load brands/categories:', error)
      setBrands([])
      setCategories([])
    }
  }

  const loadProvinces = async () => {
    try {
      const data = await AddressService.getProvinces()
      setProvinces(data)
    } catch (error: any) {
      console.error('Failed to load provinces:', error)
      toast.error('Không thể tải danh sách tỉnh/thành phố')
    }
  }

  const loadWardsForProvince = async (provinceName: string) => {
    try {
      if (!provinceName) {
        setWards([])
        return
      }
      const province = provinces.find(p => p.name === provinceName)
      if (!province) {
        // Try to find by code if name doesn't match
        const provinceByCode = provinces.find(p => p.code.toString() === provinceName)
        if (!provinceByCode) {
          setWards([])
          return
        }
        const provinceData = await AddressService.getProvinceWithWards(provinceByCode.code)
        setWards(provinceData.wards || [])
        return
      }
      const provinceData = await AddressService.getProvinceWithWards(province.code)
      setWards(provinceData.wards || [])
    } catch (error: any) {
      console.error('Failed to load wards:', error)
      toast.error('Không thể tải danh sách phường/xã')
      setWards([])
    }
  }

  const loadWarehouses = async () => {
    try {
      const response = await WarehouseService.getAllWarehouses()
      setWarehouses(response.data || [])
    } catch (error: any) {
      console.error('Error loading warehouses:', error)
      // Don't show error toast if backend is not running (connection refused)
      if (error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.')
      } else {
        toast.error(error.message || 'Không thể tải danh sách kho')
      }
      setWarehouses([]) // Set empty array on error
    }
  }

  const loadStoreLocations = async () => {
    try {
      const response = await StoreLocationService.getStoreLocations()
      setStoreLocations(Array.isArray(response.data) ? response.data : [])
    } catch (error: any) {
      console.error('Failed to load store locations:', error)
      // Don't show error toast, just log it - store locations are optional for warehouse creation
      setStoreLocations([])
    }
  }

  const filteredWarehouses = warehouses.filter(wh => {
    const matchesSearch = wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || wh.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleAdd = () => {
    setEditingWarehouse(null)
    setFormData({
      name: '',
      code: '',
      type: 'main',
      addressLine1: '',
      ward: '',
      district: '', // No longer used, but keep for backward compatibility
      city: '',
      country: 'Vietnam',
      phone: ''
    })
    setShowModal(true)
  }

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      type: warehouse.type,
      parentWarehouseId: warehouse.parentWarehouseId,
      storeLocationId: warehouse.storeLocationId,
      addressLine1: warehouse.addressLine1 || '',
      addressLine2: warehouse.addressLine2 || '',
      ward: warehouse.ward || '',
      district: '', // No longer used
      city: warehouse.city || '',
      country: warehouse.country || 'Vietnam',
      phone: warehouse.phone || ''
    })
    // Load wards if city is selected
    if (warehouse.city) {
      loadWardsForProvince(warehouse.city)
    }
    setShowModal(true)
  }

  const handleDelete = async (warehouse: Warehouse) => {
    if (!confirm(`Xóa kho "${warehouse.name}"?`)) return
    try {
      await WarehouseService.deleteWarehouse(warehouse.id)
      toast.success('Đã xóa kho')
      loadWarehouses()
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa kho')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingWarehouse) {
        await WarehouseService.updateWarehouse(editingWarehouse.id, formData)
        toast.success('Cập nhật kho thành công')
      } else {
        await WarehouseService.createWarehouse(formData)
        toast.success('Tạo kho thành công')
      }
      setShowModal(false)
      loadWarehouses()
    } catch (error: any) {
      toast.error(error.message || 'Không thể lưu kho')
    }
  }

  const mainWarehouses = warehouses.filter(w => w.type === 'main')
  const regionalWarehouses = warehouses.filter(w => w.type === 'regional')
  const branchWarehouses = warehouses.filter(w => w.type === 'branch')

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
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <WarehouseIcon className="w-8 h-8 mr-3 text-indigo-600" />
                Quản lý kho hàng
              </h1>
              <p className="text-gray-600 mt-1">Quản lý hệ thống kho hàng phân cấp</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <Package className="w-5 h-5 mr-2" />
                Thêm sản phẩm
              </button>
              <Link
                href="/admin/warehouses/transfer"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Chuyển kho
              </Link>
              <button
                onClick={handleAdd}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Thêm kho
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Tổng số kho</p>
                <p className="text-2xl font-bold text-gray-900">{warehouses.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Kho Tổng</p>
                <p className="text-2xl font-bold text-blue-600">{mainWarehouses.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Kho Khu Vực</p>
                <p className="text-2xl font-bold text-green-600">{regionalWarehouses.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Kho Chi Nhánh</p>
                <p className="text-2xl font-bold text-purple-600">{branchWarehouses.length}</p>
              </div>
              <WarehouseIcon className="w-8 h-8 text-purple-500" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm kho..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">Tất cả loại</option>
                <option value="main">Kho Tổng</option>
                <option value="regional">Kho Khu Vực</option>
                <option value="branch">Kho Chi Nhánh</option>
              </select>
            </div>
          </div>
        </div>

        {/* Warehouse List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã kho</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên kho</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kho cha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWarehouses.map((warehouse) => (
                  <motion.tr
                    key={warehouse.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{warehouse.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/warehouses/${warehouse.id}/inventory`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                      >
                        {warehouse.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${WarehouseService.getWarehouseTypeColor(warehouse.type)}`}>
                        {WarehouseService.getWarehouseTypeLabel(warehouse.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{warehouse.parentWarehouseName || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {warehouse.addressLine1 && (
                          <div>{warehouse.addressLine1}</div>
                        )}
                        {warehouse.city && (
                          <div className="text-xs text-gray-400">{warehouse.city}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${warehouse.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {warehouse.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/warehouses/${warehouse.id}/inventory`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Xem tồn kho"
                        >
                          <Package className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/warehouses/${warehouse.id}/movements`}
                          className="text-purple-600 hover:text-purple-900"
                          title="Xem lịch sử"
                        >
                          <History className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEdit(warehouse)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(warehouse)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingWarehouse ? 'Chỉnh sửa kho' : 'Thêm kho mới'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên kho *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã kho *</label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại kho *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any, parentWarehouseId: undefined, storeLocationId: undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="main">Kho Tổng</option>
                      <option value="regional">Kho Khu Vực</option>
                      <option value="branch">Kho Chi Nhánh</option>
                    </select>
                  </div>
                  {formData.type === 'regional' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kho Tổng (Kho cha)</label>
                      <select
                        value={formData.parentWarehouseId || ''}
                        onChange={(e) => setFormData({ ...formData, parentWarehouseId: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Chọn kho tổng</option>
                        {mainWarehouses.map(wh => (
                          <option key={wh.id} value={wh.id}>{wh.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.type === 'branch' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kho Khu Vực (Kho cha)</label>
                        <select
                          value={formData.parentWarehouseId || ''}
                          onChange={(e) => setFormData({ ...formData, parentWarehouseId: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Chọn kho khu vực</option>
                          {regionalWarehouses.map(wh => (
                            <option key={wh.id} value={wh.id}>{wh.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                        <select
                          value={formData.storeLocationId || ''}
                          onChange={(e) => setFormData({ ...formData, storeLocationId: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Chọn cửa hàng</option>
                          {storeLocations.map(sl => (
                            <option key={sl.locationID || sl.id} value={sl.locationID || sl.id}>{sl.name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
                      <select
                        value={formData.city}
                        onChange={(e) => {
                          setFormData({ ...formData, city: e.target.value, ward: '' })
                          if (e.target.value) {
                            loadWardsForProvince(e.target.value)
                          } else {
                            setWards([])
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
                      <select
                        value={formData.ward}
                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                        disabled={!formData.city || wards.length === 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map((w) => (
                          <option key={w.code} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      {editingWarehouse ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Product Management Modal (add new product) */}
        {showProductModal && (
          <ProductManagementModal
            product={null}
            brands={brands}
            categories={categories}
            onClose={() => setShowProductModal(false)}
            onSaved={() => {
              setShowProductModal(false)
              toast.success('Thêm sản phẩm thành công')
            }}
          />
        )}

      </div>
    </div>
  )
}

