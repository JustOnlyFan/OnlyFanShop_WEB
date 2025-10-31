'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageFallbackProps {
  src: string
  alt: string
  fallbackSrc?: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  [key: string]: any
}

export function ImageFallback({ 
  src, 
  alt, 
  fallbackSrc = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format',
  className = '',
  ...props 
}: ImageFallbackProps) {
  const initialSrc = typeof src === 'string' && src.startsWith('http') ? src : fallbackSrc
  const [imgSrc, setImgSrc] = useState(initialSrc)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        unoptimized
        {...props}
      />
    </div>
  )
}

