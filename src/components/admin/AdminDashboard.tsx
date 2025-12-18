'use client';

import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreHorizontal,
  Shield,
  Store,
  Palette,
  Tags,
  Warehouse,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { AdminStats } from './ui/AdminStats';
import { AdminCard, AdminCardHeader, AdminCardBody } from './ui/AdminCard';
import { AdminBadge } from './ui/AdminBadge';
import { AdminButton } from './ui/AdminButton';

export function AdminDashboard() {
  // TODO: Replace with actual API data
  const stats = [
    { title: 'Tổng doanh thu', value: '₫0', change: '+0%', trend: 'up' as const, icon: <DollarSign className="w-6 h-6" />, color: 'green' as const },
    { title: 'Đơn hàng', value: '0', change: '+0%', trend: 'up' as const, icon: <ShoppingCart className="w-6 h-6" />, color: 'blue' as const },
    { title: 'Khách hàng', value: '0', change: '+0%', trend: 'up' as const, icon: <Users className="w-6 h-6" />, color: 'purple' as const },
    { title: 'Sản phẩm', value: '0', change: '+0%', trend: 'up' as const, icon: <Package className="w-6 h-6" />, color: 'orange' as const },
  ];

  // TODO: Replace with actual API data
  const recentOrders: { id: string; customer: string; amount: string; status: string; time: string }[] = [];

  // TODO: Replace with actual API data
  const topProducts: { name: string; sales: number; revenue: string; trend: string }[] = [];

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { variant: 'success' as const, text: 'Hoàn thành', icon: CheckCircle },
      pending: { variant: 'warning' as const, text: 'Chờ xử lý', icon: Clock },
      processing: { variant: 'info' as const, text: 'Đang xử lý', icon: AlertCircle },
      cancelled: { variant: 'danger' as const, text: 'Đã hủy', icon: XCircle },
    };
    const { variant, text, icon: Icon } = config[status as keyof typeof config];
    return (
      <AdminBadge variant={variant} dot>
        {text}
      </AdminBadge>
    );
  };

  const quickActions = [
    { name: 'Bảo hành', href: '/admin/warranties', icon: Shield, color: 'bg-green-500', description: 'Quản lý gói bảo hành' },
    { name: 'Cửa hàng', href: '/admin/stores', icon: Store, color: 'bg-blue-500', description: 'Quản lý cửa hàng' },
    { name: 'Màu sắc', href: '/admin/colors', icon: Palette, color: 'bg-purple-500', description: 'Quản lý màu sắc' },
    { name: 'Thương hiệu', href: '/admin/brands', icon: Tags, color: 'bg-orange-500', description: 'Quản lý thương hiệu' },
    { name: 'Kho hàng', href: '/admin/warehouses', icon: Warehouse, color: 'bg-cyan-500', description: 'Quản lý kho' },
    { name: 'Import SP', href: '/admin/products', icon: FileSpreadsheet, color: 'bg-emerald-500', description: 'Import sản phẩm' },
  ];

  return (
    <div className="space-y-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <AdminStats key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <AdminCard>
          <AdminCardHeader 
            title="Doanh thu 7 ngày" 
            action={<TrendingUp className="w-5 h-5 text-green-600" />}
          />
          <AdminCardBody>
            <div className="h-64 flex items-end justify-between gap-3">
              {[65, 78, 82, 70, 88, 95, 100].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                    className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-lg relative group cursor-pointer hover:from-blue-700 hover:to-cyan-600 transition-all"
                  >
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      ₫{(height * 1000000).toLocaleString('vi-VN')}
                    </div>
                  </motion.div>
                  <span className="text-xs text-gray-500 font-medium">T{i + 2}</span>
                </div>
              ))}
            </div>
          </AdminCardBody>
        </AdminCard>

        {/* Top Products */}
        <AdminCard>
          <AdminCardHeader 
            title="Sản phẩm bán chạy" 
            action={
              <AdminButton variant="ghost" size="sm">
                Xem tất cả
              </AdminButton>
            }
          />
          <AdminCardBody className="p-0">
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Chưa có dữ liệu sản phẩm</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {topProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} đã bán</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{product.revenue}</p>
                      {product.trend === 'up' ? (
                        <ArrowUp className="w-4 h-4 text-green-600 ml-auto" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600 ml-auto" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AdminCardBody>
        </AdminCard>
      </div>

      {/* Recent Orders */}
      <AdminCard>
        <AdminCardHeader 
          title="Đơn hàng gần đây" 
          subtitle="5 đơn hàng mới nhất"
          action={
            <AdminButton variant="primary" size="sm" icon={<Eye className="w-4 h-4" />}>
              Xem tất cả
            </AdminButton>
          }
        />
        <AdminCardBody className="p-0">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã đơn</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số tiền</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thời gian</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600">{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm">
                            {order.customer.charAt(0)}
                          </div>
                          <span className="text-gray-900">{order.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{order.amount}</td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{order.time}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCardBody>
      </AdminCard>
    </div>
  );
}
