'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ImageFallbackProps {
  src?: string
  alt: string
  fallbackSrc?: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  [key: string]: any
}

// Animated Fan SVG Component
function AnimatedFan({ className = '' }: { className?: string }) {
  return (
    <motion.div 
      className={`relative ${className}`}
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ transformOrigin: 'center' }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fan Center - stays fixed */}
        <circle cx="100" cy="100" r="15" fill="currentColor" className="text-gray-400" />
        
        {/* Fan Blades */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * 90) * (Math.PI / 180)
          const bladeX = 100
          const bladeY = 60
          return (
            <g key={i} transform={`rotate(${i * 90} 100 100)`}>
              <ellipse
                cx={bladeX}
                cy={bladeY}
                rx="35"
                ry="60"
                fill="currentColor"
                className="text-blue-300 opacity-70"
              />
              <ellipse
                cx={bladeX}
                cy={bladeY}
                rx="30"
                ry="55"
                fill="currentColor"
                className="text-blue-400 opacity-50"
              />
            </g>
          )
        })}
        
        {/* Outer Ring */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 opacity-30"
        />
      </svg>
    </motion.div>
  )
}

// Animated Product Placeholder
function AnimatedProductPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background gradient animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Central animated fan icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatedFan className="w-24 h-24 text-blue-500" />
      </div>
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

export function ImageFallback({ 
  src, 
  alt, 
  fallbackSrc,
  className = '',
  fill,
  width,
  height,
  ...props 
}: ImageFallbackProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showAnimation, setShowAnimation] = useState(true)

  useEffect(() => {
    // Always show animation instead of trying to load image
    setIsLoading(false)
    setShowAnimation(true)
  }, [])

  // If we have a valid image URL, we can still try to load it, but show animation as fallback
  const shouldUseAnimation = !src || hasError || showAnimation

  if (shouldUseAnimation) {
    return (
      <div 
        className={`relative ${fill ? 'absolute inset-0' : ''} ${className}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        <AnimatedProductPlaceholder className="w-full h-full rounded-lg" />
        {alt && (
          <span className="sr-only">{alt}</span>
        )}
      </div>
    )
  }

  // Fallback: if we somehow get here with a valid image, show a simple placeholder
  return (
    <div 
      className={`relative ${fill ? 'absolute inset-0' : ''} ${className}`}
      style={!fill && width && height ? { width, height } : undefined}
    >
      <AnimatedProductPlaceholder className="w-full h-full rounded-lg" />
      {alt && (
        <span className="sr-only">{alt}</span>
      )}
    </div>
  )
}

