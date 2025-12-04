'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload as UploadIcon, Loader2, Plus, ChevronDown, Check, Building2 } from 'lucide-react'
import ProductAdminService from '@/services/productAdminService'
import ColorService from '@/services/colorService'
import WarrantyService from '@/services/warrantyService'
import { WarehouseService, Warehouse } from '@/services/warehouseService'
import { ProductDTO, Brand, Category, ProductRequest, Color, Warranty } from '@/types'
import toast from 'react-hot-toast'

interface ProductManagementModalProps {
  product: ProductDTO | null
  brands: Brand[]
  categories: Category[]
  warehouseIds?: number[] // Optional: if provided, product will be added to these warehouses
  onClose: () => void
  onSaved?: (product: ProductDTO) => void
}

export function ProductManagementModal({ product, brands, categories, warehouseIds, onClose, onSaved }: ProductManagementModalProps) {
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
    warrantyId: undefined,
    quantity: 0,
    // Technical specifications
    voltage: undefined,
    windSpeedLevels: undefined,
    airflow: undefined,
    bladeMaterial: undefined,
    bodyMaterial: undefined,
    bladeCount: undefined,
    noiseLevel: undefined,
    motorSpeed: undefined,
    weight: undefined,
    adjustableHeight: undefined,
    // Features
    remoteControl: false,
    timer: undefined,
    naturalWindMode: false,
    sleepMode: false,
    oscillation: false,
    heightAdjustable: false,
    autoShutoff: false,
    temperatureSensor: false,
    energySaving: false,
    // Other information
    safetyStandards: undefined,
    manufacturingYear: undefined,
    accessories: undefined,
    energyRating: undefined
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [colors, setColors] = useState<Color[]>([])
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [displaySku, setDisplaySku] = useState<string>('')
  const [displaySlug, setDisplaySlug] = useState<string>('')
  const [showColorDropdown, setShowColorDropdown] = useState(false)
  const colorDropdownRef = useRef<HTMLDivElement>(null)
  const [mainWarehouses, setMainWarehouses] = useState<Warehouse[]>([])
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>(warehouseIds || [])

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
    if (!isEditMode) {
      loadMainWarehouses()
    }
  }, [isEditMode])

  // Load main warehouses for selection
  const loadMainWarehouses = async () => {
    try {
      const response = await WarehouseService.getMainWarehouses()
      setMainWarehouses(response.data || [])
    } catch (error: any) {
      console.error('Failed to load main warehouses:', error)
      setMainWarehouses([])
    }
  }

  // Toggle warehouse selection
  const toggleWarehouse = (warehouseId: number) => {
    setSelectedWarehouseIds(prev => {
      if (prev.includes(warehouseId)) {
        return prev.filter(id => id !== warehouseId)
      } else {
        return [...prev, warehouseId]
      }
    })
  }

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
        warrantyId: productDetail.warranty?.id || undefined,
        quantity: productDetail.quantity || 0,
        // Technical specifications
        voltage: productDetail.voltage || undefined,
        windSpeedLevels: productDetail.windSpeedLevels || undefined,
        airflow: productDetail.airflow || undefined,
        bladeMaterial: productDetail.bladeMaterial || undefined,
        bodyMaterial: productDetail.bodyMaterial || undefined,
        bladeCount: productDetail.bladeCount || undefined,
        noiseLevel: productDetail.noiseLevel || undefined,
        motorSpeed: productDetail.motorSpeed || undefined,
        weight: productDetail.weight || undefined,
        adjustableHeight: productDetail.adjustableHeight || undefined,
        // Features
        remoteControl: productDetail.remoteControl || false,
        timer: productDetail.timer || undefined,
        naturalWindMode: productDetail.naturalWindMode || false,
        sleepMode: productDetail.sleepMode || false,
        oscillation: productDetail.oscillation || false,
        heightAdjustable: productDetail.heightAdjustable || false,
        autoShutoff: productDetail.autoShutoff || false,
        temperatureSensor: productDetail.temperatureSensor || false,
        energySaving: productDetail.energySaving || false,
        // Other information
        safetyStandards: productDetail.safetyStandards || undefined,
        manufacturingYear: productDetail.manufacturingYear || undefined,
        accessories: productDetail.accessories || undefined,
        energyRating: productDetail.energyRating || undefined
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
        warrantyId: undefined,
        quantity: 0,
        // Technical specifications
        voltage: undefined,
        windSpeedLevels: undefined,
        airflow: undefined,
        bladeMaterial: undefined,
        bodyMaterial: undefined,
        bladeCount: undefined,
        noiseLevel: undefined,
        motorSpeed: undefined,
        weight: undefined,
        adjustableHeight: undefined,
        // Features
        remoteControl: false,
        timer: undefined,
        naturalWindMode: false,
        sleepMode: false,
        oscillation: false,
        heightAdjustable: false,
        autoShutoff: false,
        temperatureSensor: false,
        energySaving: false,
        // Other information
        safetyStandards: undefined,
        manufacturingYear: undefined,
        accessories: undefined,
        energyRating: undefined
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
        ...(formData.warrantyId && formData.warrantyId > 0 && { warrantyId: formData.warrantyId }),
        ...(formData.quantity !== undefined && formData.quantity !== null && formData.quantity >= 0 && { quantity: formData.quantity }),
        // Technical specifications
        ...(formData.voltage && { voltage: formData.voltage }),
        ...(formData.windSpeedLevels && { windSpeedLevels: formData.windSpeedLevels }),
        ...(formData.airflow !== undefined && formData.airflow !== null && formData.airflow > 0 && { airflow: formData.airflow }),
        ...(formData.bladeMaterial && { bladeMaterial: formData.bladeMaterial }),
        ...(formData.bodyMaterial && { bodyMaterial: formData.bodyMaterial }),
        ...(formData.bladeCount !== undefined && formData.bladeCount !== null && formData.bladeCount > 0 && { bladeCount: formData.bladeCount }),
        ...(formData.noiseLevel !== undefined && formData.noiseLevel !== null && formData.noiseLevel > 0 && { noiseLevel: formData.noiseLevel }),
        ...(formData.motorSpeed !== undefined && formData.motorSpeed !== null && formData.motorSpeed > 0 && { motorSpeed: formData.motorSpeed }),
        ...(formData.weight !== undefined && formData.weight !== null && formData.weight > 0 && { weight: formData.weight }),
        ...(formData.adjustableHeight && { adjustableHeight: formData.adjustableHeight }),
        // Features
        ...(formData.remoteControl !== undefined && { remoteControl: formData.remoteControl }),
        ...(formData.timer && { timer: formData.timer }),
        ...(formData.naturalWindMode !== undefined && { naturalWindMode: formData.naturalWindMode }),
        ...(formData.sleepMode !== undefined && { sleepMode: formData.sleepMode }),
        ...(formData.oscillation !== undefined && { oscillation: formData.oscillation }),
        ...(formData.heightAdjustable !== undefined && { heightAdjustable: formData.heightAdjustable }),
        ...(formData.autoShutoff !== undefined && { autoShutoff: formData.autoShutoff }),
        ...(formData.temperatureSensor !== undefined && { temperatureSensor: formData.temperatureSensor }),
        ...(formData.energySaving !== undefined && { energySaving: formData.energySaving }),
        // Other information
        ...(formData.safetyStandards && { safetyStandards: formData.safetyStandards }),
        ...(formData.manufacturingYear !== undefined && formData.manufacturingYear !== null && formData.manufacturingYear > 0 && { manufacturingYear: formData.manufacturingYear }),
        ...(formData.accessories && { accessories: formData.accessories }),
        ...(formData.energyRating && { energyRating: formData.energyRating }),
        // If selectedWarehouseIds provided, use first one for product creation (backend will add to that warehouse)
        // Then we'll add to other warehouses separately
        ...(selectedWarehouseIds && selectedWarehouseIds.length > 0 && { warehouseId: selectedWarehouseIds[0] })
      }
      
      console.log('Submitting product data:', JSON.stringify(submitData, null, 2))

      if (isEditMode && product) {
        const productID = product.productID || product.id
        if (!productID) throw new Error('Không tìm thấy ID sản phẩm')
        await ProductAdminService.updateProduct(productID, submitData)
        toast.success('Cập nhật sản phẩm thành công!')
      } else {
        // If multiple warehouses selected, store the first one separately
        const [primaryWarehouseId, ...extraWarehouseIds] = selectedWarehouseIds || []

        const primarySubmitData = {
          ...submitData,
          ...(primaryWarehouseId ? { warehouseId: primaryWarehouseId } : {})
        }

        const created = await ProductAdminService.addProduct(primarySubmitData)
        if (created) {
          const productId = created.id || created.productID
          
          // If multiple warehouses selected, add product to each warehouse
          if (extraWarehouseIds.length > 0 && productId && formData.quantity && formData.quantity > 0) {
            try {
              let successCount = 0
              let errorCount = 0
              
              for (const warehouseId of extraWarehouseIds) {
                try {
                  await WarehouseService.addProductToWarehouse({
                    warehouseId,
                    productId: Number(productId), // Ensure it's a number
                    quantity: formData.quantity,
                    note: 'Thêm sản phẩm mới vào kho tổng'
                  })
                  successCount++
                } catch (error: any) {
                  console.error(`Error adding product to warehouse ${warehouseId}:`, error)
                  errorCount++
                }
              }
              
              if (successCount > 0) {
                toast.success(`Đã thêm sản phẩm vào ${successCount + 1} kho tổng${errorCount > 0 ? ` (${errorCount} lỗi)` : ''}`)
              } else if (errorCount > 0) {
                toast.error('Sản phẩm đã được tạo nhưng có lỗi khi thêm vào các kho bổ sung')
              }
            } catch (error: any) {
              console.error('Error adding product to additional warehouses:', error)
              toast.error('Sản phẩm đã được tạo nhưng có lỗi khi thêm vào một số kho')
            }
          } else if (selectedWarehouseIds && selectedWarehouseIds.length === 1) {
            toast.success('Thêm sản phẩm thành công!')
          } else {
            toast.success('Thêm sản phẩm thành công!')
          }
          
          onSaved?.(created)
        }
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
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
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

            {/* Technical Specifications - Optional text field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông số kỹ thuật (mô tả thêm - tùy chọn)
              </label>
              <textarea
                value={formData.technicalSpecifications}
                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecifications: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập thêm các thông số kỹ thuật khác (nếu có)..."
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật cơ bản</h3>
            </div>

            {/* Grid: SKU, Slug - Read only */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
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

            {/* Grid: Power Watt, Blade Diameter, Quantity */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {/* Power Watt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Công suất (W)
                </label>
                <input
                  type="number"
                  value={formData.powerWatt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, powerWatt: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="VD: 45"
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
                  placeholder="VD: 40"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng sản phẩm
                </label>
                <input
                  type="number"
                  value={formData.quantity || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value ? Number(e.target.value) : 0 }))}
                  placeholder="VD: 100"
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
                      toast('Mở trang quản lý màu sắc. Danh sách sẽ tự động cập nhật khi đóng tab.', { icon: 'ℹ️' })
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
                      toast('Mở trang quản lý bảo hành. Danh sách sẽ tự động cập nhật khi đóng tab.', { icon: 'ℹ️' })
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

            {/* Thông số kỹ thuật chi tiết */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật chi tiết</h3>
              
              {/* Grid 1: Voltage, Wind Speed Levels, Airflow */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Điện áp sử dụng
                  </label>
                  <input
                    type="text"
                    value={formData.voltage || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, voltage: e.target.value }))}
                    placeholder="VD: 220V / 50Hz"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tốc độ gió
                  </label>
                  <input
                    type="text"
                    value={formData.windSpeedLevels || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, windSpeedLevels: e.target.value }))}
                    placeholder="VD: 3 mức (thấp/trung bình/cao)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lưu lượng gió (m³/phút)
                  </label>
                  <input
                    type="number"
                    value={formData.airflow || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, airflow: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="VD: 65"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Grid 2: Blade Material, Body Material, Blade Count */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chất liệu cánh quạt
                  </label>
                  <input
                    type="text"
                    value={formData.bladeMaterial || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bladeMaterial: e.target.value }))}
                    placeholder="VD: Nhựa ABS"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chất liệu thân quạt
                  </label>
                  <input
                    type="text"
                    value={formData.bodyMaterial || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bodyMaterial: e.target.value }))}
                    placeholder="VD: Nhựa cao cấp"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng cánh
                  </label>
                  <input
                    type="number"
                    value={formData.bladeCount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bladeCount: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="VD: 3 hoặc 5"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Grid 3: Noise Level, Motor Speed, Weight */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức độ ồn (dB)
                  </label>
                  <input
                    type="number"
                    value={formData.noiseLevel || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, noiseLevel: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="VD: 55"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tốc độ quay motor (vòng/phút)
                  </label>
                  <input
                    type="number"
                    value={formData.motorSpeed || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, motorSpeed: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="VD: 1200"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trọng lượng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="VD: 6.5"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Grid 4: Adjustable Height */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chiều cao điều chỉnh
                  </label>
                  <input
                    type="text"
                    value={formData.adjustableHeight || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, adjustableHeight: e.target.value }))}
                    placeholder="VD: 1.1 – 1.4 m"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Tính năng & tiện ích */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng & tiện ích</h3>
              
              {/* Features Grid - Checkboxes */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remoteControl || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, remoteControl: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Điều khiển từ xa</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.naturalWindMode || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, naturalWindMode: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Chế độ gió tự nhiên</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sleepMode || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, sleepMode: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Chế độ ngủ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.oscillation || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, oscillation: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Đảo chiều gió</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.heightAdjustable || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, heightAdjustable: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Điều chỉnh độ cao</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoShutoff || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoShutoff: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Ngắt điện tự động</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.temperatureSensor || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperatureSensor: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Cảm biến nhiệt</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.energySaving || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, energySaving: e.target.checked }))}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Tiết kiệm điện</span>
                </label>
              </div>

              {/* Timer */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hẹn giờ tắt
                </label>
                <input
                  type="text"
                  value={formData.timer || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, timer: e.target.value }))}
                  placeholder="VD: 1 – 4 giờ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Thông tin khác */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khác</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu chuẩn an toàn
                  </label>
                  <input
                    type="text"
                    value={formData.safetyStandards || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, safetyStandards: e.target.value }))}
                    placeholder="VD: TCVN / IEC / RoHS"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm sản xuất
                  </label>
                  <input
                    type="number"
                    value={formData.manufacturingYear || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturingYear: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="VD: 2025"
                    min="2000"
                    max="2100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phụ kiện đi kèm
                  </label>
                  <textarea
                    value={formData.accessories || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessories: e.target.value }))}
                    placeholder="VD: Điều khiển / Pin / HDSD"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức tiết kiệm điện năng
                  </label>
                  <input
                    type="text"
                    value={formData.energyRating || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, energyRating: e.target.value }))}
                    placeholder="VD: 5 sao"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Warehouse Selection - Only show when adding new product */}
            {!isEditMode && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                  Chọn kho để thêm sản phẩm
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Chọn một hoặc nhiều kho tổng để thêm sản phẩm vào ({selectedWarehouseIds.length} đã chọn)
                </p>
                {mainWarehouses.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 text-sm">Chưa có kho tổng nào. Vui lòng tạo kho tổng trước.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mainWarehouses.map((warehouse) => {
                      const isSelected = selectedWarehouseIds.includes(warehouse.id)
                      return (
                        <motion.div
                          key={warehouse.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => toggleWarehouse(warehouse.id)}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'border-indigo-500 bg-indigo-500'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 text-sm">{warehouse.name}</h4>
                                <p className="text-xs text-gray-600">Mã: {warehouse.code}</p>
                                {warehouse.addressLine1 && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {warehouse.addressLine1}, {warehouse.city}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex-shrink-0">
                              Kho Tổng
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

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

