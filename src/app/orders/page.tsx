'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Search
} from 'lucide-react';
import Link from 'next/link';
import { OrderService } from '@/services/orderService';

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'picking' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
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
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  // Initialize status filter from URL params and auto-open order detail
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      // Map uppercase status to lowercase for consistency
      const mappedStatus = statusParam.toLowerCase();
      setStatusFilter(mappedStatus);
    }
    
    // Auto-open order detail if orderId is provided in URL
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam && orders.length > 0) {
      const order = orders.find(o => o.id === orderIdParam);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [searchParams, orders]);

  // Update URL when status filter changes
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      router.push('/orders');
    } else {
      router.push(`/orders?status=${status}`);
    }
  };

  const loadOrders = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setLoading(true);
      let response;
      
      switch (statusFilter) {
        case 'pending':
          response = await OrderService.getOrdersPending();
          break;
        case 'picking':
          response = await OrderService.getOrdersPicking();
          break;
        case 'shipping':
          response = await OrderService.getOrdersShipping();
          break;
        case 'delivered':
          response = await OrderService.getOrdersCompleted();
          break;
        default:
          // Load all orders using getOrderHistory (which calls /order/getOrders)
          response = await OrderService.getOrderHistory({ 
            status: statusFilter !== 'all' ? statusFilter.toUpperCase() : undefined 
          });
          break;
      }
      
      if (response && response.data) {
        // Transform backend OrderDTO to frontend Order format
        const transformedOrders = Array.isArray(response.data) 
          ? response.data.map((order: any) => {
              // Use firstProduct info if available, otherwise use cartDTO items
              const hasFirstProduct = order.firstProductName && order.firstProductImage;
              const items = hasFirstProduct
                ? [{
                    id: order.orderID?.toString() || '',
                    productName: order.firstProductName || '',
                    productImage: order.firstProductImage || '/images/placeholder.svg',
                    quantity: order.firstProductQuantity || 1,
                    price: order.firstProductPrice || 0,
                    total: (order.firstProductPrice || 0) * (order.firstProductQuantity || 1)
                  }]
                : order.cartDTO?.items?.map((item: any) => ({
                    id: item.product?.productID?.toString() || '',
                    productName: item.product?.productName || '',
                    productImage: item.product?.imageURL || item.product?.productImage || '/images/placeholder.svg',
                    quantity: item.quantity || 0,
                    price: item.price || 0,
                    total: (item.price || 0) * (item.quantity || 0)
                  })) || [];

              return {
                id: order.orderID?.toString() || '',
                orderNumber: `ORD-${order.orderID}`,
                status: mapBackendStatusToFrontend(order.orderStatus),
                totalAmount: order.totalPrice || 0,
                items: items,
                createdAt: order.orderDate || new Date().toISOString(),
                updatedAt: order.orderDate || new Date().toISOString(),
                shippingAddress: order.billingAddress || '',
                paymentMethod: order.paymentMethod || 'COD'
              };
            })
          : [];
        
        setOrders(transformedOrders);
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const mapBackendStatusToFrontend = (backendStatus: string): 'pending' | 'picking' | 'shipping' | 'delivered' | 'cancelled' | 'returned' => {
    switch (backendStatus?.toUpperCase()) {
      case 'PENDING':
        return 'pending';
      case 'PICKING':
        return 'picking';
      case 'SHIPPING':
        return 'shipping';
      case 'DELIVERED':
        return 'delivered';
      case 'RETURNS_REFUNDS':
        return 'returned';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  useEffect(() => {
    loadOrders();
  }, [isAuthenticated, statusFilter, router]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ xác nhận', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock };
      case 'picking':
        return { label: 'Chờ lấy hàng', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle };
      case 'shipping':
        return { label: 'Đang vận chuyển', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Truck };
      case 'delivered':
        return { label: 'Đã giao hàng', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
      case 'cancelled':
        return { label: 'Đã hủy', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle };
      case 'returned':
        return { label: 'Trả hàng/Hoàn tiền', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Package };
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

        {/* Order Status Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto">
              <div className="flex min-w-max">
                <button
                  onClick={() => handleStatusFilterChange('all')}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === 'all'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => handleStatusFilterChange('pending')}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === 'pending'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Chờ xác nhận
                </button>
                <button
                  onClick={() => handleStatusFilterChange('picking')}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === 'picking'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Chờ lấy hàng
                </button>
                <button
                  onClick={() => handleStatusFilterChange('shipping')}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === 'shipping'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Đang vận chuyển
                </button>
                <button
                  onClick={() => handleStatusFilterChange('delivered')}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === 'delivered'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Hoàn thành
                </button>
                <button
                  onClick={() => handleStatusFilterChange('cancelled')}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === 'cancelled'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Đã hủy
                </button>
                <button
                  onClick={() => handleStatusFilterChange('returned')}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === 'returned'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Trả hàng/Hoàn tiền
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={async () => {
                              if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                                try {
                                  await OrderService.cancelOrder(parseInt(order.id));
                                  alert('Đã hủy đơn hàng thành công');
                                  loadOrders();
                                } catch (error: any) {
                                  alert(error.message || 'Không thể hủy đơn hàng');
                                }
                              }
                            }}
                          >
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
            <div className="bg-white rounded-lg w-full max-w-[900px] max-h-[95vh] overflow-y-auto">
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
                  {/* Thông tin đơn hàng - Form container (bên trái, chiều cao lớn) */}
                  <div className="bg-white rounded-lg border-2 border-gray-300 shadow-md p-5 h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-400 hover:scale-[1.02] cursor-pointer">
                    <h4 className="font-semibold text-gray-900 mb-4 text-base">Thông tin đơn hàng</h4>
                    <div className="space-y-4 text-sm flex-grow">
                      <div className="pb-3 border-b border-gray-200 last:border-0">
                        <span className="font-medium text-gray-700 block mb-1">Mã đơn hàng:</span>
                        <p className="text-gray-600">{selectedOrder.orderNumber}</p>
                      </div>
                      <div className="pb-3 border-b border-gray-200 last:border-0">
                        <span className="font-medium text-gray-700 block mb-1">Ngày đặt:</span>
                        <p className="text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Trạng thái:</span>
                        <div>
                          {(() => {
                            const statusInfo = getStatusInfo(selectedOrder.status);
                            const StatusIcon = statusInfo.icon;
                            return (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${statusInfo.bgColor} ${statusInfo.color}`}>
                                <StatusIcon className="w-4 h-4" />
                                {statusInfo.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cột phải: 2 form xếp dọc */}
                  <div className="flex flex-col gap-6 h-full">
                    {/* Thông tin giao hàng - Form container (trên) */}
                    <div className="bg-white rounded-lg border-2 border-gray-300 shadow-md p-5 transition-all duration-300 hover:shadow-lg hover:border-gray-400 hover:scale-[1.02] cursor-pointer">
                      <h4 className="font-semibold text-gray-900 mb-4 text-base">Thông tin giao hàng</h4>
                      <div className="space-y-4 text-sm">
                        <div className="pb-3 border-b border-gray-200">
                          <span className="font-medium text-gray-700 block mb-1">Địa chỉ:</span>
                          <p className="text-gray-600">{selectedOrder.shippingAddress || 'Chưa có địa chỉ'}</p>
                        </div>
                        {selectedOrder.trackingNumber && (
                          <div>
                            <span className="font-medium text-gray-700 block mb-1">Mã vận đơn:</span>
                            <p className="text-gray-600">{selectedOrder.trackingNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Thông tin thanh toán - Form container (dưới) */}
                    <div className="bg-white rounded-lg border-2 border-gray-300 shadow-md p-5 transition-all duration-300 hover:shadow-lg hover:border-gray-400 hover:scale-[1.02] cursor-pointer">
                      <h4 className="font-semibold text-gray-900 mb-4 text-base">Thông tin thanh toán</h4>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700 block mb-1">Phương thức thanh toán:</span>
                        <p className="text-gray-600">{selectedOrder.paymentMethod || 'COD'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items - Form container */}
                <div className="bg-white rounded-lg border-2 border-gray-300 shadow-md p-5 mb-6 transition-all duration-300 hover:shadow-lg hover:border-gray-400 hover:scale-[1.01] cursor-pointer">
                  <h4 className="font-semibold text-gray-900 mb-4 text-base">Sản phẩm</h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
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

                {/* Total - Form container */}
                <div className="bg-white rounded-lg border-2 border-gray-300 shadow-md p-5 transition-all duration-300 hover:shadow-lg hover:border-gray-400 hover:scale-[1.01] cursor-pointer">
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








