'use client'

import { useState, memo, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    HeartIcon,
    StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface ProductCardProps {
    product: Product
    className?: string
    viewMode?: 'grid' | 'list'
}

export const ProductCard = memo(function ProductCard({ product, className, viewMode = 'grid' }: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(false)

    const { isAuthenticated } = useAuthStore()

    const handleToggleLike = useCallback(() => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để thêm sản phẩm yêu thích')
            return
        }
        setIsLiked(!isLiked)
        toast.success(isLiked ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích')
    }, [isAuthenticated, isLiked])

    const badges = useMemo(() => {
        const result = []
        if (product.price > 2000000) {
            result.push({ text: 'Cao cấp', color: 'bg-gradient-to-r from-purple-500 to-pink-500' })
        }
        if ((product as any).rating && (product as any).rating >= 4.5) {
            result.push({ text: 'Top', color: 'bg-gradient-to-r from-yellow-400 to-orange-500' })
        }
        if ((product as any).isNew) {
            result.push({ text: 'Mới', color: 'bg-gradient-to-r from-green-400 to-blue-500' })
        }
        return result
    }, [product.price, (product as any).rating, (product as any).isNew])

    const renderStars = useCallback((rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <StarIcon
                key={i}
                className={`w-3.5 h-3.5 ${
                    i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
        ))
    }, [])

    if (viewMode === 'list') {
        return (
            <Link href={`/products/${product.id}`} className={`group relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 block ${className}`}>
                <div className="flex">
                    {/* Image Container */}
                    <div className="relative w-40 h-40 flex-shrink-0 overflow-hidden bg-gray-50">
                        <Image
                            src={product.imageURL || '/images/placeholder.svg'}
                            alt={product.productName}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            sizes="160px"
                            loading="lazy"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {badges.map((badge, index) => (
                                <span
                                    key={index}
                                    className={`${badge.color} text-white px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-lg`}
                                >
                  {badge.text}
                </span>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                    {product.brand?.name || 'N/A'}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleToggleLike()
                                    }}
                                    className={`p-1.5 rounded-full transition-all z-10 relative ${
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

                            <h3 className="text-sm font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                                {product.productName}
                            </h3>

                            <div className="flex items-center gap-1 mb-2">
                                <div className="flex items-center">
                                    {renderStars((product as any).rating || 0)}
                                </div>
                                <span className="text-xs text-gray-600 ml-1">({(product as any).rating || 0})</span>
                            </div>

                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                {product.briefDescription}
                            </p>
                        </div>

                        <div className="flex items-end justify-between mt-3">
                            <div>
                                <div className="text-xl font-bold text-blue-600">
                                    {formatPrice(product.price)}
                                </div>
                                {(product as any).originalPrice && (product as any).originalPrice > product.price && (
                                    <div className="text-xs text-gray-400 line-through">
                                        {formatPrice((product as any).originalPrice)}
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">
                                Đã bán {Math.floor(Math.random() * 1000) + 100}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // @ts-ignore
    return (
        <Link
            href={`/products/${product.id}`}
            className={`group relative bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col cursor-pointer ${className}`}
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Image
                    src={product.imageURL || '/images/placeholder.svg'}
                    alt={product.productName}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    loading="lazy"
                    onError={(e: any) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder.svg';
                    }}
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {badges.map((badge, index) => (
                        <span
                            key={index}
                            className={`${badge.color} text-white px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-lg`}
                        >
              {badge.text}
            </span>
                    ))}
                </div>

                {/* Hover Actions */}
                <div className="absolute top-2 right-2 z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleToggleLike()
                        }}
                        className={`p-2 rounded-full shadow-md bg-white transition-all ${
                            isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                        }`}
                    >
                        {isLiked ? (
                            <HeartSolidIcon className="w-4 h-4" />
                        ) : (
                            <HeartIcon className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col flex-1">
                {/* Brand */}
                <div className="text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wider">
                    {product.brand?.name || 'N/A'}
                </div>

                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors text-sm leading-snug">
                    {product.productName}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                        {renderStars((product as any).rating || 0)}
                    </div>
                    <span className="text-[11px] text-gray-600 ml-0.5">({(product as any).rating || 0})</span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed flex-1">
                    {product.briefDescription}
                </p>

                {/* Price & Sold */}
                <div className="flex items-end justify-between mt-2">
                    <div>
                        <div className="text-lg font-bold text-blue-600">
                            {formatPrice(product.price)}
                        </div>
                        {(product as any).originalPrice && (product as any).originalPrice > product.price && (
                            <div className="text-[11px] text-gray-400 line-through -mt-0.5">
                                {formatPrice((product as any).originalPrice)}
                            </div>
                        )}
                    </div>
                    <div className="text-[11px] text-gray-500 pb-0.5">
                        Đã bán {Math.floor(Math.random() * 1000) + 100}
                    </div>
                </div>
            </div>
        </Link>
    )
}, (prevProps, nextProps) => {
    // Chỉ re-render nếu product thay đổi
    return prevProps.product.id === nextProps.product.id &&
           prevProps.product.price === nextProps.product.price &&
           prevProps.viewMode === nextProps.viewMode &&
           prevProps.className === nextProps.className
})