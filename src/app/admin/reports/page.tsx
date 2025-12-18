'use client';

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign
} from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');

  const reportTypes = [
    {
      id: 'sales',
      title: 'Báo cáo doanh thu',
      description: 'Tổng hợp doanh thu theo thời gian',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      id: 'orders',
      title: 'Báo cáo đơn hàng',
      description: 'Thống kê đơn hàng và trạng thái',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      id: 'products',
      title: 'Báo cáo sản phẩm',
      description: 'Sản phẩm bán chạy, tồn kho',
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      id: 'customers',
      title: 'Báo cáo khách hàng',
      description: 'Phân tích khách hàng mới và cũ',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`${report.color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Placeholder Stats */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">+12.5%</span>
                  <span className="text-gray-500">so với kỳ trước</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Báo cáo gần đây</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Chưa có báo cáo nào được tạo</p>
            <p className="text-sm mt-1">Chọn loại báo cáo ở trên để bắt đầu</p>
          </div>
        </div>
      </div>
    </div>
  );
}
