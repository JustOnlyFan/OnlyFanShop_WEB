'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Star, ShoppingCart, Heart, Eye, Zap } from 'lucide-react'

import { Product } from '@/types'
import { ImageFallback } from '@/components/ui/ImageFallback'
import { formatPrice } from '@/lib/utils'

interface ProductCard3DProps {
  product: Product
  className?: string
}

export function ProductCard3D({ product, className = '' }: ProductCard3DProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const scale = useMotionValue(1)

  const springConfig = { stiffness: 100, damping: 15 }
  const smoothRotateX = useSpring(rotateX, springConfig)
  const smoothRotateY = useSpring(rotateY, springConfig)
  const smoothScale = useSpring(scale, springConfig)

  const transform = useTransform(
    [smoothRotateX, smoothRotateY, smoothScale],
    ([x, y, s]) => `perspective(1000px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`
  )

  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault()
    e.stopPropagation()
    action()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    rotateX.set((e.clientY - centerY) / 40)
    rotateY.set((centerX - e.clientX) / 40)
  }

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
    setIsHovered(false)
  }

  return (
      <motion.div
        ref={cardRef}
        style={{ transform }}
        className={`relative group cursor-pointer ${className}`}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => { setIsHovered(true); scale.set(1.01); }}
      >
        <Link href={`/products/${product.id}`}>
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-200">
          {/* Product Image with 3D effect */}
          <div className="relative h-64 overflow-hidden">
            <motion.div
              className="relative w-full h-full"
              animate={{
                scale: isHovered ? 1.02 : 1, // Very subtle image scale
              }}
              transition={{ duration: 0.15 }} // Very fast transition
            >
              <ImageFallback
                src={product.imageURL || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format'}
                alt={product.productName}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                fallbackSrc="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format"
              />
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.button
                  onClick={(e) => handleClick(e, () => setIsLiked(!isLiked))}
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                </motion.button>
                <motion.button
                  className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Eye className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="p-6">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {product.productName}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {product.briefDescription}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-1">({Math.floor(Math.random() * 100) + 20})</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              onClick={(e) => handleClick(e, () => console.log('Added to cart:', product.productName))}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Thêm vào giỏ</span>
              <Zap className="w-4 h-4" />
            </motion.button>
          </div>

            </div>
        </Link>
      </motion.div>
  )
}
