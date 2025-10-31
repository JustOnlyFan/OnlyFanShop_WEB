'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { PaymentService } from '@/services/paymentService';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CreditCard, MapPin, Phone, Mail, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [shippingAddress, setShippingAddress] = useState('');
  const [error, setError] = useState('');
  
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (items.length === 0) {
      router.push('/cart');
      return;
    }
  }, [user, items, router]);

  // Check if user is logged in before payment
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để thanh toán</p>
          <Link href="/auth/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
              Đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!shippingAddress.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    // Check if user has valid token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Creating VNPay payment with:', {
        amount: totalPrice,
        bankCode: 'NCB',
        address: shippingAddress.trim(),
        token: token ? 'Present' : 'Missing'
      });

      const response = await PaymentService.createVNPayPayment({
        amount: totalPrice,
        bankCode: 'NCB',
        address: shippingAddress.trim()
      });

      if (response.data?.paymentUrl) {
        // Redirect to VNPay
        window.location.href = response.data.paymentUrl;
      } else {
        setError('Backend chưa trả về paymentUrl đã ký từ VNPay.');
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          'Thanh toán thất bại. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại giỏ hàng
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Thanh toán
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Thông tin khách hàng
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">{user.username}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                  
                  {user.phoneNumber && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-900">{user.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Địa chỉ giao hàng
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ giao hàng *
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        rows={3}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập địa chỉ giao hàng chi tiết..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Phương thức thanh toán
                </h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={paymentMethod === 'vnpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3 flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">VNPay</div>
                        <div className="text-sm text-gray-600">
                          Thanh toán qua VNPay (ATM, Visa, Mastercard)
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Tóm tắt đơn hàng
                </h2>

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.cartItemID} className="flex items-center gap-3">
                      <img
                        src={item.product.imageURL || '/images/placeholder.jpg'}
                        alt={item.product.productName}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="text-gray-900">
                      {totalPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-green-600">Miễn phí</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Tổng cộng</span>
                      <span className="text-blue-600">
                        {totalPrice.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={loading || !shippingAddress.trim()}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner /> : 'Thanh toán với VNPay'}
                </Button>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Bằng cách thanh toán, bạn đồng ý với{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                      Điều khoản sử dụng
                    </Link>{' '}
                    và{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                      Chính sách bảo mật
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
