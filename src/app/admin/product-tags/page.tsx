'use client'

import { useState, useEffect } from 'react'
import { Search, Tag, Package, Check } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'
import toast from 'react-hot-toast'
import ProductAdminService from '@/services/productAdminService'
import TagService from '@/services/tagService'

interface ProductTag {
  productId: number
  productName: string
  productSku: string
  tags: { id: number; name: string; color: string }[]
}

interface TagOption {
  id: number
  name: string
  color: string
}

export default function ProductTagsPage() {
  const [productTags, setProductTags] = useState<ProductTag[]>([])
  const [availableTags, setAvailableTags] = useState<TagOption[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductTag | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const { language } = useLanguageStore()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch tags from API
      const tagsData = await TagService.getAllTags()
      const mappedTags: TagOption[] = tagsData.map(tag => ({
        id: tag.id,
        name: tag.displayName,
        color: tag.badgeColor || '#6B7280'
      }))
      setAvailableTags(mappedTags)

      // Fetch products from API
      const productsData = await ProductAdminService.getProductList({ page: 1, size: 100 })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedProducts: ProductTag[] = (productsData.products || []).map((product: any) => ({
        productId: product.productID || product.id || 0,
        productName: product.productName,
        productSku: product.sku || `SKU-${product.productID || product.id}`,
        tags: (product.productTags || []).map((pt: any) => ({
          id: pt.tagId || pt.id,
          name: pt.tagDisplayName || pt.displayName || pt.name || '',
          color: pt.tagBadgeColor || pt.badgeColor || '#6B7280'
        }))
      }))
      setProductTags(mappedProducts)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = productTags.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.productSku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTagStyle = (color: string) => {
    // If it's a hex color, use inline style
    if (color.startsWith('#')) {
      return {
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`
      }
    }
    // Fallback for named colors
    const colors: Record<string, string> = {
      red: 'bg-red-100 text-red-700 border-red-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      orange: 'bg-orange-100 text-orange-700 border-orange-200',
      teal: 'bg-teal-100 text-teal-700 border-teal-200',
      pink: 'bg-pink-100 text-pink-700 border-pink-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    }
    return colors[color] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const openTagModal = (product: ProductTag) => {
    setSelectedProduct(product)
    setSelectedTagIds(product.tags.map(t => t.id))
    setShowModal(true)
  }

  const toggleTagSelection = (tagId: number) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSaveTags = async () => {
    if (!selectedProduct) return
    
    setSaving(true)
    try {
      await ProductAdminService.replaceProductTags(selectedProduct.productId, selectedTagIds)
      toast.success('Đã cập nhật tags thành công')
      setShowModal(false)
      setSelectedProduct(null)
      fetchData() // Refresh data
    } catch (error) {
      console.error('Error saving tags:', error)
      toast.error('Không thể cập nhật tags')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'vi' ? 'Gán Tag Sản phẩm' : 'Product Tags'}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === 'vi' ? 'Quản lý tags cho từng sản phẩm' : 'Manage tags for each product'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'vi' ? 'Tìm kiếm sản phẩm...' : 'Search products...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">{language === 'vi' ? 'Tags:' : 'Tags:'}</span>
            {availableTags.slice(0, 5).map(tag => {
              const style = getTagStyle(tag.color)
              return typeof style === 'string' ? (
                <span key={tag.id} className={`px-2 py-1 rounded-full text-xs font-medium border ${style}`}>
                  {tag.name}
                </span>
              ) : (
                <span key={tag.id} className="px-2 py-1 rounded-full text-xs font-medium border" style={style}>
                  {tag.name}
                </span>
              )
            })}
            {availableTags.length > 5 && (
              <span className="text-sm text-gray-400">+{availableTags.length - 5}</span>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {language === 'vi' ? 'Sản phẩm' : 'Product'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {language === 'vi' ? 'Tags' : 'Tags'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {language === 'vi' ? 'Thao tác' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {language === 'vi' ? 'Đang tải...' : 'Loading...'}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {language === 'vi' ? 'Không tìm thấy sản phẩm' : 'No products found'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.productId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="font-medium text-gray-900">{product.productName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.productSku}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.tags.length > 0 ? (
                          product.tags.map(tag => {
                            const style = getTagStyle(tag.color)
                            return typeof style === 'string' ? (
                              <span 
                                key={tag.id} 
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${style}`}
                              >
                                {tag.name}
                              </span>
                            ) : (
                              <span 
                                key={tag.id} 
                                className="px-2 py-1 rounded-full text-xs font-medium border"
                                style={style}
                              >
                                {tag.name}
                              </span>
                            )
                          })
                        ) : (
                          <span className="text-gray-400 text-sm italic">
                            {language === 'vi' ? 'Chưa có tag' : 'No tags'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button 
                          onClick={() => openTagModal(product)}
                          className="flex items-center gap-1 px-3 py-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Tag className="w-4 h-4" />
                          {language === 'vi' ? 'Gán tag' : 'Assign'}
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

      {/* Assign Tags Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {language === 'vi' ? 'Gán Tags cho sản phẩm' : 'Assign Tags'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{selectedProduct.productName}</p>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                {language === 'vi' ? 'Chọn tags:' : 'Select tags:'}
              </p>
              {availableTags.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  {language === 'vi' ? 'Chưa có tag nào. Vui lòng tạo tag trước.' : 'No tags available. Please create tags first.'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => {
                    const isSelected = selectedTagIds.includes(tag.id)
                    const style = getTagStyle(tag.color)
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTagSelection(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          isSelected 
                            ? 'ring-2 ring-offset-1 ring-primary-500' 
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                        style={isSelected && typeof style === 'object' ? style : undefined}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => { setShowModal(false); setSelectedProduct(null) }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={saving}
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button 
                onClick={handleSaveTags}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {saving ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : (language === 'vi' ? 'Lưu' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
