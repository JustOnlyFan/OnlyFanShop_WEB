'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Link from 'next/link'
import { ReactNode } from 'react'

interface FolderApp {
  title: string
  href: string
  Icon: React.ComponentType<any>
  accentClass: string
}

interface FolderModalProps {
  isOpen: boolean
  onClose: () => void
  folderName: string
  apps: FolderApp[]
}

export function FolderModal({ isOpen, onClose, folderName, apps }: FolderModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-700/50">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50">
                <h2 className="text-xl font-semibold text-white">{folderName}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {apps.map(({ title, href, Icon, accentClass }, index) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className="focus:outline-none"
                    >
                      <motion.div
                        className="group relative select-none cursor-pointer rounded-xl p-4 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 hover:border-gray-500 transition overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ y: -2, scale: 1.02 }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${accentClass} opacity-0 group-hover:opacity-20 transition-opacity`} />
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-lg bg-gray-600/50 border border-gray-500/50 flex items-center justify-center shadow group-hover:shadow-md transition mb-3">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-sm font-medium text-gray-200">{title}</p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}



