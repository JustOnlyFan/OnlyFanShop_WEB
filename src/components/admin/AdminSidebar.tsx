'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Tag,
  Warehouse,
  MapPin,
  FileText,
  Layers,
  Palette,
  Shield,
  LogOut,
  Menu,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất thành công')
    router.push('/auth/admin-login')
  }

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { title: 'Sản phẩm', icon: Package, href: '/admin/products' },
    { title: 'Danh mục', icon: Layers, href: '/admin/categories' },
    { title: 'Thương hiệu', icon: Tag, href: '/admin/brands' },
    { title: 'Màu sắc', icon: Palette, href: '/admin/colors' },
    { title: 'Đơn hàng', icon: ShoppingCart, href: '/admin/orders', badge: '12' },
    { title: 'Khách hàng', icon: Users, href: '/admin/users' },
    { title: 'Nhân viên', icon: Shield, href: '/admin/staff' },
    { title: 'Kho hàng', icon: Warehouse, href: '/admin/warehouses' },
    { title: 'Cửa hàng', icon: MapPin, href: '/admin/stores' },
    { title: 'Báo cáo', icon: FileText, href: '/admin/reports' },
    { title: 'Thống kê', icon: BarChart3, href: '/admin/analytics' },
    { title: 'Cài đặt', icon: Settings, href: '/admin/settings' },
  ]

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-[#0f172a] z-40 flex flex-col"
    >
      {/* Header with Menu Button */}
      <div className="p-4 flex items-center gap-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-white" />
          ) : (
            <Menu className="w-5 h-5 text-white" />
          )}
        </button>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h1 className="text-white text-lg font-bold leading-tight">OnlyFan</h1>
              <p className="text-gray-400 text-xs">Admin Panel</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer relative
                    ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section - User & Logout */}
      <div className="p-3 border-t border-gray-800">
        <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.fullName?.charAt(0).toUpperCase() ||
              user?.username?.charAt(0).toUpperCase() ||
              'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.fullName || user?.username || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'admin@onlyfan.com'}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={`
            mt-3 flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 
            rounded-xl transition-all
            ${collapsed ? 'w-10 h-10 mx-auto' : 'w-full px-3 py-2'}
          `}
          title="Đăng xuất"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Đăng xuất</span>}
        </button>
      </div>
    </motion.aside>
  )
}
