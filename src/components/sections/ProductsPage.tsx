'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search, Truck, Shield, RotateCcw } from 'lucide-react'

import { ProductService } from '@/services/productService'
import { ProductCardSimple } from '@/components/product/ProductCardSimple'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'

interface Product {
  id: number
  name: string
  price: number
  imageUrl: string
  rating: number
  reviewCount: number
  description: string
}

interface Category {
  id: number
  name: string
}

interface Brand {
  id: number
  name: string
}

export function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('ProductID')

  // Fetch products from API
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory, selectedBrand, searchQuery, sortBy],
    queryFn: () => ProductService.getProducts({
      keyword: searchQuery,
      categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
      brandId: selectedBrand ? parseInt(selectedBrand) : undefined,
      page: 1,
      size: 20,
      sortBy,
      order: 'DESC'
    }),
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch categories and brands
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ProductService.getCategories(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => ProductService.getBrands(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  const products = productsData?.data?.products || []
  const categories = categoriesData?.data || []
  const brands = brandsData?.data || []

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId)
  }

  const handleBrandFilter = (brandId: string) => {
    setSelectedBrand(brandId === selectedBrand ? '' : brandId)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleSort = (sort: string) => {
    setSortBy(sort)
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white/80">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sản Phẩm Quạt Điện
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá bộ sưu tập quạt điện đa dạng với công nghệ tiên tiến, thiết kế hiện đại và hiệu suất vượt trội
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedBrand}
              onChange={(e) => handleBrandFilter(e.target.value)}
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((brand) => (
                <option key={brand.brandID} value={brand.brandID.toString()}>
                  {brand.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="name">Tên A-Z</option>
              <option value="price-low">Giá thấp đến cao</option>
              <option value="price-high">Giá cao đến thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCardSimple product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </p>
            <Button 
              onClick={() => {
                setSelectedCategory('')
                setSelectedBrand('')
                setSearchQuery('')
                setSortBy('name')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn OnlyFan Shop?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600">Giao hàng trong 24h tại TP.HCM</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bảo hành chính hãng</h3>
              <p className="text-gray-600">Bảo hành 2 năm cho tất cả sản phẩm</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Đổi trả dễ dàng</h3>
              <p className="text-gray-600">Đổi trả trong 7 ngày nếu không hài lòng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}