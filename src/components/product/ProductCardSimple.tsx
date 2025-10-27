'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Product } from '@/types'
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react'
import { ImageFallback } from '@/components/ui/ImageFallback'
import Link from 'next/link'

interface ProductCardSimpleProps {
  product: Product
  className?: string
}

export function ProductCardSimple({ product, className = '' }: ProductCardSimpleProps) {
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Added to cart:', product.productName)
  }

  return (
    <motion.div
      className={`relative group cursor-pointer bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col ${className}`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.id}`} className="h-full flex flex-col">
        <div className="relative flex flex-col h-full">
          {/* Product Image */}
          <div className="relative h-64 overflow-hidden rounded-t-xl">
            <ImageFallback
              src={product.imageURL || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format'}
              alt={product.productName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fallbackSrc="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            
            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleLike}
                className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <Heart 
                  className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
                />
              </button>
              
              <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Badge */}
            {product.price < 1000000 && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Tiết kiệm
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4 flex flex-col flex-grow">
            <div className="mb-2 flex-grow">
              <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
                {product.productName}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.briefDescription || 'Sản phẩm chất lượng cao'}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">(4.0)</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(product.price)}
                </span>
                {product.price > 1000000 && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(product.price * 1.2)}
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 group/btn mt-auto"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Thêm vào giỏ</span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
