'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Download,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber?: string;
}

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Mock data - in real app, this would be from API
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        status: 'delivered',
        totalAmount: 2500000,
        items: [
          {
            id: '1',
            productName: 'Quạt Đứng Panasonic F-40CM9',
            productImage: '/images/products/fan1.jpg',
            quantity: 1,
            price: 2500000,
            total: 2500000
          }
        ],
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-18T14:20:00Z',
        shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
        paymentMethod: 'VNPay',
        trackingNumber: 'VN123456789'
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        status: 'shipping',
        totalAmount: 1800000,
        items: [
          {
            id: '2',
            productName: 'Quạt Trần Panasonic F-30CM5',
            productImage: '/images/products/fan2.jpg',
            quantity: 1,
            price: 1800000,
            total: 1800000
          }
        ],
        createdAt: '2024-01-20T09:15:00Z',
        updatedAt: '2024-01-22T16:45:00Z',
        shippingAddress: '456 Đường XYZ, Quận 3, TP.HCM',
        paymentMethod: 'VNPay',
        trackingNumber: 'VN987654321'
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        status: 'pending',
        totalAmount: 3200000,
        items: [
          {
            id: '3',
            productName: 'Quạt Hơi Nước Panasonic F-50CM9',
            productImage: '/images/products/fan3.jpg',
            quantity: 1,
            price: 3200000,
            total: 3200000
          }
        ],
        createdAt: '2024-01-25T14:20:00Z',
        updatedAt: '2024-01-25T14:20:00Z',
        shippingAddress: '789 Đường DEF, Quận 5, TP.HCM',
        paymentMethod: 'VNPay'
      }
    ];
    
    setOrders(mockOrders);
    setLoading(false);
  }, [isAuthenticated, router]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ xác nhận', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock };
      case 'confirmed':
        return { label: 'Đã xác nhận', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle };
      case 'shipping':
        return { label: 'Đang giao hàng', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Truck };
      case 'delivered':
        return { label: 'Đã giao hàng', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
      case 'cancelled':
        return { label: 'Đã hủy', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle };
      default:
        return { label: 'Không xác định', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đơn hàng của tôi
            </h1>
            <p className="text-gray-600">
              {filteredOrders.length} đơn hàng
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc'
                : 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
              }
            </p>
            <Link href="/products">
              <Button>
                Khám phá sản phẩm
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-900">
                            {order.orderNumber}
                          </span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon className="w-4 h-4 inline mr-1" />
                          {statusInfo.label}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.productName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Số lượng: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatPrice(item.total)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p>Địa chỉ giao hàng: {order.shippingAddress}</p>
                          <p>Phương thức thanh toán: {order.paymentMethod}</p>
                          {order.trackingNumber && (
                            <p>Mã vận đơn: {order.trackingNumber}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Tổng cộng</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Tải hóa đơn
                          </Button>
                        )}
                        {order.status === 'pending' && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Hủy đơn hàng
                          </Button>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Chi tiết đơn hàng {selectedOrder.orderNumber}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Thông tin đơn hàng</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Mã đơn hàng: {selectedOrder.orderNumber}</p>
                      <p>Ngày đặt: {formatDate(selectedOrder.createdAt)}</p>
                      <p>Cập nhật: {formatDate(selectedOrder.updatedAt)}</p>
                      <p>Trạng thái: {getStatusInfo(selectedOrder.status).label}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Thông tin giao hàng</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Địa chỉ: {selectedOrder.shippingAddress}</p>
                      <p>Thanh toán: {selectedOrder.paymentMethod}</p>
                      {selectedOrder.trackingNumber && (
                        <p>Mã vận đơn: {selectedOrder.trackingNumber}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Sản phẩm</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.productName}</h5>
                          <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatPrice(item.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Tổng cộng:</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
