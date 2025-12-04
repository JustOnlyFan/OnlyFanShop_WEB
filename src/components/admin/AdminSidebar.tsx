'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  ChevronLeft,
  ChevronRight,
  Layers,
  Palette,
  Shield,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất thành công');
    router.push('/auth/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin',
      badge: null
    },
    {
      title: 'Sản phẩm',
      icon: Package,
      href: '/admin/products',
      badge: null
    },
    {
      title: 'Danh mục',
      icon: Layers,
      href: '/admin/categories',
      badge: null
    },
    {
      title: 'Thương hiệu',
      icon: Tag,
      href: '/admin/brands',
      badge: null
    },
    {
      title: 'Màu sắc',
      icon: Palette,
      href: '/admin/colors',
      badge: null
    },
    {
      title: 'Đơn hàng',
      icon: ShoppingCart,
      href: '/admin/orders',
      badge: '12'
    },
    {
      title: 'Khách hàng',
      icon: Users,
      href: '/admin/users',
      badge: null
    },
    {
      title: 'Nhân viên',
      icon: Shield,
      href: '/admin/staff',
      badge: null
    },
    {
      title: 'Kho hàng',
      icon: Warehouse,
      href: '/admin/warehouses',
      badge: null
    },
    {
      title: 'Cửa hàng',
      icon: MapPin,
      href: '/admin/stores',
      badge: null
    },
    {
      title: 'Báo cáo',
      icon: FileText,
      href: '/admin/reports',
      badge: null
    },
    {
      title: 'Thống kê',
      icon: BarChart3,
      href: '/admin/analytics',
      badge: null
    },
    {
      title: 'Cài đặt',
      icon: Settings,
      href: '/admin/settings',
      badge: null
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg z-40 overflow-hidden flex flex-col"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-10 w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:from-blue-700 hover:to-cyan-700 transition-all hover:scale-110 z-[100] border-2 border-white"
      >
        {collapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
      </button>

      {/* App Header */}
      {!collapsed && (
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">OnlyFan</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  
                  {!collapsed && (
                    <>
                      <span className="font-medium flex-1">{item.title}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-xs font-bold rounded-full
                          ${isActive ? 'bg-white/20 text-white' : 'bg-red-500 text-white'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200">
        {/* Dark Mode Toggle */}
        {!collapsed && (
          <div className="px-6 py-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <motion.div
                  animate={{ x: darkMode ? 24 : 2 }}
                  transition={{ duration: 0.2 }}
                  className="w-5 h-5 bg-white rounded-full mt-0.5 shadow-md"
                />
              </div>
            </button>
          </div>
        )}

        {/* User Info */}
        {!collapsed && (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-600 truncate">{user?.email || 'admin@onlyfan.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 rounded-xl transition-all border border-red-200 hover:border-red-300 font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
        
        {/* Collapsed User Info with Logout */}
        {collapsed && (
          <div className="px-3 py-4 flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center bg-white hover:bg-red-50 text-red-600 rounded-xl transition-all border border-red-200 hover:border-red-300"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
