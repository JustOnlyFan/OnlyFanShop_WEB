'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { HomeIcon, ShoppingBagIcon, BuildingStorefrontIcon, PhoneIcon, UserIcon, ShoppingCartIcon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

import { AuthService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { SearchModal } from '@/components/modals/SearchModal'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function Taskbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const router = useRouter()

  const { user, isAuthenticated, logout } = useAuthStore()
  const { totalItems } = useCartStore()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
      logout()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: HomeIcon },
    { name: 'Sản phẩm', href: '/products', icon: ShoppingBagIcon },
    { name: 'Thương hiệu', href: '/brands', icon: BuildingStorefrontIcon },
    { name: 'Liên hệ', href: '/contact', icon: PhoneIcon },
  ]

  return (
    <>
      {/* Windows-style Taskbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between h-12 px-4">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <button
              className="flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-white text-sm font-medium">OnlyFan</span>
            </button>
          </div>

          {/* Center - Navigation items */}
          <div className="flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-gray-800 transition-colors group"
              >
                <item.icon className="w-4 h-4 text-gray-300 group-hover:text-white" />
                <span className="text-gray-300 text-sm group-hover:text-white">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right side - System tray equivalent */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
              title="Tìm kiếm"
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors relative" title="Thông báo">
              <BellIcon className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors relative"
              title="Giỏ hàng"
            >
              <ShoppingCartIcon className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                    title="Tài khoản"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm">{user?.username}</span>
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Thông tin cá nhân
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Đơn hàng
                        </Link>
                        <Link
                          href="/wishlist"
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Yêu thích
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsUserMenuOpen(false)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/auth/login"
                    className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/auth/register"
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
