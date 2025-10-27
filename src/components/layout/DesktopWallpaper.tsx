'use client'

import { useState, useEffect } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import { BannerService, Banner } from '@/services/bannerService'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export function DesktopWallpaper() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [banners, setBanners] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock banners data
  useEffect(() => {
    const mockBanners = [
      {
        id: 1,
        title: 'OnlyFan Shop',
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&h=1080&fit=crop&q=80&auto=format',
        description: 'Khám phá bộ sưu tập quạt điện cao cấp'
      },
      {
        id: 2,
        title: 'Công nghệ tiên tiến',
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1920&h=1080&fit=crop&q=80&auto=format',
        description: 'Quạt điện với công nghệ hiện đại'
      }
    ]
    setBanners(mockBanners)
  }, [])

  // Auto-rotate wallpapers every 15 seconds
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
      }, 15000)

      return () => clearInterval(interval)
    }
  }, [banners.length])

  // If no banners, show default gradient wallpaper
  if (!banners.length) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Animated particles - fixed positions to avoid hydration mismatch */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7) % 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  const currentBanner = banners[currentBannerIndex]

  return (
    <div className="fixed inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBannerIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <Image
            src={currentBanner.imageUrl}
            alt={currentBanner.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
        </motion.div>
      </AnimatePresence>

      {/* Wallpaper Content Overlay */}
      <div className="absolute bottom-20 left-8 text-white max-w-2xl z-10">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {currentBanner.title}
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-gray-200 mb-6 drop-shadow-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {currentBanner.description}
        </motion.p>
        {currentBanner.linkUrl && (
          <motion.a
            href={currentBanner.linkUrl}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Khám phá ngay
          </motion.a>
        )}
      </div>

      {/* Wallpaper Navigation Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-8 left-8 flex space-x-2 z-10">
          {banners.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBannerIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
    </div>
  )
}
