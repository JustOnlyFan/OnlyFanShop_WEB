'use client'

import { useState, memo, useCallback, useMemo, useEffect } from 'react'
import Link from 'next/link'

import { HeartIcon, StarIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

import { Product, TagDTO } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useLanguageStore } from '@/store/languageStore'

// Extended Product type with tags support
interface ProductWithTags extends Product {
    tags?: TagDTO[]
}

interface ProductCardProps {
    product: ProductWithTags
    className?: string
    viewMode?: 'grid' | 'list'
}

export const ProductCard = memo(function ProductCard({ product, className, viewMode = 'grid' }: ProductCardProps) {
    const [isLiked, setIsLiked] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const { isAuthenticated } = useAuthStore()
    const { t } = useLanguageStore()

    const handleToggleLike = useCallback(() => {
        if (!isAuthenticated) {
            toast.error(t('loginToAddFavorite'))
            return
        }
        setIsLiked(!isLiked)
        toast.success(isLiked ? t('removedFromFavorite') : t('addedToFavorite'))
    }, [isAuthenticated, isLiked, t])

    // Build image list: prefer color-linked images, fallback to product.imageURL, then placeholder
    const imageList = useMemo(() => {
        const imgs: string[] = []
        const rawImages = (product as any).images
        if (Array.isArray(rawImages)) {
            rawImages.forEach((img: any) => {
                if (img?.imageUrl && !imgs.includes(img.imageUrl)) {
                    imgs.push(img.imageUrl)
                }
            })
        }
        if (!imgs.length && product.imageURL) {
            imgs.push(product.imageURL)
        }
        if (!imgs.length) {
            imgs.push('/images/placeholder.svg')
        }
        return imgs
    }, [product])

    // Get tag badge color based on tag code
    const getTagBadgeColor = useCallback((tag: TagDTO) => {
        const colorMap: Record<string, string> = {
            'NEW': 'bg-blue-500',
            'BESTSELLER': 'bg-red-500',
            'SALE': 'bg-orange-500',
            'PREMIUM': 'bg-purple-500',
            'IMPORTED': 'bg-green-500',
            'AUTHENTIC': 'bg-yellow-500',
        }
        return tag.badgeColor || colorMap[tag.code] || 'bg-gray-500'
    }, [])

    const badges = useMemo(() => {
        const result: { text: string; color: string }[] = []
        
        // Add product tags as badges (Requirements 3.3)
        if (product.tags && product.tags.length > 0) {
            product.tags.forEach(tag => {
                result.push({ 
                    text: tag.displayName, 
                    color: getTagBadgeColor(tag) 
                })
            })
        }
        
        // Fallback badges if no tags
        if (result.length === 0) {
            if (product.price > 2000000) {
                result.push({ text: t('premium'), color: 'bg-accent-500' })
            }
            if ((product as any).rating && (product as any).rating >= 4.5) {
                result.push({ text: t('top'), color: 'bg-warning-500' })
            }
            if ((product as any).isNew) {
                result.push({ text: t('new'), color: 'bg-primary-500' })
            }
        }
        return result
    }, [product.price, product.tags, (product as any).rating, (product as any).isNew, getTagBadgeColor, t])

    const renderStars = useCallback((rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <StarIcon key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-warning-400 fill-current' : 'text-gray-300'}`} />
        ))
    }, [])

    useEffect(() => {
        if (imageList.length <= 1) {
            setCurrentImageIndex(0)
            return
        }
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % imageList.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [imageList])


    if (viewMode === 'list') {
        return (
            <Link href={`/products/${product.id}`} className={`group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-300 hover:-translate-y-0.5 transition-all duration-300 block ${className}`}>
                <div className="flex">
                    <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex-shrink-0 overflow-hidden bg-gray-50 flex items-center justify-center">
                        <div className="absolute inset-0">
                            {imageList.map((img, idx) => (
                                <img
                                    key={img}
                                    src={img}
                                    alt={product.productName}
                                    className={`absolute inset-0 w-full h-full object-contain p-2 transition-all duration-700 ${idx === currentImageIndex ? 'translate-x-0 opacity-100' : idx < currentImageIndex ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'}`}
                                    loading="lazy"
                                    onError={(e: any) => { e.target.src = '/images/placeholder.svg' }}
                                />
                            ))}
                        </div>
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {badges.slice(0, 3).map((badge, index) => (<span key={index} className={`${badge.color} text-white px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm`}>{badge.text}</span>))}
                        </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{product.brand?.name || 'N/A'}</div>
                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleLike(); }} className={`p-1.5 rounded-full transition-all z-10 relative ${isLiked ? 'text-danger-500 bg-danger-50' : 'text-gray-400 hover:text-danger-500 hover:bg-danger-50'}`}>
                                    {isLiked ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                                </button>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">{product.productName}</h3>
                            <div className="flex items-center gap-1 mb-2">
                                <div className="flex items-center">{renderStars((product as any).rating || 0)}</div>
                                <span className="text-xs text-gray-600 ml-1">({(product as any).rating || 0})</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{product.briefDescription}</p>
                        </div>
                        <div className="flex items-end justify-between mt-3">
                            <div>
                                <div className="text-xl font-bold text-primary-600">{formatPrice(product.price)}</div>
                                {(product as any).originalPrice && (product as any).originalPrice > product.price && (<div className="text-xs text-gray-400 line-through">{formatPrice((product as any).originalPrice)}</div>)}
                            </div>
                            <div className="text-xs text-gray-500">{t('sold')} {Math.floor(Math.random() * 1000) + 100}</div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/products/${product.id}`} className={`group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-300 hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col cursor-pointer ${className}`}>
            <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center">
                <div className="absolute inset-0">
                    {imageList.map((img, idx) => (
                        <img
                            key={img}
                            src={img}
                            alt={product.productName}
                            className={`absolute inset-0 w-full h-full object-contain p-4 transition-all duration-700 ${idx === currentImageIndex ? 'translate-x-0 opacity-100' : idx < currentImageIndex ? '-translate-x-full opacity-0' : 'translate-x-full opacity-0'}`}
                            loading="lazy"
                            onError={(e: any) => { e.target.src = '/images/placeholder.svg' }}
                        />
                    ))}
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {badges.slice(0, 3).map((badge, index) => (<span key={index} className={`${badge.color} text-white px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm`}>{badge.text}</span>))}
                </div>
                <div className="absolute top-2 right-2 z-10">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleToggleLike(); }} className={`p-2 rounded-full shadow-sm bg-white transition-all ${isLiked ? 'text-danger-500' : 'text-gray-600 hover:text-danger-500'}`}>
                        {isLiked ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            <div className="p-3 flex flex-col flex-1">
                <div className="text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wider">{product.brand?.name || 'N/A'}</div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors text-sm leading-snug">{product.productName}</h3>
                <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">{renderStars((product as any).rating || 0)}</div>
                    <span className="text-[11px] text-gray-600 ml-0.5">({(product as any).rating || 0})</span>
                </div>
                <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed flex-1">{product.briefDescription}</p>
                <div className="flex items-end justify-between mt-2">
                    <div>
                        <div className="text-lg font-bold text-primary-600">{formatPrice(product.price)}</div>
                        {(product as any).originalPrice && (product as any).originalPrice > product.price && (<div className="text-[11px] text-gray-400 line-through -mt-0.5">{formatPrice((product as any).originalPrice)}</div>)}
                    </div>
                    <div className="text-[11px] text-gray-500 pb-0.5">{t('sold')} {Math.floor(Math.random() * 1000) + 100}</div>
                </div>
            </div>
        </Link>
    )
}, (prevProps, nextProps) => {
    // OPTIMIZATION: More comprehensive comparison to prevent unnecessary re-renders
    return prevProps.product.id === nextProps.product.id 
        && prevProps.product.price === nextProps.product.price 
        && prevProps.product.imageURL === nextProps.product.imageURL
        && prevProps.product.productName === nextProps.product.productName
        && prevProps.viewMode === nextProps.viewMode 
        && prevProps.className === nextProps.className
})
