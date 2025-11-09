'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Package, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const status = searchParams.get('status');
  const code = searchParams.get('code');
  const orderId = searchParams.get('order');

  const isSuccess = status === 'success';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Icon Header */}
          <div className={`${isSuccess ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'} p-12 text-center`}>
            {isSuccess ? (
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
                <CheckCircle className="w-24 h-24 text-white relative z-10" />
              </div>
            ) : (
              <XCircle className="w-24 h-24 text-white" />
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            <h1 className={`text-3xl font-bold text-center mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </h1>

            <p className="text-gray-600 text-center mb-8">
              {isSuccess 
                ? 'Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được xử lý.' 
                : 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại.'}
            </p>

            {/* Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-3">
              {orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Mã đơn hàng:</span>
                  <span className="text-gray-900 font-semibold">#{orderId}</span>
                </div>
              )}
              {code && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Mã giao dịch:</span>
                  <span className="text-gray-900 font-mono text-sm">{code}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Trạng thái:</span>
                <span className={`font-semibold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                  {isSuccess ? 'Thành công' : 'Thất bại'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {isSuccess && (
                <>
                  {orderId ? (
                    <Link href={`/orders?orderId=${orderId}`} className="block">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3">
                        <Package className="w-5 h-5 mr-2" />
                        Xem đơn hàng
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/orders`} className="block">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3">
                        <Package className="w-5 h-5 mr-2" />
                        Xem tất cả đơn hàng
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  )}
                </>
              )}
              
              {!isSuccess && (
                <Link href={`/cart`} className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3">
                    <Package className="w-5 h-5 mr-2" />
                    Thử lại thanh toán
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              )}

              <Link href={`/`} className="block">
                <Button variant="outline" className="w-full py-3">
                  <Home className="w-5 h-5 mr-2" />
                  Về trang chủ
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            {isSuccess && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 text-center">
                  Bạn sẽ nhận được email xác nhận đơn hàng trong vài phút. 
                  Vui lòng kiểm tra địa chỉ email của bạn.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ? <Link href="/contact" className="text-blue-600 hover:underline">Liên hệ với chúng tôi</Link>
          </p>
        </div>
      </div>
    </div>
  );
}


