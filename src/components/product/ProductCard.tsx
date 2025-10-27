'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  HeartIcon, 
  ShoppingCartIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { Product } from '@/services/productService'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  className?: string
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ product, className, viewMode = 'grid' }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
      return
    }

    setIsAdding(true)
    try {
      await addItem(product, 1)
      toast.success('Đã thêm sản phẩm vào giỏ hàng')
    } catch (error: any) {
      toast.error(error.message || 'Thêm sản phẩm thất bại')
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleLike = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm yêu thích')
      return
    }
    setIsLiked(!isLiked)
    toast.success(isLiked ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích')
  }

  const getProductBadges = () => {
    const badges = []
    if (product.price > 2000000) {
      badges.push({ text: 'Cao cấp', color: 'bg-gradient-to-r from-purple-500 to-pink-500' })
    }
    if ((product as any).rating && (product as any).rating >= 4.5) {
      badges.push({ text: 'Top', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' })
    }
    if ((product as any).isNew) {
      badges.push({ text: 'Mới', color: 'bg-gradient-to-r from-green-400 to-blue-500' })
    }
    return badges
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (viewMode === 'list') {
    return (
      <div className={`group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}>
        <div className="flex">
          {/* Image Container */}
          <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden">
            <Link href={`/products/${product.id}`}>
              <Image
                src={product.imageURL || '/images/placeholder.svg'}
                alt={product.productName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {getProductBadges().map((badge, index) => (
                <span
                  key={index}
                  className={`${badge.color} text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg`}
                >
                  {badge.text}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 font-medium">
                  {product.brand.name}
                </div>
                <button
                  onClick={handleToggleLike}
                  className={`p-2 rounded-full transition-colors ${
                    isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  {isLiked ? (
                    <HeartSolidIcon className="w-5 h-5" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              <Link href={`/products/${product.id}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                  {product.productName}
                </h3>
              </Link>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {renderStars((product as any).rating || 0)}
                </div>
                <span className="text-sm text-gray-500">({(product as any).rating || 0})</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">Đã bán {Math.floor(Math.random() * 1000) + 100}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {product.briefDescription}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                {(product as any).originalPrice && (product as any).originalPrice > product.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice((product as any).originalPrice)}
                  </span>
                )}
              </div>
              
              <Button
                onClick={handleAddToCart}
                loading={isAdding}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                Thêm vào giỏ
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.imageURL || '/images/placeholder.svg'}
            alt={product.productName}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/images/placeholder.jpg';
            }}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {getProductBadges().map((badge, index) => (
            <span
              key={index}
              className={`${badge.color} text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg`}
            >
              {badge.text}
            </span>
          ))}
        </div>
        
        {/* Hover Actions */}
        <div className={`absolute top-3 right-3 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}>
          <button
            onClick={handleToggleLike}
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isLiked ? 'text-red-500 bg-white' : 'text-gray-600 bg-white hover:text-red-500'
            }`}
          >
            {isLiked ? (
              <HeartSolidIcon className="w-4 h-4" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Quick View */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Link href={`/products/${product.id}`}>
            <Button
              size="sm"
              className="bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Xem nhanh
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col h-full">
        {/* Brand */}
        <div className="text-sm text-gray-500 font-medium mb-2">
          {product.brand.name}
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors text-lg min-h-[3.5rem]">
            {product.productName}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {renderStars((product as any).rating || 0)}
          </div>
          <span className="text-sm text-gray-500">({(product as any).rating || 0})</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">Đã bán {Math.floor(Math.random() * 1000) + 100}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
          {product.briefDescription}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
                {(product as any).originalPrice && (product as any).originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice((product as any).originalPrice)}
                  </span>
                )}
          </div>
        </div>

        {/* Add to Cart Button - Push to bottom */}
        <div className="mt-auto">
          <Button
            onClick={handleAddToCart}
            loading={isAdding}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg"
            size="sm"
          >
            <ShoppingCartIcon className="w-4 h-4 mr-2" />
            Thêm vào giỏ
          </Button>
        </div>
      </div>
    </div>
  )
}