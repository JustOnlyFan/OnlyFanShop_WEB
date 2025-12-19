'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Bars3Icon,
    XMarkIcon,
    ShoppingCartIcon,
    UserIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Bell } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

import CategoryService from '@/services/categoryService'

import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useLanguageStore } from '@/store/languageStore'
import { useNotification } from '@/hooks/useNotification'

import { SearchModal } from '@/components/modals/SearchModal'
import { NotificationModal } from '@/components/modals/NotificationModal'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { FanIcon, AccessoryIcon, BrandIcon, ContactIcon, ChevronRightIcon } from '@/components/layout/icons'

import { CategoryDTO, CategoryType } from '@/types'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)

    const [showMegaMenu, setShowMegaMenu] = useState(false)
    const [activeCategory, setActiveCategory] = useState<'fan' | 'accessory' | 'brand'>('fan')

    const [fanCategories, setFanCategories] = useState<CategoryDTO[]>([])
    const [accessoryCategories, setAccessoryCategories] = useState<CategoryDTO[]>([])

    const megaMenuRef = useRef<HTMLDivElement>(null)

    const router = useRouter()
    const pathname = usePathname()

    const { user, isAuthenticated } = useAuthStore()
    const { totalItems } = useCartStore()
    const { notifications } = useNotification()
    useLanguageStore()

    const isAdminRoute = pathname?.startsWith('/admin')
    const isStaffRoute = pathname?.startsWith('/staff')
    const isAdminOrStaffRoute = isAdminRoute || isStaffRoute

    /* ================= FETCH CATEGORIES ================= */
    useEffect(() => {
        if (isAdminOrStaffRoute) return

        const fetchData = async () => {
            const [fans, accessories] = await Promise.all([
                CategoryService.getCategoryTree(CategoryType.FAN_TYPE),
                CategoryService.getCategoryTree(CategoryType.ACCESSORY_TYPE),
            ])
            setFanCategories(fans)
            setAccessoryCategories(accessories)
        }

        fetchData()
    }, [isAdminOrStaffRoute])

    /* ================= CLICK OUTSIDE ================= */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
                setShowMegaMenu(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <>
            <header className="sticky top-0 z-[60] bg-primary-600 text-white shadow">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
                    {/* LOGO */}
                    <Link href="/" className="flex items-center gap-2 font-bold">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">F</div>
                        OnlyFan
                    </Link>

                    {/* CATEGORY BUTTON */}
                    {!isAdminOrStaffRoute && (
                        <div
                            ref={megaMenuRef}
                            className="relative hidden lg:block"
                            onMouseEnter={() => setShowMegaMenu(true)}
                            onMouseLeave={() => setShowMegaMenu(false)}
                        >
                            <button className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm hover:bg-white/10">
                                <Bars3Icon className="h-5 w-5" />
                                Danh mục
                            </button>

                            <AnimatePresence>
                                {showMegaMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute left-0 top-full z-[100] mt-0 overflow-hidden rounded-b-2xl bg-white text-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                                    >
                                        <div className="flex">
                                            {/* LEFT SIDEBAR */}
                                            <div className="w-56 shrink-0 bg-gray-50 py-3">
                                                <MegaMenuItem 
                                                    icon={<FanIcon />}
                                                    label="Quạt điện" 
                                                    active={activeCategory === 'fan'} 
                                                    onHover={() => setActiveCategory('fan')} 
                                                />
                                                <MegaMenuItem 
                                                    icon={<AccessoryIcon />}
                                                    label="Phụ kiện quạt" 
                                                    active={activeCategory === 'accessory'} 
                                                    onHover={() => setActiveCategory('accessory')} 
                                                />
                                                <MegaMenuItem 
                                                    icon={<BrandIcon />}
                                                    label="Thương hiệu" 
                                                    active={activeCategory === 'brand'} 
                                                    onHover={() => setActiveCategory('brand')} 
                                                />
                                                
                                                <div className="mx-4 my-3 border-t border-gray-200" />
                                                
                                                <Link
                                                    href="/contact"
                                                    onClick={() => setShowMegaMenu(false)}
                                                    className="mx-2 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-gray-600 transition-all hover:bg-white hover:text-primary-600"
                                                >
                                                    <ContactIcon />
                                                    <span>Liên hệ tư vấn</span>
                                                </Link>
                                            </div>

                                            {/* RIGHT CONTENT */}
                                            <div className="w-[580px] border-l border-gray-100 bg-white p-5">
                                                {activeCategory === 'fan' && (
                                                    <MegaContent
                                                        title="Quạt điện"
                                                        items={fanCategories}
                                                        baseHref="/products"
                                                        onClick={() => setShowMegaMenu(false)}
                                                        color="blue"
                                                    />
                                                )}

                                                {activeCategory === 'accessory' && (
                                                    <MegaContent
                                                        title="Phụ kiện quạt"
                                                        items={accessoryCategories}
                                                        baseHref="/products/accessories"
                                                        onClick={() => setShowMegaMenu(false)}
                                                        color="amber"
                                                    />
                                                )}

                                                {activeCategory === 'brand' && (
                                                    <div>
                                                        <div className="mb-4 flex items-center justify-between">
                                                            <h3 className="text-lg font-bold text-gray-800">Thương hiệu nổi bật</h3>
                                                            <Link
                                                                href="/brands"
                                                                onClick={() => setShowMegaMenu(false)}
                                                                className="text-sm font-medium text-primary-600 hover:text-primary-700"
                                                            >
                                                                Xem tất cả →
                                                            </Link>
                                                        </div>
                                                        <div className="grid grid-cols-4 gap-3">
                                                            {['Panasonic', 'Mitsubishi', 'Toshiba', 'Asia', 'Senko', 'Lifan', 'Sunhouse', 'Midea'].map((brand) => (
                                                                <Link
                                                                    key={brand}
                                                                    href={`/brands/${brand.toLowerCase()}`}
                                                                    onClick={() => setShowMegaMenu(false)}
                                                                    className="flex h-16 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 px-3 text-sm font-medium text-gray-700 transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
                                                                >
                                                                    {brand}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 rounded-xl bg-gradient-to-r from-primary-500 to-blue-500 p-4 text-white">
                                                            <p className="text-sm font-medium">🎁 Ưu đãi đặc biệt</p>
                                                            <p className="mt-1 text-xs opacity-90">Giảm đến 30% cho sản phẩm chính hãng</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* SEARCH */}
                    {!isAdminOrStaffRoute && (
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden flex-1 items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/20 md:flex"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                            Tìm kiếm sản phẩm...
                        </button>
                    )}

                    {/* RIGHT */}
                    <div className="ml-auto flex items-center gap-1">
                        <LanguageSwitcher />

                        {!isAdminOrStaffRoute && (
                            <button onClick={() => setIsNotificationOpen(true)} className="relative rounded-lg p-2 hover:bg-white/10">
                                <Bell className="h-5 w-5" />
                                {notifications.length > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs">
                    {notifications.length}
                  </span>
                                )}
                            </button>
                        )}

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
                            <Link href="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10">
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

            {!isAdminOrStaffRoute && (
                <>
                    <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
                    <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                </>
            )}
        </>
    )
}

/* ================= SUB COMPONENTS ================= */

function MegaMenuItem({ icon, label, active, onHover }: { icon: React.ReactNode; label: string; active: boolean; onHover: () => void }) {
    return (
        <div
            onMouseEnter={onHover}
            className={`mx-2 flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-sm transition-all ${
                active 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-700 hover:bg-white hover:text-primary-600'
            }`}
        >
            <div className="flex items-center gap-3">
                <span className={active ? 'text-primary-500' : 'text-gray-400'}>{icon}</span>
                <span className="font-medium">{label}</span>
            </div>
            <ChevronRightIcon />
        </div>
    )
}

function MegaContent({
    title,
    items,
    baseHref,
    onClick,
    color,
}: {
    title: string
    items: CategoryDTO[]
    baseHref: string
    onClick: () => void
    color: 'blue' | 'amber'
}) {
    const colorClasses = {
        blue: {
            dot: 'bg-blue-400 group-hover:bg-blue-600',
            hover: 'hover:bg-blue-50 hover:text-blue-700',
            badge: 'bg-blue-100 text-blue-700',
        },
        amber: {
            dot: 'bg-amber-400 group-hover:bg-amber-600',
            hover: 'hover:bg-amber-50 hover:text-amber-700',
            badge: 'bg-amber-100 text-amber-700',
        },
    }
    const colors = colorClasses[color]

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.badge}`}>
                        {items.length} loại
                    </span>
                </div>
                <Link
                    href={baseHref}
                    onClick={onClick}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                    Xem tất cả →
                </Link>
            </div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                {items.slice(0, 15).map((c) => (
                    <Link
                        key={c.id}
                        href={`${baseHref}?categoryId=${c.id}`}
                        onClick={onClick}
                        className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-all ${colors.hover}`}
                    >
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${colors.dot}`} />
                        <span className="truncate">{c.name}</span>
                    </Link>
                ))}
            </div>
            {items.length > 15 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                    <Link
                        href={baseHref}
                        onClick={onClick}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                        Xem thêm {items.length - 15} danh mục khác
                        <ChevronRightIcon />
                    </Link>
                </div>
            )}
        </div>
    )
}
