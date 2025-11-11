'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { AuthService } from '@/services/authService'
import { 
  Users,
  Package,
  Tags,
  Grid3X3,
  MessagesSquare,
  Store,
  Bell,
  ShoppingCart,
  BarChart3,
  Megaphone,
  ShieldCheck,
  Palette,
  Warehouse
} from 'lucide-react'

interface DesktopAppIcon {
  title: string
  href: string
  Icon: React.ComponentType<any>
  accentClass: string
}

const apps: DesktopAppIcon[] = [
  { title: 'User Management', href: '/admin/users', Icon: Users, accentClass: 'from-blue-500/20 to-blue-500/5 hover:from-blue-500/30' },
  { title: 'Warehouse Management', href: '/admin/warehouses', Icon: Warehouse, accentClass: 'from-orange-500/20 to-orange-500/5 hover:from-orange-500/30' },
  { title: 'Brand Management', href: '/admin/brands', Icon: Tags, accentClass: 'from-purple-500/20 to-purple-500/5 hover:from-purple-500/30' },
  { title: 'Category Management', href: '/admin/categories', Icon: Grid3X3, accentClass: 'from-amber-500/20 to-amber-500/5 hover:from-amber-500/30' },
  { title: 'Color Management', href: '/admin/colors', Icon: Palette, accentClass: 'from-pink-500/20 to-pink-500/5 hover:from-pink-500/30' },
  { title: 'Warranty Management', href: '/admin/warranties', Icon: ShieldCheck, accentClass: 'from-teal-500/20 to-teal-500/5 hover:from-teal-500/30' },
  { title: 'Chat Management', href: '/admin/chat', Icon: MessagesSquare, accentClass: 'from-cyan-500/20 to-cyan-500/5 hover:from-cyan-500/30' },
  { title: 'Store Management', href: '/admin/stores', Icon: Store, accentClass: 'from-rose-500/20 to-rose-500/5 hover:from-rose-500/30' },
  { title: 'Order Management', href: '/admin/orders', Icon: ShoppingCart, accentClass: 'from-emerald-500/20 to-emerald-500/5 hover:from-emerald-500/30' },
  { title: 'Analytics', href: '/admin/analytics', Icon: BarChart3, accentClass: 'from-indigo-500/20 to-indigo-500/5 hover:from-indigo-500/30' },
  { title: 'Promotions', href: '/admin/promotions', Icon: Megaphone, accentClass: 'from-fuchsia-500/20 to-fuchsia-500/5 hover:from-fuchsia-500/30' },
]

export function AdminDesktop({ username = 'admin' }: { username?: string }) {
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await AuthService.logout()
    } finally {
      logout()
      router.push('/auth/login')
    }
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {/* Logout button - bottom right */}
        <button
          onClick={handleLogout}
          className="absolute bottom-4 right-4 z-50 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium shadow hover:bg-red-500 active:bg-red-700 transition"
          aria-label="Đăng xuất"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Đăng xuất
        </button>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500/20">
              <Image src="/images/placeholder.svg" alt="avatar" width={48} height={48} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Welcome back</p>
              <p className="text-lg font-semibold text-gray-900">{username}</p>
            </div>
          </div>
          <button aria-label="notifications" className="relative p-2 rounded-xl bg-white/60 backdrop-blur shadow-sm hover:shadow transition"> 
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">3</span>
          </button>
        </div>

        <div className="flex-1 px-6 pb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-6">
            {apps.map(({ title, href, Icon, accentClass }, index) => (
              <Link key={href} href={href} className="focus:outline-none">
                <motion.div
                  className={`group relative select-none cursor-pointer rounded-2xl p-4 sm:p-5 bg-white/70 backdrop-blur border border-white/60 shadow-sm hover:shadow-lg transition overflow-hidden`}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.04, duration: 0.4, ease: 'easeOut' }}
                  whileHover={{ y: -2 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${accentClass} opacity-70 transition-opacity`} />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/80 border border-white/60 flex items-center justify-center shadow group-hover:shadow-md transition">
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-800" />
                    </div>
                    <p className="mt-3 text-xs sm:text-sm font-medium text-gray-800">{title}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDesktop


