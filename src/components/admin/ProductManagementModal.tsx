'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload as UploadIcon, Loader2, Plus, ChevronDown, Check } from 'lucide-react'
import ProductAdminService from '@/services/productAdminService'
import ColorService from '@/services/colorService'
import WarrantyService from '@/services/warrantyService'
import { ProductDTO, Brand, Category, ProductRequest, Color, Warranty } from '@/types'
import toast from 'react-hot-toast'

interface ProductManagementModalProps {
  product: ProductDTO | null
  brands: Brand[]
  categories: Category[]
  onClose: () => void
  onSaved?: (product: ProductDTO) => void
}

export function ProductManagementModal({ product, brands, categories, onClose, onSaved }: ProductManagementModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProductRequest>({
    productName: '',
    briefDescription: '',
    fullDescription: '',
    technicalSpecifications: '',
    price: 0,
    imageURL: '',
    brandID: 0,
    categoryID: 0,
    powerWatt: undefined,
    bladeDiameterCm: undefined,
    colorDefault: '',
    warrantyMonths: undefined,
    colorIds: [],
    warrantyId: undefined
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [colors, setColors] = useState<Color[]>([])
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [displaySku, setDisplaySku] = useState<string>('')
  const [displaySlug, setDisplaySlug] = useState<string>('')
  const [showColorDropdown, setShowColorDropdown] = useState(false)
  const colorDropdownRef = useRef<HTMLDivElement>(null)

  const isEditMode = !!product

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setShowColorDropdown(false)
      }
    }
    if (showColorDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorDropdown])

  // Get selected colors
  const getSelectedColors = () => {
    return colors.filter(color => formData.colorIds?.includes(color.id))
  }

  // Toggle color selection
  const toggleColor = (colorId: number) => {
    const currentIds = formData.colorIds || []
    if (currentIds.includes(colorId)) {
      setFormData(prev => ({
        ...prev,
        colorIds: currentIds.filter(id => id !== colorId)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        colorIds: [...currentIds, colorId]
      }))
    }
  }

  // Remove color
  const removeColor = (colorId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const currentIds = formData.colorIds || []
    setFormData(prev => ({
      ...prev,
      colorIds: currentIds.filter(id => id !== colorId)
    }))
  }

  // Load colors and warranties
  const loadColorsAndWarranties = async () => {
    try {
      const [colorsData, warrantiesData] = await Promise.all([
        ColorService.getAllColors(),
        WarrantyService.getAllWarranties()
      ])
      setColors(colorsData)
      setWarranties(warrantiesData)
    } catch (error: any) {
      console.error('Failed to load colors/warranties:', error)
    }
  }

  useEffect(() => {
    loadColorsAndWarranties()
  }, [])

  // Listen for storage event to refresh when warranty is added in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'warrantyAdded' || e.key === 'warrantyUpdated' || e.key === 'colorAdded' || e.key === 'colorUpdated') {
        loadColorsAndWarranties()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    if (product) {
      // Try to get ProductDetail if available (has more fields)
      const productDetail = product as any
      setDisplaySku(productDetail.sku || '')
      setDisplaySlug(productDetail.slug || '')
      setFormData({
        productName: product.productName,
        briefDescription: product.briefDescription,
        fullDescription: productDetail.fullDescription || product.briefDescription,
        technicalSpecifications: productDetail.technicalSpecifications || '',
        price: product.price,
        imageURL: product.imageURL,
        brandID: product.brand?.brandID || 0,
        categoryID: product.category?.id || 0,
        powerWatt: productDetail.powerWatt || undefined,
        bladeDiameterCm: productDetail.bladeDiameterCm || undefined,
        colorDefault: productDetail.colorDefault || '',
        warrantyMonths: productDetail.warrantyMonths || undefined,
        colorIds: productDetail.colors?.map((c: Color) => c.id) || [],
        warrantyId: productDetail.warranty?.id || undefined
      })
    } else {
      // Reset form when not in edit mode
      setDisplaySku('')
      setDisplaySlug('')
      setFormData({
        productName: '',
        briefDescription: '',
        fullDescription: '',
        technicalSpecifications: '',
        price: 0,
        imageURL: '',
        brandID: 0,
        categoryID: 0,
        powerWatt: undefined,
        bladeDiameterCm: undefined,
        colorDefault: '',
        warrantyMonths: undefined,
        colorIds: [],
        warrantyId: undefined
      })
    }
  }, [product])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 10MB')
      return
    }

    setUploadingImage(true)
    try {
      const imageUrl = await ProductAdminService.uploadImage(file)
      setFormData(prev => ({ ...prev, imageURL: imageUrl }))
      toast.success('Tải ảnh thành công!')
    } catch (error: any) {
      console.error('Upload image error:', error)
      toast.error(error.message || 'Không thể tải ảnh lên')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.productName.trim() || !formData.briefDescription.trim() || !formData.price || !formData.brandID || !formData.categoryID) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    setLoading(true)
    try {
      // Validate required fields
      if (!formData.brandID || formData.brandID === 0) {
        toast.error('Vui lòng chọn thương hiệu')
        setLoading(false)
        return
      }
      
      // Prepare form data - remove empty optional fields
      const submitData: ProductRequest = {
        productName: formData.productName.trim(),
        briefDescription: formData.briefDescription.trim(),
        fullDescription: formData.fullDescription.trim() || formData.briefDescription.trim(),
        technicalSpecifications: formData.technicalSpecifications.trim() || '',
        price: formData.price,
        imageURL: formData.imageURL || '',
        brandID: formData.brandID,
        categoryID: formData.categoryID,
        // Only include optional fields if they have values
        // SKU and Slug are auto-generated, not sent in request
        ...(formData.powerWatt !== undefined && formData.powerWatt !== null && formData.powerWatt > 0 && { powerWatt: formData.powerWatt }),
        ...(formData.bladeDiameterCm !== undefined && formData.bladeDiameterCm !== null && formData.bladeDiameterCm > 0 && { bladeDiameterCm: formData.bladeDiameterCm }),
        ...(formData.colorDefault && formData.colorDefault.trim() && { colorDefault: formData.colorDefault.trim() }),
        ...(formData.warrantyMonths !== undefined && formData.warrantyMonths !== null && formData.warrantyMonths > 0 && { warrantyMonths: formData.warrantyMonths }),
        ...(formData.colorIds && formData.colorIds.length > 0 && { colorIds: formData.colorIds }),
        ...(formData.warrantyId && formData.warrantyId > 0 && { warrantyId: formData.warrantyId })
      }
      
      console.log('Submitting product data:', JSON.stringify(submitData, null, 2))

      if (isEditMode && product) {
        const productID = product.productID || product.id
        if (!productID) throw new Error('Không tìm thấy ID sản phẩm')
        await ProductAdminService.updateProduct(productID, submitData)
        toast.success('Cập nhật sản phẩm thành công!')
      } else {
        const created = await ProductAdminService.addProduct(submitData)
        if (created) {
          onSaved?.(created)
        }
        toast.success('Thêm sản phẩm thành công!')
      }
      onClose()
    } catch (error: any) {
      console.error('Error submitting product:', error)
      console.error('Error response:', error.response?.data)
      const errorMessage = error.message || error.response?.data?.message || `Không thể ${isEditMode ? 'cập nhật' : 'thêm'} sản phẩm`
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

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
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto">
            <form id="product-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh
              </label>
              <div className="flex items-start gap-4">
                {formData.imageURL && (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                    <img src={formData.imageURL} alt="Product" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    {uploadingImage ? (
                      <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                    ) : (
                      <UploadIcon className="w-8 h-8 mb-2 text-gray-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      {uploadingImage ? 'Đang tải...' : 'Nhấp để tải ảnh'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Brief Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả ngắn *
              </label>
              <textarea
                value={formData.briefDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, briefDescription: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Full Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                value={formData.fullDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Technical Specifications - Note: This will be auto-generated from technical fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông số kỹ thuật (tùy chọn - sẽ tự động tạo từ các thông số bên dưới)
              </label>
              <textarea
                value={formData.technicalSpecifications}
                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecifications: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Có thể để trống, thông số sẽ tự động tạo từ các field kỹ thuật bên dưới"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin kỹ thuật</h3>
            </div>

            {/* Grid: SKU, Slug - Read only */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* SKU - Read only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã SKU <span className="text-xs text-gray-500">(Tự động tạo)</span>
                </label>
                <input
                  type="text"
                  value={displaySku || 'Sẽ tự động tạo khi lưu'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Mã SKU sẽ tự động được tạo từ thương hiệu</p>
              </div>

              {/* Slug - Read only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (URL) <span className="text-xs text-gray-500">(Tự động tạo)</span>
                </label>
                <input
                  type="text"
                  value={displaySlug || 'Sẽ tự động tạo khi lưu'}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Slug sẽ tự động được tạo từ tên sản phẩm</p>
              </div>
            </div>

            {/* Grid: Power Watt, Blade Diameter */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Power Watt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Công suất (W)
                </label>
                <input
                  type="number"
                  value={formData.powerWatt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, powerWatt: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="VD: 60"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Blade Diameter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đường kính cánh quạt (cm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.bladeDiameterCm || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bladeDiameterCm: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="VD: 40.5"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Grid: Colors, Warranty */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Colors - Custom Dropdown */}
              <div className="relative" ref={colorDropdownRef}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Màu sắc
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newWindow = window.open('/admin/colors', '_blank')
                      // Polling để check khi window đóng và reload colors
                      const checkInterval = setInterval(() => {
                        if (newWindow?.closed) {
                          clearInterval(checkInterval)
                          loadColorsAndWarranties()
                          toast.success('Đã cập nhật danh sách màu sắc')
                        }
                      }, 1000)
                      toast.info('Mở trang quản lý màu sắc. Danh sách sẽ tự động cập nhật khi đóng tab.')
                    }}
                    className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm màu sắc
                  </button>
                </div>
                
                {/* Selected Colors Tags */}
                {getSelectedColors().length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {getSelectedColors().map((color) => (
                      <span
                        key={color.id}
                        className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                      >
                        {color.hexCode && (
                          <span
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: color.hexCode }}
                          />
                        )}
                        <span>{color.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeColor(color.id, e)
                          }}
                          className="hover:text-red-600 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Dropdown Button */}
                <div
                  onClick={() => setShowColorDropdown(!showColorDropdown)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-left flex items-center justify-between min-h-[42px] cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <span className="text-gray-500">
                    {getSelectedColors().length > 0 
                      ? `${getSelectedColors().length} màu đã chọn` 
                      : 'Chọn màu sắc...'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showColorDropdown ? 'transform rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showColorDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      <div className="py-1">
                        {colors.length > 0 ? (
                          colors.map((color) => {
                            const isSelected = formData.colorIds?.includes(color.id)
                            return (
                              <button
                                key={color.id}
                                type="button"
                                onClick={() => toggleColor(color.id)}
                                className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors ${
                                  isSelected ? 'bg-green-50' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  {color.hexCode && (
                                    <div
                                      className="w-5 h-5 rounded border border-gray-300 flex-shrink-0"
                                      style={{ backgroundColor: color.hexCode }}
                                    />
                                  )}
                                  <span className="text-gray-900">{color.name}</span>
                                  {color.hexCode && (
                                    <span className="text-gray-500 text-sm">({color.hexCode})</span>
                                  )}
                                </div>
                                {isSelected && (
                                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                              </button>
                            )
                          })
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 text-sm">
                            Không có màu sắc nào
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Warranty - Select */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bảo hành
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newWindow = window.open('/admin/warranties', '_blank')
                      // Polling để check khi window đóng và reload warranties
                      const checkInterval = setInterval(() => {
                        if (newWindow?.closed) {
                          clearInterval(checkInterval)
                          loadColorsAndWarranties()
                          toast.success('Đã cập nhật danh sách bảo hành')
                        }
                      }, 1000)
                      toast.info('Mở trang quản lý bảo hành. Danh sách sẽ tự động cập nhật khi đóng tab.')
                    }}
                    className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm bảo hành
                  </button>
                </div>
                <select
                  value={formData.warrantyId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, warrantyId: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Chọn bảo hành</option>
                  {warranties.map((warranty) => (
                    <option key={warranty.id} value={warranty.id}>
                      {warranty.name} ({warranty.durationMonths} tháng)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
            </div>

            {/* Grid: Price, Brand, Category */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                  min="0"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thương hiệu *
                </label>
                <select
                  value={formData.brandID}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandID: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.brandID} value={brand.brandID}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục *
                </label>
                <select
                  value={formData.categoryID}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryID: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            </form>
          </div>

          {/* Footer with buttons - sticky at bottom */}
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
              onClick={(e) => {
                e.preventDefault()
                const form = document.getElementById('product-form') as HTMLFormElement
                if (form) {
                  form.requestSubmit()
                }
              }}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isEditMode ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

