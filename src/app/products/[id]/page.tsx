'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Product, ProductDetail } from '@/types';
import { ProductService } from '@/services/productService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';
import { ChatService } from '@/services/chatService';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Minus,
  Plus,
  Check,
  Zap,
  Award,
  Users,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  X,
  ChevronDown,
  MapPin,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductReviews } from '@/components/product/ProductReviews';
import { StoreLocationService, StoreLocation } from '@/services/storeLocationService';

export default function ProductDetailPage() {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [currentStoreIndex, setCurrentStoreIndex] = useState(0);
  
  const params = useParams();
  const productId = params.id as string;
  const { addItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Tối ưu: Dùng React Query để cache product detail
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => ProductService.getProductById(parseInt(productId)),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút (renamed from cacheTime in v5)
  });

  // Tối ưu: Dùng React Query cho stores với caching
  const storeQueryParams = useMemo(() => ({
    productId: parseInt(productId),
    city: selectedCity || undefined,
    district: selectedDistrict || undefined,
  }), [productId, selectedCity, selectedDistrict]);

  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: ['stores-with-product', storeQueryParams],
    queryFn: () => StoreLocationService.getStoresWithProduct(
      storeQueryParams.productId,
      storeQueryParams.city,
      storeQueryParams.district
    ),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút (renamed from cacheTime in v5)
  });

  const colorImageMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (product?.images) {
      (product.images as any[]).forEach((img) => {
        if (img?.colorId && img.imageUrl && !map[img.colorId]) {
          map[img.colorId] = img.imageUrl;
        }
      });
    }
    return map;
  }, [product]);

  const fallbackImage = useMemo(() => {
    if (product?.images && (product.images as any[]).length > 0) {
      const prioritized =
        (product.images as any[]).find((img) => img?.isMain && img?.colorId == null)?.imageUrl ||
        (product.images as any[]).find((img) => img?.colorId == null)?.imageUrl ||
        (product.images as any[])[0]?.imageUrl;
      if (prioritized) return prioritized as string;
    }
    return undefined;
  }, [product]);

  const displayedImage = selectedColorId && colorImageMap[selectedColorId]
    ? colorImageMap[selectedColorId]
    : fallbackImage;

  const selectedColorName = useMemo(() => {
    return product?.colors?.find((c: any) => c.id === selectedColorId)?.name;
  }, [product, selectedColorId]);

  // Update state từ React Query
  useEffect(() => {
    if (productData?.data) {
      const detail = productData.data as ProductDetail;
      setProduct(detail);
      if (detail.colors && detail.colors.length > 0) {
        const firstWithImage = detail.colors.find((c: any) => colorImageMap[c.id]);
        setSelectedColorId(firstWithImage?.id || detail.colors[0].id);
      } else {
        setSelectedColorId(null);
      }
    }
    setLoading(isLoadingProduct);
  }, [productData, isLoadingProduct, colorImageMap]);

  useEffect(() => {
    console.log('[ProductDetail] storesData:', storesData);
    if (storesData?.data) {
      console.log('[ProductDetail] Setting stores:', storesData.data);
      setStores(storesData.data);
      setCurrentStoreIndex(0);
    } else {
      console.log('[ProductDetail] No stores data available');
    }
    setLoadingStores(isLoadingStores);
  }, [storesData, isLoadingStores]);

  useEffect(() => {
    if (!product?.colors || product.colors.length === 0) {
      return;
    }
    if (!selectedColorId || !product.colors.some((c: any) => c.id === selectedColorId)) {
      setSelectedColorId(product.colors[0].id);
    }
  }, [product, selectedColorId]);

  const handleAddToCart = async () => {
    if (product) {
      setIsAddingToCart(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addItem(product, quantity);
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleMessageClick = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsAddingToCart(true);
      const response = await ChatService.createChatRoomFromProduct({
        productId: parseInt(productId),
        initialMessage: `Xin chào! Tôi quan tâm đến sản phẩm ${product?.productName}`
      });
      
      if (response.data) {
        router.push(`/chat/${response.data}`);
      }
    } catch (error: any) {
      console.error('Error creating chat room:', error);
      toast.error('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading || isLoadingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sản phẩm không tồn tại</h2>
          <Link href="/products">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-blue-600">Sản phẩm</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{product.productName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
              <Image
                src={displayedImage || '/images/placeholder.svg'}
                alt={product.productName}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                onError={(e: any) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder.svg';
                }}
              />
              {(product as any).discount && (
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    -{(product as any).discount}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">{product.brand?.name}</span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">Mã: #{product.id}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.productName}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {renderStars((product as any).rating || 0)}
                </div>
                <span className="text-sm text-gray-500">({(product as any).rating || 0})</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">Đã bán {Math.floor(Math.random() * 1000) + 100}</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                {(product as any).originalPrice && (product as any).originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice((product as any).originalPrice)}
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-500" />
                  <span>Miễn phí giao hàng</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Bảo hành 2 năm</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-purple-500" />
                  <span>Đổi trả 30 ngày</span>
                </div>
              </div>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Màu sắc</span>
                  {selectedColorName && (
                    <span className="text-xs text-gray-500">Đang xem: {selectedColorName}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const isActive = selectedColorId === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColorId(color.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                          isActive ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-200'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hexCode || '#f8fafc' }}
                        />
                        <span className="text-sm text-gray-800">{color.name}</span>
                      </button>
                    )
                  })}
                </div>
                {selectedColorId && !colorImageMap[selectedColorId] && (
                  <p className="text-xs text-gray-500">Màu này hiện dùng ảnh mặc định của sản phẩm.</p>
                )}
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg"
                  size="lg"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Mua ngay
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  variant="outline"
                  className="p-4 text-blue-600 border-blue-600 hover:bg-blue-50"
                  title="Thêm vào giỏ hàng"
                >
                  <ShoppingCart className="w-5 h-5" />
                </Button>
                
                <Button
                  onClick={handleToggleLike}
                  variant="outline"
                  className={`p-4 ${isLiked ? 'text-red-500 border-red-500' : 'text-gray-600 border-gray-300'}`}
                  title="Thêm vào yêu thích"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                
                <Button
                  onClick={handleMessageClick}
                  disabled={isAddingToCart}
                  variant="outline"
                  className="p-4 text-green-600 border-green-600 hover:bg-green-50"
                  title="Nhắn tin với nhân viên về sản phẩm này"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Stores with Product */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Xem chi nhánh có hàng
                </h3>
                {stores.length > 0 && (
                  <span className="text-sm text-gray-600">
                    Có <span className="font-bold text-blue-600">{stores.length}</span> cửa hàng có sản phẩm
                  </span>
                )}
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedDistrict('');
                    }}
                    className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Tất cả thành phố</option>
                    {StoreLocationService.getVietnameseCities().map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Store List */}
              {(loadingStores || isLoadingStores) ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : stores.length > 0 ? (
                <div className="relative">
                  {/* Navigation Arrows */}
                  {stores.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentStoreIndex((prev) => (prev > 0 ? prev - 1 : stores.length - 1))}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setCurrentStoreIndex((prev) => (prev < stores.length - 1 ? prev + 1 : 0))}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </>
                  )}

                  {/* Store Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stores.slice(currentStoreIndex, currentStoreIndex + 2).map((store, index) => (
                      <div
                        key={store.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="mb-3">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {store.address}
                            {store.ward && `, ${store.ward}`}
                            {store.district && `, ${store.district}`}
                            {store.city && `, ${store.city}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {store.phoneNumber && (
                            <a
                              href={`tel:${store.phoneNumber}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-red-600 rounded-lg text-sm font-medium hover:bg-pink-100 transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              {store.phoneNumber}
                            </a>
                          )}
                          <a
                            href={StoreLocationService.generateGoogleMapsUrl(store)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            <MapPin className="w-4 h-4" />
                            Bản đồ
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-600 font-medium">Tạm thời hết hàng</p>
                  <p className="text-sm text-gray-500 mt-1">Sản phẩm hiện không có tại cửa hàng nào</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white rounded-xl shadow-sm">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'description', label: 'Mô tả sản phẩm' },
                  { id: 'specifications', label: 'Thông số kỹ thuật' },
                  { id: 'shipping', label: 'Vận chuyển' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả chi tiết</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.fullDescription || product.briefDescription || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
                    <div className="space-y-3">
                      {/* Collect all specification items */}
                      {(() => {
                        const specs: Array<{ label: string; value: string }> = [];
                        
                        if (product.powerWatt) specs.push({ label: 'Công suất', value: `${product.powerWatt}W` });
                        if (product.bladeDiameterCm) specs.push({ label: 'Đường kính cánh quạt', value: `${product.bladeDiameterCm}cm` });
                        if (product.voltage) specs.push({ label: 'Điện áp', value: product.voltage });
                        if (product.windSpeedLevels) specs.push({ label: 'Tốc độ gió', value: product.windSpeedLevels });
                        if (product.airflow) specs.push({ label: 'Lưu lượng gió', value: `${product.airflow} m³/phút` });
                        if (product.bladeMaterial) specs.push({ label: 'Chất liệu cánh quạt', value: product.bladeMaterial });
                        if (product.bodyMaterial) specs.push({ label: 'Chất liệu thân quạt', value: product.bodyMaterial });
                        if (product.bladeCount) specs.push({ label: 'Số lượng cánh', value: `${product.bladeCount} cánh` });
                        if (product.noiseLevel) specs.push({ label: 'Mức độ ồn', value: `${product.noiseLevel} dB` });
                        if (product.motorSpeed) specs.push({ label: 'Tốc độ quay motor', value: `${product.motorSpeed} vòng/phút` });
                        if (product.weight) specs.push({ label: 'Trọng lượng', value: `${product.weight} kg` });
                        if (product.adjustableHeight) specs.push({ label: 'Chiều cao điều chỉnh', value: product.adjustableHeight });
                        if (product.warrantyMonths) specs.push({ label: 'Bảo hành', value: `${product.warrantyMonths} tháng` });
                        
                        const visibleSpecs = specs.slice(0, 6);
                        const hasMore = specs.length > 6 || product.technicalSpecifications;
                        
                        return (
                          <>
                            {visibleSpecs.map((spec, index) => (
                              <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">{spec.label}</span>
                                <span className="font-medium">{spec.value}</span>
                              </div>
                            ))}
                            {specs.length === 0 && !product.technicalSpecifications && (
                              <p className="text-gray-500 text-sm">Chưa có thông tin thông số kỹ thuật</p>
                            )}
                            {hasMore && (
                              <button
                                onClick={() => setShowDetailModal(true)}
                                className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                              >
                                Xem thêm
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng</h3>
                    <ul className="space-y-2">
                      {product.remoteControl && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Điều khiển từ xa</span>
                        </li>
                      )}
                      {product.timer && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Hẹn giờ tắt: {product.timer}</span>
                        </li>
                      )}
                      {product.oscillation && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Đảo chiều gió (Quay 360 độ)</span>
                        </li>
                      )}
                      {product.heightAdjustable && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Điều chỉnh độ cao</span>
                        </li>
                      )}
                      {product.naturalWindMode && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Chế độ gió tự nhiên</span>
                        </li>
                      )}
                      {product.sleepMode && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Chế độ ngủ</span>
                        </li>
                      )}
                      {product.autoShutoff && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Ngắt điện tự động khi quá tải</span>
                        </li>
                      )}
                      {product.temperatureSensor && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Cảm biến nhiệt</span>
                        </li>
                      )}
                      {product.energySaving && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Tiết kiệm điện</span>
                        </li>
                      )}
                      {product.energyRating && (
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Mức tiết kiệm điện: {product.energyRating}</span>
                        </li>
                      )}
                      {!product.remoteControl && !product.timer && !product.oscillation && !product.heightAdjustable && !product.naturalWindMode && !product.sleepMode && !product.autoShutoff && !product.temperatureSensor && !product.energySaving && (
                        <li className="text-gray-500 text-sm">Chưa có thông tin tính năng</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin vận chuyển</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Truck className="w-5 h-5 text-green-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">Giao hàng miễn phí</h4>
                          <p className="text-sm text-gray-600">Cho đơn hàng từ 500.000₫</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">Bảo hành chính hãng</h4>
                          <p className="text-sm text-gray-600">2 năm toàn quốc</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <RotateCcw className="w-5 h-5 text-purple-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">Đổi trả dễ dàng</h4>
                          <p className="text-sm text-gray-600">30 ngày đổi trả miễn phí</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-orange-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">Hỗ trợ 24/7</h4>
                          <p className="text-sm text-gray-600">Hotline: 1900 1234</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section - Centered */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Đánh giá sản phẩm</h2>
            <ProductReviews productId={product.id || parseInt(productId)} />
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[83vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between z-10">
                  <h2 className="text-xl font-bold text-gray-900">Chi tiết sản phẩm</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Thông số kỹ thuật */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
                      <div className="space-y-3">
                        {product.powerWatt && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Công suất</span>
                            <span className="font-medium">{product.powerWatt}W</span>
                          </div>
                        )}
                        {product.bladeDiameterCm && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Đường kính cánh quạt</span>
                            <span className="font-medium">{product.bladeDiameterCm}cm</span>
                          </div>
                        )}
                        {product.voltage && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Điện áp</span>
                            <span className="font-medium">{product.voltage}</span>
                          </div>
                        )}
                        {product.windSpeedLevels && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Tốc độ gió</span>
                            <span className="font-medium">{product.windSpeedLevels}</span>
                          </div>
                        )}
                        {product.airflow && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Lưu lượng gió</span>
                            <span className="font-medium">{product.airflow} m³/phút</span>
                          </div>
                        )}
                        {product.bladeMaterial && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Chất liệu cánh quạt</span>
                            <span className="font-medium">{product.bladeMaterial}</span>
                          </div>
                        )}
                        {product.bodyMaterial && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Chất liệu thân quạt</span>
                            <span className="font-medium">{product.bodyMaterial}</span>
                          </div>
                        )}
                        {product.bladeCount && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Số lượng cánh</span>
                            <span className="font-medium">{product.bladeCount} cánh</span>
                          </div>
                        )}
                        {product.noiseLevel && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Mức độ ồn</span>
                            <span className="font-medium">{product.noiseLevel} dB</span>
                          </div>
                        )}
                        {product.motorSpeed && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Tốc độ quay motor</span>
                            <span className="font-medium">{product.motorSpeed} vòng/phút</span>
                          </div>
                        )}
                        {product.weight && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Trọng lượng</span>
                            <span className="font-medium">{product.weight} kg</span>
                          </div>
                        )}
                        {product.adjustableHeight && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Chiều cao điều chỉnh</span>
                            <span className="font-medium">{product.adjustableHeight}</span>
                          </div>
                        )}
                        {product.warrantyMonths && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Bảo hành</span>
                            <span className="font-medium">{product.warrantyMonths} tháng</span>
                          </div>
                        )}
                        {product.technicalSpecifications && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Thông số kỹ thuật chi tiết</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{product.technicalSpecifications}</p>
                          </div>
                        )}
                        {!product.powerWatt && !product.bladeDiameterCm && !product.voltage && !product.windSpeedLevels && !product.technicalSpecifications && (
                          <p className="text-gray-500 text-sm">Chưa có thông tin thông số kỹ thuật</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Mô tả sản phẩm */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả sản phẩm</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-line">
                          {product.fullDescription || product.briefDescription || 'Chưa có mô tả sản phẩm'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tính năng */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {product.remoteControl && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Điều khiển từ xa</span>
                        </div>
                      )}
                      {product.timer && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Hẹn giờ tắt: {product.timer}</span>
                        </div>
                      )}
                      {product.oscillation && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Đảo chiều gió (Quay 360 độ)</span>
                        </div>
                      )}
                      {product.heightAdjustable && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Điều chỉnh độ cao</span>
                        </div>
                      )}
                      {product.naturalWindMode && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Chế độ gió tự nhiên</span>
                        </div>
                      )}
                      {product.sleepMode && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Chế độ ngủ</span>
                        </div>
                      )}
                      {product.autoShutoff && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Ngắt điện tự động khi quá tải</span>
                        </div>
                      )}
                      {product.temperatureSensor && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Cảm biến nhiệt</span>
                        </div>
                      )}
                      {product.energySaving && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Tiết kiệm điện</span>
                        </div>
                      )}
                      {product.energyRating && (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">Mức tiết kiệm điện: {product.energyRating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              </motion.div>
            </>
          )}
      </AnimatePresence>
    </div>
  );
}
