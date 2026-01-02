'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Tag,
  Tags,
  Warehouse,
  MapPin,
  FileText,
  Layers,
  Palette,
  ShieldCheck,
  Shield,
  LogOut,
  Menu,
  ChevronRight,
  ChevronDown,
  Wrench,
  Link2,
  Fan,
  Cog,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLanguageStore } from '@/store/languageStore'
import toast from 'react-hot-toast'

interface SubMenuItem {
  title: string
  href: string
}

interface MenuItem {
  title: string
  icon: React.ElementType
  href?: string
  children?: SubMenuItem[]
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['products'])
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { language } = useLanguageStore()

  const handleLogout = async () => {
    await logout()
    toast.success(language === 'vi' ? 'Đã đăng xuất thành công' : 'Logged out successfully')
    router.push('/auth/admin-login')
  }

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuTitle) 
        ? prev.filter(m => m !== menuTitle)
        : [...prev, menuTitle]
    )
  }

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    
    // Sản phẩm & Quạt
    { 
      title: language === 'vi' ? 'Sản phẩm & Quạt' : 'Products & Fans', 
      icon: Fan,
      children: [
        { title: language === 'vi' ? 'Tất cả sản phẩm' : 'All Products', href: '/admin/products' },
        { title: language === 'vi' ? 'Danh mục quạt' : 'Fan Categories', href: '/admin/categories' },
        { title: language === 'vi' ? 'Thương hiệu' : 'Brands', href: '/admin/brands' },
        { title: language === 'vi' ? 'Màu sắc' : 'Colors', href: '/admin/colors' },
      ]
    },
    
    // Phụ kiện
    { 
      title: language === 'vi' ? 'Phụ kiện' : 'Accessories', 
      icon: Wrench,
      children: [
        { title: language === 'vi' ? 'Danh sách phụ kiện' : 'All Accessories', href: '/admin/accessories' },
        { title: language === 'vi' ? 'Loại phụ kiện' : 'Accessory Types', href: '/admin/accessory-types' },
        { title: language === 'vi' ? 'Tương thích quạt' : 'Fan Compatibility', href: '/admin/accessory-compatibility' },
      ]
    },
    
    // Tags & Nhãn
    { 
      title: language === 'vi' ? 'Tags & Nhãn' : 'Tags & Labels', 
      icon: Tags,
      children: [
        { title: language === 'vi' ? 'Quản lý Tags' : 'Manage Tags', href: '/admin/tags' },
        { title: language === 'vi' ? 'Gán Tag sản phẩm' : 'Product Tags', href: '/admin/product-tags' },
      ]
    },
    
    // Đơn hàng & Bán hàng
    { 
      title: language === 'vi' ? 'Đơn hàng' : 'Orders', 
      icon: ShoppingCart,
      children: [
        { title: language === 'vi' ? 'Tất cả đơn hàng' : 'All Orders', href: '/admin/orders' },
        { title: language === 'vi' ? 'Đơn chờ xử lý' : 'Pending Orders', href: '/admin/orders?status=pending' },
        { title: language === 'vi' ? 'Vận chuyển' : 'Shipments', href: '/admin/shipments' },
      ]
    },
    
    // Bảo hành
    { title: language === 'vi' ? 'Bảo hành' : 'Warranty', icon: ShieldCheck, href: '/admin/warranties' },
    
    // Khách hàng & Nhân viên
    { 
      title: language === 'vi' ? 'Người dùng' : 'Users', 
      icon: Users,
      children: [
        { title: language === 'vi' ? 'Khách hàng' : 'Customers', href: '/admin/users' },
        { title: language === 'vi' ? 'Nhân viên' : 'Staff', href: '/admin/staff' },
      ]
    },
    
    // Kho & Cửa hàng
    { 
      title: language === 'vi' ? 'Kho & Cửa hàng' : 'Inventory', 
      icon: Warehouse,
      children: [
        { title: language === 'vi' ? 'Kho hàng' : 'Warehouses', href: '/admin/warehouses' },
        { title: language === 'vi' ? 'Cửa hàng' : 'Stores', href: '/admin/stores' },
        { title: language === 'vi' ? 'Yêu cầu xuất/nhập' : 'Inventory Requests', href: '/admin/inventory-requests' },
      ]
    },
    
    // Báo cáo & Thống kê
    { 
      title: language === 'vi' ? 'Báo cáo' : 'Reports', 
      icon: BarChart3,
      children: [
        { title: language === 'vi' ? 'Tổng quan' : 'Overview', href: '/admin/reports' },
        { title: language === 'vi' ? 'Thống kê bán hàng' : 'Sales Analytics', href: '/admin/analytics' },
        { title: language === 'vi' ? 'Báo cáo tồn kho' : 'Inventory Report', href: '/admin/reports/inventory' },
      ]
    },
    
    // Cài đặt
    { title: language === 'vi' ? 'Cài đặt' : 'Settings', icon: Settings, href: '/admin/settings' },
  ]

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.href) {
      return pathname === item.href
    }
    if (item.children) {
      return item.children.some(child => pathname === child.href || pathname?.startsWith(child.href.split('?')[0]))
    }
    return false
  }

  const isChildActive = (href: string): boolean => {
    return pathname === href || pathname?.startsWith(href.split('?')[0])
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-gray-900 z-40 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-11 h-11 bg-primary-500 rounded-xl flex items-center justify-center hover:bg-primary-600 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
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
            const isActive = isMenuActive(item)
            const Icon = item.icon
            const isExpanded = expandedMenus.includes(item.title)
            const hasChildren = item.children && item.children.length > 0

            if (hasChildren) {
              return (
                <div key={item.title}>
                  <button
                    onClick={() => !collapsed && toggleMenu(item.title)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="text-sm font-medium flex-1 text-left">{item.title}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {!collapsed && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-4">
                          {item.children?.map((child) => {
                            const isChildItemActive = isChildActive(child.href)
                            return (
                              <Link key={child.href} href={child.href}>
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                                  isChildItemActive 
                                    ? 'bg-primary-500 text-white' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isChildItemActive ? 'bg-white' : 'bg-gray-600'}`} />
                                  {child.title}
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            return (
              <Link key={item.href} href={item.href!}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer relative ${
                  isActive ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                } ${collapsed ? 'justify-center' : ''}`}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium flex-1">{item.title}</span>}
                  {isActive && !hasChildren && (
                    <motion.div layoutId="activeIndicator" className="absolute right-0 top-0 bottom-0 my-auto w-1 h-6 bg-white rounded-l-full" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-gray-800">
        <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@onlyfan.com'}</p>
            </div>
          )}
        </div>
        <button 
          onClick={handleLogout} 
          className={`mt-3 flex items-center justify-center gap-2 text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 rounded-xl transition-all ${
            collapsed ? 'w-10 h-10 mx-auto' : 'w-full px-3 py-2'
          }`} 
          title={language === 'vi' ? 'Đăng xuất' : 'Logout'}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">{language === 'vi' ? 'Đăng xuất' : 'Logout'}</span>}
        </button>
      </div>
    </motion.aside>
  )
}
