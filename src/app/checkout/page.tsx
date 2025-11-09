'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { PaymentService } from '@/services/paymentService';
import { AddressService } from '@/services/addressService';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CheckoutInfo, VietnamProvince, VietnamWard } from '@/types';
import { ArrowLeft, ArrowRight, Building, MapPin, XCircle, Check, CreditCard, ShoppingBag, Package, Truck, Home, Store, User, Phone, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCODConfirm, setShowCODConfirm] = useState(false);
  
  // Address data
  const [provinces, setProvinces] = useState<VietnamProvince[]>([]);
  const [pickupWards, setPickupWards] = useState<VietnamWard[]>([]);
  const [deliveryWards, setDeliveryWards] = useState<VietnamWard[]>([]);
  
  // Checkout info
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo>({
    deliveryType: 'pickup'
  });
  
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  
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
    loadProvinces();
  }, [user, items, router]);

  // Auto-fill recipient name and phone when user switches to delivery mode
  useEffect(() => {
    if (checkoutInfo.deliveryType === 'delivery' && user) {
      setCheckoutInfo(prev => ({
        ...prev,
        recipientName: prev.recipientName || user.username || '',
        recipientPhone: prev.recipientPhone || user.phoneNumber || ''
      }));
    }
  }, [checkoutInfo.deliveryType, user]);

  const loadProvinces = async () => {
    try {
      const data = await AddressService.getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Failed to load provinces:', error);
    }
  };

  const loadWardsForProvince = async (provinceCode: number, type: 'pickup' | 'delivery') => {
    try {
      const province = await AddressService.getProvinceWithWards(provinceCode);
      const wards = province.wards || [];
      
      if (type === 'pickup') {
        setPickupWards(wards);
        // Reset district when province changes
        setCheckoutInfo(prev => ({ ...prev, districtPickup: undefined, storePickup: undefined }));
      } else {
        setDeliveryWards(wards);
        setCheckoutInfo(prev => ({ ...prev, districtDelivery: undefined, wardDelivery: undefined }));
      }
    } catch (error) {
      console.error('Failed to load wards:', error);
    }
  };

  const handleProvinceChange = (provinceCode: number, type: 'pickup' | 'delivery') => {
    if (type === 'pickup') {
      setCheckoutInfo(prev => ({ ...prev, provincePickup: provinceCode }));
      loadWardsForProvince(provinceCode, 'pickup');
    } else {
      setCheckoutInfo(prev => ({ ...prev, provinceDelivery: provinceCode }));
      loadWardsForProvince(provinceCode, 'delivery');
    }
  };

  const handleDistrictChange = (wardName: string, type: 'pickup' | 'delivery') => {
    // In v2 API, districts are actually wards
    if (type === 'pickup') {
      setCheckoutInfo(prev => ({ ...prev, districtPickup: wardName }));
    } else {
      setCheckoutInfo(prev => ({ ...prev, districtDelivery: wardName }));
    }
  };

  const getDeliveryAddress = () => {
    if (checkoutInfo.deliveryType === 'pickup') {
      return 'Nhận tại cửa hàng';
    }
    
    if (checkoutInfo.useDefaultAddress) {
      return user?.address || 'Địa chỉ mặc định';
    }
    
    // Build full address from input
    const parts: string[] = [];
    
    if (checkoutInfo.homeAddress) {
      parts.push(checkoutInfo.homeAddress);
    }
    
    if (checkoutInfo.districtDelivery) {
      parts.push(String(checkoutInfo.districtDelivery));
    }
    
    const provinceName = checkoutInfo.provinceDelivery 
      ? provinces.find(p => p.code === checkoutInfo.provinceDelivery)?.name
      : null;
    
    if (provinceName) {
      parts.push(provinceName);
    }
    
    return parts.length > 0 ? parts.join(', ') : '';
  };

  const getDeliveryAddressParts = () => {
    if (checkoutInfo.deliveryType === 'pickup') {
      return ['Nhận tại cửa hàng'];
    }
    
    if (checkoutInfo.useDefaultAddress) {
      return [user?.address || 'Địa chỉ mặc định'];
    }
    
    const parts: string[] = [];
    
    if (checkoutInfo.homeAddress) {
      parts.push(checkoutInfo.homeAddress);
    }
    
    if (checkoutInfo.districtDelivery) {
      parts.push(String(checkoutInfo.districtDelivery));
    }
    
    const provinceName = checkoutInfo.provinceDelivery 
      ? provinces.find(p => p.code === checkoutInfo.provinceDelivery)?.name
      : null;
    
    if (provinceName) {
      parts.push(provinceName);
    }
    
    return parts.length > 0 ? parts : [];
  };

  const validateInfoStep = (): boolean => {
    if (checkoutInfo.deliveryType === 'pickup') {
      if (!checkoutInfo.provincePickup) {
        setError('Vui lòng chọn tỉnh/thành phố');
        return false;
      }
      if (!checkoutInfo.districtPickup) {
        setError('Vui lòng chọn quận/huyện');
        return false;
      }
      // Store is optional for now
    } else {
      if (!checkoutInfo.recipientName?.trim()) {
        setError('Vui lòng nhập họ và tên người nhận');
        return false;
      }
      if (!checkoutInfo.recipientPhone?.trim()) {
        setError('Vui lòng nhập số điện thoại');
        return false;
      }
      if (!checkoutInfo.useDefaultAddress) {
        if (!checkoutInfo.provinceDelivery) {
          setError('Vui lòng chọn tỉnh/thành phố');
          return false;
        }
        if (!checkoutInfo.districtDelivery) {
          setError('Vui lòng chọn quận/huyện');
          return false;
        }
        if (!checkoutInfo.homeAddress?.trim()) {
          setError('Vui lòng nhập địa chỉ nhà');
          return false;
        }
      }
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (validateInfoStep()) {
      setError('');
      setStep('payment');
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Vui lòng chọn phương thức thanh toán');
      return;
    }

    // Show confirmation for COD
    if (paymentMethod === 'cod') {
      setShowCODConfirm(true);
      return;
    }

    // Process payment
    await processPayment();
  };

  const processPayment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Build address string
      const provinceName = checkoutInfo.deliveryType === 'pickup' 
        ? provinces.find(p => p.code === checkoutInfo.provincePickup)?.name
        : provinces.find(p => p.code === checkoutInfo.provinceDelivery)?.name;
      
      const districtName = checkoutInfo.deliveryType === 'pickup'
        ? String(checkoutInfo.districtPickup)
        : String(checkoutInfo.districtDelivery);

      const address = AddressService.formatAddress({
        deliveryType: checkoutInfo.deliveryType,
        provinceName,
        districtName: districtName,
        storeName: String(checkoutInfo.storePickup || ''),
        homeAddress: checkoutInfo.homeAddress,
        note: checkoutInfo.deliveryType === 'pickup' ? checkoutInfo.notePickup : checkoutInfo.noteDelivery
      });

      // Get recipient phone number
      const recipientPhoneNumber = checkoutInfo.deliveryType === 'delivery' 
        ? (checkoutInfo.recipientPhone || user?.phoneNumber || '')
        : (user?.phoneNumber || '');

      if (paymentMethod === 'cod') {
        // Handle COD payment
        const response = await PaymentService.createCODPayment({
          totalPrice,
          address,
          buyMethod: 'ByCart',
          recipientPhoneNumber,
          deliveryType: checkoutInfo.deliveryType === 'pickup' ? 'IN_STORE_PICKUP' : 'HOME_DELIVERY',
          storeId: checkoutInfo.storePickup
        });

        if (response.data) {
          // Success - clear cart and redirect to order details
          clearCart();
          router.push(`/orders?orderId=${response.data}`);
        } else {
          setError('Không thể tạo đơn hàng COD. Vui lòng thử lại.');
        }
      } else if (paymentMethod === 'vnpay') {
        const response = await PaymentService.createVNPayPayment({
          amount: totalPrice,
          bankCode: 'NCB',
          address: address,
          buyMethod: 'ByCart',
          clientType: 'web',
          recipientPhoneNumber: recipientPhoneNumber
        });

        if (response.data?.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
          setError('Backend chưa trả về paymentUrl đã ký từ VNPay.');
        }
      }
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          'Thanh toán thất bại. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
      setShowCODConfirm(false);
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
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/cart"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Quay lại giỏ hàng</span>
            </Link>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Step 1: Thông tin */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${step === 'info' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                {step === 'info' ? <span className="font-bold">1</span> : <Check className="w-5 h-5" />}
              </div>
              <span className={`ml-2 text-sm font-medium ${step === 'info' ? 'text-blue-600' : 'text-green-600'}`}>
                Thông tin
              </span>
            </div>

            {/* Connecting Line */}
            <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${step === 'info' ? 'bg-gray-300' : 'bg-green-600'}`} />

            {/* Step 2: Thanh toán */}
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'}`}>
                <span className="font-bold">2</span>
              </div>
              <span className={`ml-2 text-sm font-medium ${step === 'payment' ? 'text-blue-600' : 'text-gray-600'}`}>
                Thanh toán
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {step === 'info' ? (
            /* STEP 1: Information */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Checkout Form */}
              <div className="space-y-6">
                {/* Delivery Type */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Thông tin nhận hàng
                  </h2>
                  
                  {/* Tabs */}
                  <div className="flex gap-0 mb-6 border-b-2 border-gray-200">
                    <button
                      onClick={() => setCheckoutInfo(prev => ({ ...prev, deliveryType: 'pickup' }))}
                      className={`flex-1 px-4 py-2 text-center font-medium transition-colors ${
                        checkoutInfo.deliveryType === 'pickup'
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      Nhận tại cửa hàng
                    </button>
                    <button
                      onClick={() => setCheckoutInfo(prev => ({ ...prev, deliveryType: 'delivery' }))}
                      className={`flex-1 px-4 py-2 text-center font-medium transition-colors ${
                        checkoutInfo.deliveryType === 'delivery'
                          ? 'text-red-600 border-b-2 border-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      Giao hàng tận nơi
                    </button>
                  </div>

                  {checkoutInfo.deliveryType === 'pickup' ? (
                    /* Pickup Form */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Tỉnh/Thành phố *
                        </label>
                        <select
                          value={checkoutInfo.provincePickup || ''}
                          onChange={(e) => handleProvinceChange(Number(e.target.value), 'pickup')}
                          className="w-full px-3 py-3 border-2 border-gray-400 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Chọn tỉnh/thành phố</option>
                          {provinces.map((province) => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Quận/Huyện *
                        </label>
                        <select
                          value={checkoutInfo.districtPickup || ''}
                          onChange={(e) => handleDistrictChange(e.target.value, 'pickup')}
                          disabled={!pickupWards.length}
                          className="w-full px-3 py-3 border-2 border-gray-400 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">Chọn quận/huyện</option>
                          {pickupWards.map((ward) => (
                            <option key={ward.code} value={ward.name}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Cửa hàng
                        </label>
                        <select
                          value={checkoutInfo.storePickup || ''}
                          onChange={(e) => setCheckoutInfo(prev => ({ ...prev, storePickup: Number(e.target.value) }))}
                          className="w-full px-3 py-3 border-2 border-gray-400 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Chọn cửa hàng (tùy chọn)</option>
                          {/* TODO: Load stores from backend */}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Ghi chú khác (nếu có)
                        </label>
                        <textarea
                          value={checkoutInfo.notePickup || ''}
                          onChange={(e) => setCheckoutInfo(prev => ({ ...prev, notePickup: e.target.value }))}
                          rows={2}
                          placeholder="Nhập ghi chú"
                          className="w-full px-3 py-3 border-2 border-gray-400 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Delivery Form */
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-xl mb-4">
                          <input
                            type="checkbox"
                            id="useDefaultAddress"
                            checked={checkoutInfo.useDefaultAddress || false}
                            onChange={(e) => setCheckoutInfo(prev => ({ ...prev, useDefaultAddress: e.target.checked }))}
                            className="w-4 h-4"
                          />
                          <label htmlFor="useDefaultAddress" className="text-sm text-gray-900 cursor-pointer">
                            Địa chỉ mặc định của khách hàng
                          </label>
                        </div>
                        
                        {checkoutInfo.useDefaultAddress && user?.address && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Địa chỉ:</span> {user.address}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Họ và tên *
                        </label>
                        <input
                          type="text"
                          value={checkoutInfo.recipientName || ''}
                          onChange={(e) => setCheckoutInfo(prev => ({ ...prev, recipientName: e.target.value }))}
                          className="w-full px-3 py-3 border-2 border-gray-400 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          value={checkoutInfo.recipientPhone || ''}
                          onChange={(e) => setCheckoutInfo(prev => ({ ...prev, recipientPhone: e.target.value }))}
                          className="w-full px-3 py-3 border-2 border-gray-400 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {!checkoutInfo.useDefaultAddress && (
                          <>
                            <div
                              onClick={() => setCheckoutInfo(prev => ({ ...prev, showNewAddress: !prev.showNewAddress }))}
                              className="text-blue-600 cursor-pointer mb-4"
                            >
                              Nhập địa chỉ mới
                            </div>

                            {checkoutInfo.showNewAddress && (
                              <div className="space-y-4 border-t-2 pt-4">
                                <div>
                                  <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Tỉnh/Thành phố *
                                  </label>
                                  <select
                                    value={checkoutInfo.provinceDelivery || ''}
                                    onChange={(e) => handleProvinceChange(Number(e.target.value), 'delivery')}
                                    className="w-full px-3 py-3 border-2 border-gray-400 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">Chọn tỉnh/thành phố</option>
                                    {provinces.map((province) => (
                                      <option key={province.code} value={province.code}>
                                        {province.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Quận/Huyện *
                                  </label>
                                  <select
                                    value={checkoutInfo.districtDelivery || ''}
                                    onChange={(e) => handleDistrictChange(e.target.value, 'delivery')}
                                    disabled={!deliveryWards.length}
                                    className="w-full px-3 py-3 border-2 border-gray-400 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                  >
                                    <option value="">Chọn quận/huyện</option>
                                    {deliveryWards.map((ward) => (
                                      <option key={ward.code} value={ward.name}>
                                        {ward.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Địa chỉ nhà *
                                  </label>
                                  <input
                                    type="text"
                                    value={checkoutInfo.homeAddress || ''}
                                    onChange={(e) => setCheckoutInfo(prev => ({ ...prev, homeAddress: e.target.value }))}
                                    placeholder="Số nhà, tên đường..."
                                    className="w-full px-3 py-3 border-2 border-gray-400 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Ghi chú khác (nếu có)
                                  </label>
                                  <textarea
                                    value={checkoutInfo.noteDelivery || ''}
                                    onChange={(e) => setCheckoutInfo(prev => ({ ...prev, noteDelivery: e.target.value }))}
                                    rows={2}
                                    placeholder="Nhập ghi chú"
                                    className="w-full px-3 py-3 border-2 border-gray-400 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            )}
                          </>
                        )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:sticky lg:top-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Tóm tắt đơn hàng
                  </h2>

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
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleContinueToPayment}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    Tiếp tục đến thanh toán
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Payment */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Delivery Info & Payment Method */}
              <div className="space-y-6">
                {/* Delivery Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    THÔNG TIN NHẬN HÀNG
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Khách hàng:</span>
                      <span className="text-gray-900 font-semibold">{user?.username}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Số điện thoại:</span>
                      <span className="text-gray-900 font-semibold">{user?.phoneNumber || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="text-gray-900 font-semibold break-all">{user?.email}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="mb-2">
                        <span className="text-gray-600 font-medium">Nhận hàng tại:</span>
                      </div>
                      <div className="text-gray-900 font-semibold leading-relaxed flex flex-wrap items-center gap-x-1">
                        {getDeliveryAddressParts().map((part, index) => (
                          <span key={index} className="whitespace-nowrap">
                            {index > 0 && <span className="mr-1">,</span>}
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Phương thức thanh toán
                  </h2>

                  <div className="space-y-3">
                    <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${
                      paymentMethod === 'cod' ? 'border-yellow-500 bg-yellow-50 shadow-md' : 'border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-yellow-600 mt-1"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Building className="w-5 h-5 text-yellow-600" />
                          <div className="font-bold text-gray-900">COD (Thanh toán khi nhận hàng)</div>
                        </div>
                        <div className="text-sm text-gray-600 ml-8">
                          Thanh toán bằng tiền mặt khi nhận hàng, kiểm tra hàng trước khi thanh toán
                        </div>
                        {paymentMethod === 'cod' && (
                          <div className="mt-2 ml-8 text-xs text-green-600 font-medium">
                            ✓ Phương thức thanh toán an toàn và tiện lợi
                          </div>
                        )}
                      </div>
                    </label>

                    <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${
                      paymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="vnpay"
                        checked={paymentMethod === 'vnpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600 mt-1"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <div className="font-bold text-gray-900">VNPay</div>
                        </div>
                        <div className="text-sm text-gray-600 ml-8">
                          Thanh toán qua VNPay (ATM, Visa, Mastercard)
                        </div>
                        {paymentMethod === 'vnpay' && (
                          <div className="mt-2 ml-8 text-xs text-blue-600 font-medium">
                            ✓ Thanh toán nhanh chóng và bảo mật
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Right: Order Summary */}
              <div className="lg:sticky lg:top-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Tóm tắt đơn hàng
                  </h2>

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

                  <div className="flex gap-4 mt-8">
                    <Button
                      onClick={() => setStep('info')}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Quay lại
                    </Button>
                    
                    <Button
                      onClick={handlePayment}
                      disabled={loading || !paymentMethod}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
                    >
                      {loading ? <LoadingSpinner /> : 'Thanh toán'}
                    </Button>
                  </div>

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
          )}
        </div>
      </div>

      {/* COD Confirmation Modal */}
      {showCODConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-scale-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-scale-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-yellow-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Xác nhận đặt hàng COD
              </h3>
              
              <p className="text-gray-600 mb-6">
                Bạn đang đặt hàng với phương thức thanh toán khi nhận hàng (COD).
                Bạn có chắc chắn muốn tiếp tục?
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-xl">ℹ️</div>
                  <div className="text-left text-sm text-gray-700">
                    <p className="font-semibold mb-1">Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Thanh toán khi nhận hàng</li>
                      <li>Vui lòng kiểm tra hàng trước khi thanh toán</li>
                      <li>Đơn hàng sẽ được xử lý trong 24h</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCODConfirm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 px-4 rounded-lg font-medium"
                >
                  Hủy
                </Button>
                
                <Button
                  onClick={processPayment}
                  disabled={loading}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner /> : 'Xác nhận'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
