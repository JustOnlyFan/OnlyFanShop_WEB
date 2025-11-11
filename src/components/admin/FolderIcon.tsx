'use client'

import { motion } from 'framer-motion'
import { Folder } from 'lucide-react'
import { ReactNode } from 'react'

interface FolderIconProps {
  title: string
  onClick: () => void
  accentClass?: string
  children?: ReactNode
}

export function FolderIcon({ title, onClick, accentClass = 'from-yellow-500/20 to-yellow-500/5 hover:from-yellow-500/30', children }: FolderIconProps) {
  return (
    <motion.div
      className="group relative select-none cursor-pointer rounded-2xl p-4 sm:p-5 bg-white/70 backdrop-blur border border-white/60 shadow-sm hover:shadow-lg transition overflow-hidden"
      whileHover={{ y: -2 }}
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accentClass} opacity-70 transition-opacity`} />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/80 border border-white/60 flex items-center justify-center shadow group-hover:shadow-md transition relative">
          <Folder className="w-7 h-7 sm:w-8 sm:h-8 text-gray-800" />
          {/* Show app icons inside folder */}
          {children && (
            <div className="absolute inset-0 p-1 grid grid-cols-2 gap-0.5">
              {children}
            </div>
          )}
        </div>
        <p className="mt-3 text-xs sm:text-sm font-medium text-gray-800">{title}</p>
      </div>
    </motion.div>
  )
}



