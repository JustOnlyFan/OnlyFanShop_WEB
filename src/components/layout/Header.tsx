'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Bars3Icon,
    XMarkIcon,
    ShoppingCartIcon,
    UserIcon,
} from '@heroicons/react/24/outline'

import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useLanguageStore } from '@/store/languageStore'

import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const router = useRouter()
    const pathname = usePathname()

    const { user, isAuthenticated } = useAuthStore()
    const { totalItems } = useCartStore()
    useLanguageStore()

    const isAdminRoute = pathname?.startsWith('/admin')
    const isStaffRoute = pathname?.startsWith('/staff')
    const isAdminOrStaffRoute = isAdminRoute || isStaffRoute

    return (
        <>
            <header className="sticky top-0 z-[60] bg-primary-600 text-white shadow">
                <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    {/* LOGO */}
                    <Link href="/" className="flex items-center gap-2 font-bold pl-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">F</div>
                        <span className="hidden sm:block">OnlyFan</span>
                    </Link>

                    {!isAdminOrStaffRoute && (
                        <>
                            <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 lg:flex">
                                <Link
                                    href="/"
                                    className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                                >
                                    Trang chủ
                                </Link>
                                <Link
                                    href="/products"
                                    className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                                >
                                    Quạt
                                </Link>
                                <Link
                                    href="/products/accessories"
                                    className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                                >
                                    Phụ kiện
                                </Link>
                                <Link
                                    href="/brands"
                                    className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                                >
                                    Thương hiệu
                                </Link>
                                <Link
                                    href="/contact"
                                    className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                                >
                                    Liên hệ
                                </Link>
                            </nav>

                            {/* MOBILE MENU */}
                            {isMenuOpen && (
                                <div className="absolute left-0 top-full z-50 w-full bg-primary-600 shadow-lg lg:hidden">
                                    <nav className="flex flex-col gap-1 p-4">
                                        <Link
                                            href="/"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
                                        >
                                            Trang chủ
                                        </Link>
                                        <Link
                                            href="/products"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
                                        >
                                            Quạt
                                        </Link>
                                        <Link
                                            href="/products/accessories"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
                                        >
                                            Phụ kiện
                                        </Link>
                                        <Link
                                            href="/brands"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
                                        >
                                            Thương hiệu
                                        </Link>
                                        <Link
                                            href="/contact"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10"
                                        >
                                            Liên hệ
                                        </Link>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}

                    {/* RIGHT */}
                    <div className="flex items-center gap-2 pr-4">
                        <LanguageSwitcher />

                        {!isAdminOrStaffRoute && (
                            <button onClick={() => router.push('/cart')} className="relative rounded-lg p-2 hover:bg-white/10">
                                <ShoppingCartIcon className="h-5 w-5" />
                                {totalItems > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs">
                    {totalItems}
                  </span>
                                )}
                            </button>
                        )}

                        {isAuthenticated ? (
                            <Link href="/profile" className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/10">
                                <UserIcon className="h-5 w-5" />
                                <span className="hidden text-sm sm:block">{user?.fullName || user?.username}</span>
                            </Link>
                        ) : (
                            <Link href="/auth/login" className="rounded-lg px-3 py-2 text-sm hover:bg-white/10">Đăng nhập</Link>
                        )}

                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-lg p-2 hover:bg-white/10 lg:hidden">
                            {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </header>
        </>
    )
}