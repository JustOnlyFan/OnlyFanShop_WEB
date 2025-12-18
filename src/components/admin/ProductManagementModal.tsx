'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload as UploadIcon, Loader2, Plus, ChevronDown, Check, Trash2, Link2 } from 'lucide-react'
import ProductAdminService from '@/services/productAdminService'
import ColorService from '@/services/colorService'
import WarrantyService from '@/services/warrantyService'
import CategoryService from '@/services/categoryService'
import TagService from '@/services/tagService'
import AccessoryCompatibilityService from '@/services/accessoryCompatibilityService'
import { 
  ProductDTO, Brand, Category, ProductRequest, Color, Warranty, 
  CategoryDTO, CategoryType, TagDTO, AccessoryCompatibilityDTO 
} from '@/types'
import toast from 'react-hot-toast'
import { CategoryTreeSelector } from './CategoryTreeSelector'

// Category type labels in Vietnamese
const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  [CategoryType.FAN_TYPE]: 'Loại quạt',
  [CategoryType.SPACE]: 'Không gian',
  [CategoryType.PURPOSE]: 'Mục đích',
  [CategoryType.TECHNOLOGY]: 'Công nghệ',
  [CategoryType.PRICE_RANGE]: 'Khoảng giá',
  [CategoryType.CUSTOMER_TYPE]: 'Đối tượng',
  [CategoryType.STATUS]: 'Tình trạng',
  [CategoryType.ACCESSORY_TYPE]: 'Loại phụ kiện',
  [CategoryType.ACCESSORY_FUNCTION]: 'Chức năng phụ kiện'
}

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
    warrantyId: undefined,
    quantity: 0,
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
    timer: undefined,
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

  // New states for expanded category system
  const [categoriesByType, setCategoriesByType] = useState<Record<CategoryType, CategoryDTO[]>>({} as Record<CategoryType, CategoryDTO[]>)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [tags, setTags] = useState<TagDTO[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const tagDropdownRef = useRef<HTMLDivElement>(null)
  
  // Accessory compatibility states
  const [isAccessoryProduct, setIsAccessoryProduct] = useState(false)
  const [compatibilities, setCompatibilities] = useState<Partial<AccessoryCompatibilityDTO>[]>([])
  const [fanTypeCategories, setFanTypeCategories] = useState<CategoryDTO[]>([])

  const isEditMode = !!product

  // Format number với dấu chấm phân cách hàng nghìn (VND)
  const formatVND = (value: number | undefined | null): string => {
    if (value === undefined || value === null || value === 0) return ''
    return value.toLocaleString('vi-VN')
  }

  // Parse số từ string có format VND
  const parseVND = (value: string): number => {
    const numericValue = value.replace(/[^\d]/g, '')
    return numericValue ? parseInt(numericValue, 10) : 0
  }

  // Handle input change cho số có format VND
  const handleNumberChange = (field: keyof ProductRequest, value: string) => {
    const numericValue = parseVND(value)
    setFormData(prev => ({ ...prev, [field]: numericValue }))
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setShowColorDropdown(false)
      }
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false)
      }
    }
    if (showColorDropdown || showTagDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorDropdown, showTagDropdown])

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

  // Get selected tags
  const getSelectedTags = () => {
    return tags.filter(tag => selectedTagIds.includes(tag.id))
  }

  // Toggle tag selection
  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(prev => prev.filter(id => id !== tagId))
    } else {
      setSelectedTagIds(prev => [...prev, tagId])
    }
  }

  // Remove tag
  const removeTag = (tagId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedTagIds(prev => prev.filter(id => id !== tagId))
  }

  // Toggle category selection
  const toggleCategory = (categoryId: number, categoryType: CategoryType) => {
    if (selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId))
    } else {
      setSelectedCategoryIds(prev => [...prev, categoryId])
    }
    
    // Check if this is an accessory type category
    if (categoryType === CategoryType.ACCESSORY_TYPE || categoryType === CategoryType.ACCESSORY_FUNCTION) {
      setIsAccessoryProduct(true)
    }
  }

  // Check if product has required category type (only FAN_TYPE is required for fan shop)
  const hasRequiredCategoryType = () => {
    const selectedCategories = Object.values(categoriesByType).flat().filter(cat => selectedCategoryIds.includes(cat.id))
    return selectedCategories.some(cat => cat.categoryType === CategoryType.FAN_TYPE)
  }

  // Add compatibility entry
  const addCompatibility = () => {
    setCompatibilities(prev => [...prev, {
      compatibleFanTypeId: undefined,
      compatibleBrandId: undefined,
      compatibleModel: '',
      notes: ''
    }])
  }

  // Update compatibility entry
  const updateCompatibility = (index: number, field: keyof AccessoryCompatibilityDTO, value: any) => {
    setCompatibilities(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  // Remove compatibility entry
  const removeCompatibility = (index: number) => {
    setCompatibilities(prev => prev.filter((_, i) => i !== index))
  }

  // Load all data
  const loadData = async () => {
    try {
      const [colorsData, warrantiesData, tagsData, fanTypeCats] = await Promise.all([
        ColorService.getAllColors(),
        WarrantyService.getAllWarranties(),
        TagService.getAllTags(),
        CategoryService.getCategoriesByType(CategoryType.FAN_TYPE)
      ])
      setColors(colorsData)
      setWarranties(warrantiesData)
      setTags(tagsData)
      setFanTypeCategories(fanTypeCats)

      // Load categories by type
      const categoryTypes = Object.values(CategoryType)
      const categoriesMap: Record<CategoryType, CategoryDTO[]> = {} as Record<CategoryType, CategoryDTO[]>
      
      for (const type of categoryTypes) {
        try {
          const cats = await CategoryService.getCategoriesByType(type)
          categoriesMap[type] = cats
        } catch {
          categoriesMap[type] = []
        }
      }
      setCategoriesByType(categoriesMap)
    } catch (error: any) {
      console.error('Failed to load data:', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Listen for storage event to refresh when data is added in another tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'warrantyAdded' || e.key === 'warrantyUpdated' || e.key === 'colorAdded' || e.key === 'colorUpdated' || e.key === 'tagAdded') {
        loadData()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    if (product) {
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
        timer: productDetail.timer || undefined,
        safetyStandards: productDetail.safetyStandards || undefined,
        manufacturingYear: productDetail.manufacturingYear || undefined,
        accessories: productDetail.accessories || undefined,
        energyRating: productDetail.energyRating || undefined
      })
      
      // Load product categories and tags if editing
      if (productDetail.productCategories) {
        setSelectedCategoryIds(productDetail.productCategories.map((pc: any) => pc.categoryId || pc.category?.id))
      }
      if (productDetail.productTags) {
        setSelectedTagIds(productDetail.productTags.map((pt: any) => pt.tagId || pt.tag?.id))
      }
      
      // Check if accessory product and load compatibilities
      const isAccessory = productDetail.productCategories?.some((pc: any) => 
        pc.category?.categoryType === CategoryType.ACCESSORY_TYPE || 
        pc.category?.categoryType === CategoryType.ACCESSORY_FUNCTION
      )
      setIsAccessoryProduct(isAccessory || false)
      
      if (isAccessory && product.id) {
        AccessoryCompatibilityService.getCompatibilityByProduct(product.id).then(setCompatibilities).catch(console.error)
      }
    } else {
      // Reset form when not in edit mode
      setDisplaySku('')
      setDisplaySlug('')
      setSelectedCategoryIds([])
      setSelectedTagIds([])
      setCompatibilities([])
      setIsAccessoryProduct(false)
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
        timer: undefined,
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

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ')
      return
    }

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
    
    if (!formData.productName.trim() || !formData.briefDescription.trim() || !formData.price || !formData.brandID) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    // Validate required category type
    if (!hasRequiredCategoryType()) {
      toast.error('Sản phẩm phải có ít nhất một danh mục Loại quạt')
      return
    }

    setLoading(true)
    try {
      if (!formData.brandID || formData.brandID === 0) {
        toast.error('Vui lòng chọn thương hiệu')
        setLoading(false)
        return
      }
      
      // Use first selected category as primary categoryID for backward compatibility
      const primaryCategoryId = selectedCategoryIds[0] || formData.categoryID
      
      const submitData: ProductRequest = {
        productName: formData.productName.trim(),
        briefDescription: formData.briefDescription.trim(),
        fullDescription: formData.fullDescription.trim() || formData.briefDescription.trim(),
        technicalSpecifications: formData.technicalSpecifications.trim() || '',
        price: formData.price,
        imageURL: formData.imageURL || '',
        brandID: formData.brandID,
        categoryID: primaryCategoryId,
        ...(formData.powerWatt !== undefined && formData.powerWatt !== null && formData.powerWatt > 0 && { powerWatt: formData.powerWatt }),
        ...(formData.bladeDiameterCm !== undefined && formData.bladeDiameterCm !== null && formData.bladeDiameterCm > 0 && { bladeDiameterCm: formData.bladeDiameterCm }),
        ...(formData.colorDefault && formData.colorDefault.trim() && { colorDefault: formData.colorDefault.trim() }),
        ...(formData.warrantyMonths !== undefined && formData.warrantyMonths !== null && formData.warrantyMonths > 0 && { warrantyMonths: formData.warrantyMonths }),
        ...(formData.colorIds && formData.colorIds.length > 0 && { colorIds: formData.colorIds }),
        ...(formData.warrantyId && formData.warrantyId > 0 && { warrantyId: formData.warrantyId }),
        ...(formData.quantity !== undefined && formData.quantity !== null && formData.quantity >= 0 && { quantity: formData.quantity }),
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
        ...(formData.timer && { timer: formData.timer }),
        ...(formData.safetyStandards && { safetyStandards: formData.safetyStandards }),
        ...(formData.manufacturingYear !== undefined && formData.manufacturingYear !== null && formData.manufacturingYear > 0 && { manufacturingYear: formData.manufacturingYear }),
        ...(formData.accessories && { accessories: formData.accessories }),
        ...(formData.energyRating && { energyRating: formData.energyRating })
      }
      
      // Add category IDs and tag IDs to submit data
      const extendedSubmitData = {
        ...submitData,
        categoryIds: selectedCategoryIds,
        tagIds: selectedTagIds
      }

      if (isEditMode && product) {
        const productID = product.productID || product.id
        if (!productID) throw new Error('Không tìm thấy ID sản phẩm')
        await ProductAdminService.updateProduct(productID, extendedSubmitData as any)
        
        // Update accessory compatibilities if this is an accessory product
        if (isAccessoryProduct && compatibilities.length > 0) {
          await AccessoryCompatibilityService.replaceCompatibilities(
            productID,
            compatibilities.map(c => ({ ...c, accessoryProductId: productID }))
          )
        }
        
        toast.success('Cập nhật sản phẩm thành công!')
      } else {
        const created = await ProductAdminService.addProduct(extendedSubmitData as any)
        if (created) {
          // Add accessory compatibilities if this is an accessory product
          if (isAccessoryProduct && compatibilities.length > 0 && created.id) {
            await AccessoryCompatibilityService.addCompatibilities(
              created.id,
              compatibilities.map(c => ({ ...c, accessoryProductId: created.id }))
            )
          }
          
          toast.success('Thêm sản phẩm thành công!')
          onSaved?.(created)
        }
      }
      onClose()
    } catch (error: any) {
      console.error('Error submitting product:', error)
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
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
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
                    <span className="text-sm text-gray-600">{uploadingImage ? 'Đang tải...' : 'Nhấp để tải ảnh'}</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploadingImage} />
                  </label>
                </div>
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
              <textarea
                value={formData.fullDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Multi-Category Selection by Type - Tree Structure */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân loại sản phẩm (Đa danh mục)</h3>
              <CategoryTreeSelector
                selectedIds={selectedCategoryIds}
                onChange={(ids) => {
                  setSelectedCategoryIds(ids)
                  // Check if any accessory type is selected
                  const hasAccessoryType = ids.some(id => {
                    // This will be validated by the component
                    return true
                  })
                }}
                requiredTypes={[CategoryType.FAN_TYPE]}
              />
            </div>

            {/* Tag Selection */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhãn sản phẩm</h3>
              <div className="relative" ref={tagDropdownRef}>
                {/* Selected Tags */}
                {getSelectedTags().length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {getSelectedTags().map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-white text-sm"
                        style={{ backgroundColor: tag.badgeColor || '#3B82F6' }}
                      >
                        <span>{tag.displayName}</span>
                        <button type="button" onClick={(e) => removeTag(tag.id, e)} className="hover:opacity-80">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Dropdown Button */}
                <div
                  onClick={() => setShowTagDropdown(!showTagDropdown)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between min-h-[42px] cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <span className="text-gray-500">
                    {getSelectedTags().length > 0 ? `${getSelectedTags().length} nhãn đã chọn` : 'Chọn nhãn sản phẩm...'}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showTagDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      <div className="py-1">
                        {tags.length > 0 ? (
                          tags.map((tag) => {
                            const isSelected = selectedTagIds.includes(tag.id)
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors ${isSelected ? 'bg-green-50' : ''}`}
                              >
                                <span className="px-2 py-0.5 rounded-full text-white text-xs" style={{ backgroundColor: tag.badgeColor || '#3B82F6' }}>
                                  {tag.displayName}
                                </span>
                                <span className="text-gray-500 text-sm font-mono">{tag.code}</span>
                                {isSelected && <Check className="w-5 h-5 text-green-600 ml-auto" />}
                              </button>
                            )
                          })
                        ) : (
                          <div className="px-4 py-3 text-center text-gray-500 text-sm">Không có nhãn nào</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Accessory Compatibility Section */}
            {isAccessoryProduct && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tương thích phụ kiện</h3>
                    <p className="text-sm text-gray-500">Chỉ định loại quạt và model tương thích với phụ kiện này</p>
                  </div>
                  <button
                    type="button"
                    onClick={addCompatibility}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm tương thích
                  </button>
                </div>
                
                {compatibilities.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-gray-500">Chưa có thông tin tương thích</p>
                    <button
                      type="button"
                      onClick={addCompatibility}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Thêm thông tin tương thích đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {compatibilities.map((compat, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Tương thích #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeCompatibility(index)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Loại quạt tương thích</label>
                            <select
                              value={compat.compatibleFanTypeId || ''}
                              onChange={(e) => updateCompatibility(index, 'compatibleFanTypeId', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">-- Chọn loại quạt --</option>
                              {fanTypeCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Thương hiệu tương thích</label>
                            <select
                              value={compat.compatibleBrandId || ''}
                              onChange={(e) => updateCompatibility(index, 'compatibleBrandId', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="">-- Chọn thương hiệu --</option>
                              {brands.map((brand) => (
                                <option key={brand.brandID} value={brand.brandID}>{brand.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Model cụ thể</label>
                            <input
                              type="text"
                              value={compat.compatibleModel || ''}
                              onChange={(e) => updateCompatibility(index, 'compatibleModel', e.target.value)}
                              placeholder="VD: F-409K, F-308K..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Ghi chú</label>
                            <input
                              type="text"
                              value={compat.notes || ''}
                              onChange={(e) => updateCompatibility(index, 'notes', e.target.value)}
                              placeholder="Ghi chú thêm..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* Technical Specifications */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật cơ bản</h3>
              
              {/* Grid: SKU, Slug - Read only */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mã SKU <span className="text-xs text-gray-500">(Tự động tạo)</span></label>
                  <input type="text" value={displaySku || 'Sẽ tự động tạo khi lưu'} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL) <span className="text-xs text-gray-500">(Tự động tạo)</span></label>
                  <input type="text" value={displaySlug || 'Sẽ tự động tạo khi lưu'} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" />
                </div>
              </div>

              {/* Grid: Power Watt, Blade Diameter, Quantity */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Công suất (W)</label>
                  <input type="text" inputMode="numeric" value={formatVND(formData.powerWatt)} onChange={(e) => handleNumberChange('powerWatt', e.target.value)} placeholder="VD: 45" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đường kính cánh quạt (cm)</label>
                  <input type="number" step="0.01" value={formData.bladeDiameterCm || ''} onChange={(e) => setFormData(prev => ({ ...prev, bladeDiameterCm: e.target.value ? Number(e.target.value) : undefined }))} placeholder="VD: 40" min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng kho tổng</label>
                  <input type="text" inputMode="numeric" value={formatVND(formData.quantity)} onChange={(e) => handleNumberChange('quantity', e.target.value)} placeholder="VD: 100" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              {/* Grid: Colors, Warranty */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Colors - Custom Dropdown */}
                <div className="relative" ref={colorDropdownRef}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                    <button type="button" onClick={() => window.open('/admin/colors', '_blank')} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                      <Plus className="w-3 h-3" />Thêm màu sắc
                    </button>
                  </div>
                  
                  {getSelectedColors().length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {getSelectedColors().map((color) => (
                        <span key={color.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                          {color.hexCode && <span className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: color.hexCode }} />}
                          <span>{color.name}</span>
                          <button type="button" onClick={(e) => removeColor(color.id, e)} className="hover:text-red-600 ml-1"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div onClick={() => setShowColorDropdown(!showColorDropdown)} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between min-h-[42px] cursor-pointer hover:border-gray-400 transition-colors">
                    <span className="text-gray-500">{getSelectedColors().length > 0 ? `${getSelectedColors().length} màu đã chọn` : 'Chọn màu sắc...'}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showColorDropdown ? 'rotate-180' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {showColorDropdown && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="py-1">
                          {colors.length > 0 ? colors.map((color) => {
                            const isSelected = formData.colorIds?.includes(color.id)
                            return (
                              <button key={color.id} type="button" onClick={() => toggleColor(color.id)} className={`w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors ${isSelected ? 'bg-green-50' : ''}`}>
                                <div className="flex items-center gap-2 flex-1">
                                  {color.hexCode && <div className="w-5 h-5 rounded border border-gray-300 flex-shrink-0" style={{ backgroundColor: color.hexCode }} />}
                                  <span className="text-gray-900">{color.name}</span>
                                </div>
                                {isSelected && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                              </button>
                            )
                          }) : <div className="px-4 py-3 text-center text-gray-500 text-sm">Không có màu sắc nào</div>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Warranty */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Bảo hành</label>
                    <button type="button" onClick={() => window.open('/admin/warranties', '_blank')} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                      <Plus className="w-3 h-3" />Thêm bảo hành
                    </button>
                  </div>
                  <select value={formData.warrantyId || ''} onChange={(e) => setFormData(prev => ({ ...prev, warrantyId: e.target.value ? parseInt(e.target.value) : undefined }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Chọn bảo hành</option>
                    {warranties.map((warranty) => <option key={warranty.id} value={warranty.id}>{warranty.name} ({warranty.durationMonths} tháng)</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ) *</label>
                  <div className="relative">
                    <input type="text" inputMode="numeric" value={formatVND(formData.price)} onChange={(e) => handleNumberChange('price', e.target.value)} className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required placeholder="VD: 1.500.000" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₫</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu *</label>
                  <select value={formData.brandID} onChange={(e) => setFormData(prev => ({ ...prev, brandID: Number(e.target.value) }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((brand) => <option key={brand.brandID} value={brand.brandID}>{brand.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục chính</label>
                  <select value={formData.categoryID} onChange={(e) => setFormData(prev => ({ ...prev, categoryID: Number(e.target.value) }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Danh mục chính (tương thích ngược). Sử dụng phần Đa danh mục ở trên để phân loại chi tiết.</p>
                </div>
              </div>
            </div>

            {/* Technical Specifications Detail */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật chi tiết</h3>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Điện áp sử dụng</label>
                  <input type="text" value={formData.voltage || ''} onChange={(e) => setFormData(prev => ({ ...prev, voltage: e.target.value }))} placeholder="VD: 220V / 50Hz" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tốc độ gió</label>
                  <input type="text" value={formData.windSpeedLevels || ''} onChange={(e) => setFormData(prev => ({ ...prev, windSpeedLevels: e.target.value }))} placeholder="VD: 3 mức" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lưu lượng gió (m³/phút)</label>
                  <input type="text" inputMode="numeric" value={formatVND(formData.airflow)} onChange={(e) => handleNumberChange('airflow', e.target.value)} placeholder="VD: 65" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chất liệu cánh quạt</label>
                  <input type="text" value={formData.bladeMaterial || ''} onChange={(e) => setFormData(prev => ({ ...prev, bladeMaterial: e.target.value }))} placeholder="VD: Nhựa ABS" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chất liệu thân quạt</label>
                  <input type="text" value={formData.bodyMaterial || ''} onChange={(e) => setFormData(prev => ({ ...prev, bodyMaterial: e.target.value }))} placeholder="VD: Nhựa cao cấp" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng cánh</label>
                  <input type="text" inputMode="numeric" value={formatVND(formData.bladeCount)} onChange={(e) => handleNumberChange('bladeCount', e.target.value)} placeholder="VD: 3 hoặc 5" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ ồn (dB)</label>
                  <input type="text" inputMode="numeric" value={formatVND(formData.noiseLevel)} onChange={(e) => handleNumberChange('noiseLevel', e.target.value)} placeholder="VD: 55" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tốc độ quay motor (vòng/phút)</label>
                  <input type="text" inputMode="numeric" value={formatVND(formData.motorSpeed)} onChange={(e) => handleNumberChange('motorSpeed', e.target.value)} placeholder="VD: 1.200" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trọng lượng (kg)</label>
                  <input type="number" step="0.01" value={formData.weight || ''} onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value ? Number(e.target.value) : undefined }))} placeholder="VD: 6.5" min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chiều cao điều chỉnh</label>
                  <input type="text" value={formData.adjustableHeight || ''} onChange={(e) => setFormData(prev => ({ ...prev, adjustableHeight: e.target.value }))} placeholder="VD: 1.1 – 1.4 m" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
            </div>

            {/* Features */}
            {/* Other Info */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khác</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu chuẩn an toàn</label>
                  <input type="text" value={formData.safetyStandards || ''} onChange={(e) => setFormData(prev => ({ ...prev, safetyStandards: e.target.value }))} placeholder="VD: TCVN / IEC / RoHS" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Năm sản xuất</label>
                  <input type="text" inputMode="numeric" value={formatVND(formData.manufacturingYear)} onChange={(e) => handleNumberChange('manufacturingYear', e.target.value)} placeholder="VD: 2025" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phụ kiện đi kèm</label>
                  <textarea value={formData.accessories || ''} onChange={(e) => setFormData(prev => ({ ...prev, accessories: e.target.value }))} placeholder="VD: Điều khiển / Pin / HDSD" rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mức tiết kiệm điện năng</label>
                  <input type="text" value={formData.energyRating || ''} onChange={(e) => setFormData(prev => ({ ...prev, energyRating: e.target.value }))} placeholder="VD: 5 sao" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
            </div>

            </form>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">Hủy</button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                const form = document.getElementById('product-form') as HTMLFormElement
                if (form) form.requestSubmit()
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
