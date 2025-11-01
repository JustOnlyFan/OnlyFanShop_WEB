'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload as UploadIcon, Loader2 } from 'lucide-react'
import ProductAdminService from '@/services/productAdminService'
import { ProductDTO, Brand, Category, ProductRequest } from '@/types'
import toast from 'react-hot-toast'

interface ProductManagementModalProps {
  product: ProductDTO | null
  brands: Brand[]
  categories: Category[]
  onClose: () => void
}

export function ProductManagementModal({ product, brands, categories, onClose }: ProductManagementModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProductRequest>({
    productName: '',
    briefDescription: '',
    fullDescription: '',
    technicalSpecifications: '',
    price: 0,
    imageURL: '',
    brandID: 0,
    categoryID: 0
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  const isEditMode = !!product

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName,
        briefDescription: product.briefDescription,
        fullDescription: product.briefDescription, // Use briefDescription as fallback
        technicalSpecifications: product.briefDescription, // Use briefDescription as fallback
        price: product.price,
        imageURL: product.imageURL,
        brandID: product.brand?.brandID || 0,
        categoryID: product.category?.id || 0
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
      if (isEditMode && product) {
        const productID = product.productID || product.id
        if (!productID) throw new Error('Không tìm thấy ID sản phẩm')
        await ProductAdminService.updateProduct(productID, formData)
        toast.success('Cập nhật sản phẩm thành công!')
      } else {
        await ProductAdminService.addProduct(formData)
        toast.success('Thêm sản phẩm thành công!')
      }
      onClose()
    } catch (error: any) {
      toast.error(error.message || `Không thể ${isEditMode ? 'cập nhật' : 'thêm'} sản phẩm`)
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
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

            {/* Technical Specifications */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông số kỹ thuật
              </label>
              <textarea
                value={formData.technicalSpecifications}
                onChange={(e) => setFormData(prev => ({ ...prev, technicalSpecifications: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
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

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isEditMode ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

