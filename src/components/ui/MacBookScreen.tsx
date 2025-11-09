'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface MacBookScreenProps {
  children: ReactNode
  className?: string
}

export function MacBookScreen({ children, className = '' }: MacBookScreenProps) {
  return (
    <div className={`flex justify-center items-end h-full pb-9 md:pb-[52px] lg:pb-[64px] ${className}`}>
      <motion.div
        className="relative -translate-x-16"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* MacBook Base */}
        <div className="relative w-[1600px] h-[800px] bg-gray-900 rounded-2xl shadow-2xl z-40">
          {/* MacBook Screen */}
          <div className="absolute inset-0 bg-black rounded-xl overflow-hidden">
            {/* Screen Content */}
            <div className="w-full h-full bg-white relative">
              {/* Screen Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
              
              {/* Content Container */}
              <div className="relative z-50 w-full h-full overflow-hidden bg-white">
                {children}
              </div>
            </div>
          </div>
          
          {/* MacBook Camera */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-700 rounded-full"></div>
          
          {/* MacBook Hinge */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gray-800 rounded-full"></div>
        </div>
        
        {/* MacBook Stand */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-gray-700 rounded-full shadow-lg"></div>
        
        {/* Screen Reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none"></div>
        
        {/* Ambient Light */}
        <div className="absolute -inset-8 bg-gradient-radial from-blue-500/20 via-transparent to-transparent rounded-full blur-3xl"></div>
      </motion.div>
    </div>
  )
}
