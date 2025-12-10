'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
    Bars3Icon,
    XMarkIcon,
    ShoppingCartIcon,
    UserIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { Bell } from 'lucide-react'
import { AuthService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useNotification } from '@/hooks/useNotification'
import { SearchModal } from '@/components/modals/SearchModal'
// Removed CartDrawer drawer in favor of in-layout cart page
import { NotificationModal } from '@/components/modals/NotificationModal'
import { motion } from 'framer-motion'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    // Drawer removed; navigate to /cart instead
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { user, isAuthenticated, logout } = useAuthStore()
    
    const isAdminRoute = pathname?.startsWith('/admin')
    const isStaffRoute = pathname?.startsWith('/staff')
    const isAdminOrStaffRoute = isAdminRoute || isStaffRoute
    const { totalItems } = useCartStore()
    const { notifications } = useNotification()

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
        { name: 'Trang chủ', href: '/' },
        { name: 'Sản phẩm', href: '/products' },
        { name: 'Thương hiệu', href: '/brands' },
        { name: 'Liên hệ', href: '/contact' },
    ];

    return (
        <>
            <header className="relative overflow-visible bg-gradient-to-r from-indigo-700 via-blue-600 to-fuchsia-700 sticky top-0 z-50 h-16 text-white">
                {/* Background Effects - Always render */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-70 z-0"
                    style={{
                        background: 'linear-gradient(90deg, rgba(99,102,241,0.35), rgba(59,130,246,0.35), rgba(168,85,247,0.35), rgba(236,72,153,0.35))',
                        backgroundSize: '200% 100%',
                        animation: 'gradient-shift 8s ease infinite'
                    }}
                />

                {/* Animated shimmer sweep */}
                <motion.div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"
                    initial={{ x: '-100%' }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />

                {/* Glitter overlay */}
                <motion.div
                    className="pointer-events-none absolute inset-0 opacity-20 z-0"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
                        backgroundSize: '18px 18px'
                    }}
                    animate={{ opacity: [0.08, 0.18, 0.08] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Ambient blur orbs */}
                <div className="pointer-events-none absolute -top-10 -left-10 w-56 h-56 bg-fuchsia-500/20 blur-3xl rounded-full z-0" />
                <div className="pointer-events-none absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full z-0" />

                <div className="relative z-10 px-4 sm:px-6 lg:px-8">
                    {isAdminOrStaffRoute ? (
                        // Admin/Staff Layout - Logo centered
                        <div className="flex justify-center items-center h-16">
                            <Link href={isAdminRoute ? "/admin" : "/staff"} className="flex items-center">
                                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">F</span>
                                </div>
                                <span className="ml-2 text-xl font-bold text-white drop-shadow-lg">OnlyFan</span>
                            </Link>
                        </div>
                    ) : (
                        // Customer Layout - Full navigation
                        <div className="flex justify-between items-center h-16">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <Link href="/" className="flex items-center">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-lg">F</span>
                                    </div>
                                    <span className="ml-2 text-xl font-bold text-white drop-shadow-lg">OnlyFan</span>
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex space-x-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="text-white/90 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200 drop-shadow-sm"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>

                            {/* Right Side Actions */}
                            <div className="flex items-center space-x-4">
                                {/* Search Button */}
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-2 text-white/90 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-lg"
                                    aria-label="Tìm kiếm"
                                >
                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                </button>

                                {/* Notification Button */}
                                <button
                                    onClick={() => setIsNotificationOpen(true)}
                                    className="relative p-2 text-white/90 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-lg"
                                    aria-label="Thông báo"
                                >
                                    <Bell className="w-5 h-5" />
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                                    )}
                                </button>

                                {/* Cart Button */}
                                <button
                                    onClick={() => router.push('/cart')}
                                    className="relative p-2 text-white/90 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-lg"
                                    aria-label="Giỏ hàng"
                                >
                                    <ShoppingCartIcon className="w-5 h-5" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg">
                      {totalItems}
                    </span>
                                    )}
                                </button>

                                {/* User Menu */}
                                {isAuthenticated ? (
                                    <Link 
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div className="hidden sm:block text-left">
                                            <p className="text-sm font-semibold text-white">{user?.fullName || user?.username}</p>
                                            {user?.role === 'ADMIN' && (
                                                <span className="text-xs text-yellow-300 font-medium">Admin</span>
                                            )}
                                            {user?.role === 'STAFF' && (
                                                <span className="text-xs text-blue-300 font-medium">Nhân viên</span>
                                            )}
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href="/auth/login"
                                            className="px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 rounded-xl transition-all duration-200 border border-white/30 hover:border-white/50"
                                        >
                                            Đăng nhập
                                        </Link>
                                        <Link
                                            href="/auth/register"
                                            className="px-5 py-2.5 bg-gradient-to-r from-white to-blue-50 text-blue-700 rounded-xl text-sm font-semibold hover:shadow-xl transition-all duration-200 shadow-lg hover:scale-105"
                                        >
                                            Đăng ký
                                        </Link>
                                    </div>
                                )}

                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="md:hidden p-2 text-white/90 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-lg"
                                    aria-label="Menu"
                                >
                                    {isMenuOpen ? (
                                        <XMarkIcon className="w-6 h-6" />
                                    ) : (
                                        <Bars3Icon className="w-6 h-6" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mobile Navigation (Customer only) */}
                    {!isAdminOrStaffRoute && isMenuOpen && (
                        <motion.div
                            className="md:hidden border-t border-white/20 mt-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block px-3 py-2 text-base font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                {!isAuthenticated && (
                                    <div className="pt-4 pb-3 border-t border-white/20">
                                        <div className="flex items-center px-3 mb-3">
                                            <div className="flex-shrink-0">
                                                <UserIcon className="w-8 h-8 text-white/70" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-base font-medium text-white">
                                                    Khách
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1 px-2">
                                            <Link
                                                href="/auth/login"
                                                className="block px-3 py-2 text-base font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Đăng nhập
                                            </Link>
                                            <Link
                                                href="/auth/register"
                                                className="block px-3 py-2 text-base font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Đăng ký
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                <style jsx global>{`
          @keyframes gradient-shift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
        `}</style>
            </header>

            {/* Modals (Customer only) */}
            {!isAdminOrStaffRoute && (
                <>
                    <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                    <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                </>
            )}
        </>
    )
}