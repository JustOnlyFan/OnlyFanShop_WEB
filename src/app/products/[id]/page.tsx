'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/types';
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
  Share2, 
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
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductReviews } from '@/components/product/ProductReviews';

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  const params = useParams();
  const productId = params.id as string;
  const { addItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProductById(parseInt(productId));
      if (response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error fetching product detail:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
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
                src={product.imageURL || '/images/placeholder.svg'}
                alt={product.productName}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/placeholder.jpg';
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
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Thêm vào giỏ hàng
                    </>
                  )}
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
                
                <Button
                  onClick={handleToggleLike}
                  variant="outline"
                  className={`p-4 ${isLiked ? 'text-red-500 border-red-500' : 'text-gray-600 border-gray-300'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                
                <Button variant="outline" className="p-4">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Zap className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Tiết kiệm điện</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <Award className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-purple-700">Chất lượng cao</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Được yêu thích</span>
              </div>
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
                  { id: 'reviews', label: 'Đánh giá' },
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
                  <p className="text-gray-700 leading-relaxed">
                    {(product as any).description || product.briefDescription}
                  </p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Công suất</span>
                        <span className="font-medium">120W</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Đường kính</span>
                        <span className="font-medium">40cm</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Tốc độ quạt</span>
                        <span className="font-medium">3 mức</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Chất liệu</span>
                        <span className="font-medium">Nhựa ABS</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Điều khiển từ xa</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Hẹn giờ tắt</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Quay 360 độ</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Tiết kiệm điện</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <ProductReviews productId={product.id || parseInt(productId)} />
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
      </div>
    </div>
  );
}