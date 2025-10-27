'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  HomeIcon,
  ShoppingBagIcon, 
  BuildingStorefrontIcon,
  PhoneIcon,
  UserIcon,
  ShoppingCartIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  PowerIcon
} from '@heroicons/react/24/outline'

interface DesktopStartMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function DesktopStartMenu({ isOpen, onClose }: DesktopStartMenuProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const menuItems = [
    { name: 'Trang chủ', href: '/', icon: HomeIcon, color: 'bg-blue-500' },
    { name: 'Sản phẩm', href: '/products', icon: ShoppingBagIcon, color: 'bg-green-500' },
    { name: 'Thương hiệu', href: '/brands', icon: BuildingStorefrontIcon, color: 'bg-purple-500' },
    { name: 'Liên hệ', href: '/contact', icon: PhoneIcon, color: 'bg-orange-500' },
    { name: 'Giỏ hàng', href: '/cart', icon: ShoppingCartIcon, color: 'bg-pink-500' },
    { name: 'Thông báo', href: '/notifications', icon: BellIcon, color: 'bg-yellow-500' },
  ]

  const systemItems = [
    { name: 'Cài đặt', href: '/settings', icon: Cog6ToothIcon },
    { name: 'Đăng xuất', href: '/logout', icon: PowerIcon },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          {/* Start Menu */}
          <motion.div
            className="absolute bottom-16 left-4 w-80 bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{item.name}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* System Items */}
            <div className="border-t border-gray-700 p-4">
              <div className="space-y-2">
                {systemItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-300">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Info */}
            <div className="border-t border-gray-700 p-4 bg-gray-900/50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">Khách</div>
                  <div className="text-gray-400 text-sm">Chưa đăng nhập</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

