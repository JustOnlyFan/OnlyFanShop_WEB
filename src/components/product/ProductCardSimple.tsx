'use client'

import { useState } from 'react'
import Link from 'next/link'

import { motion } from 'framer-motion'
import { Star, Heart, Eye } from 'lucide-react'

import { Product } from '@/types'
import { ImageFallback } from '@/components/ui/ImageFallback'
import { formatPrice } from '@/lib/utils'

interface ProductCardSimpleProps {
  product: Product
  className?: string
}

export function ProductCardSimple({ product, className = '' }: ProductCardSimpleProps) {
  const [isLiked, setIsLiked] = useState(false)

  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault()
    e.stopPropagation()
    action()
  }

  return (
    <motion.div
      className={`relative group cursor-pointer bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 h-full flex flex-col ${className}`}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/products/${product.id}`} className="h-full flex flex-col">
        <div className="relative flex flex-col h-full">
          {/* Product Image */}
          <div className="relative h-40 overflow-hidden rounded-t-lg bg-white">
            <ImageFallback
              src={product.imageURL || '/images/placeholder.svg'}
              alt={product.productName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-contain p-2"
              fallbackSrc="/images/placeholder.svg"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
            
            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => handleClick(e, () => setIsLiked(!isLiked))}
                className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
              </button>
              <button className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                <Eye className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>

            {/* Badge */}
            {product.price < 1000000 && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                Tiết kiệm
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-3 flex flex-col flex-grow">
            <div className="mb-2 flex-grow">
              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                {product.productName}
              </h3>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1.5">(4.0)</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mt-auto">
              <div>
                <span className="text-base font-bold text-blue-600">{formatPrice(product.price)}</span>
                {product.price > 1000000 && (
                  <span className="text-xs text-gray-500 line-through ml-2">{formatPrice(product.price * 1.2)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
