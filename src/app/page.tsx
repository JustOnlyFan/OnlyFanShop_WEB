'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/productService';
import { BannerService, Banner } from '@/services/bannerService';
import { Brand, Category } from '@/types';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { ProductCard3D } from '@/components/product/ProductCard3D';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Award,
  Users,
  ShoppingBag,
  Package,
  Sparkles,
  CheckCircle,
  Clock,
  Mail,
  ChevronLeft,
  ChevronRight,
  Quote,
  Zap,
  Globe,
  Heart,
  ThumbsUp,
  Gift,
  CreditCard,
  MapPin,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Hero banners (fallback if API doesn't have banners)
  const heroBanners = [
    {
      id: '1',
      title: 'Quạt Điện Cao Cấp',
      description: 'Khám phá bộ sưu tập quạt điện đa dạng với chất lượng hàng đầu',
      imageUrl: '/api/placeholder/1200/400',
      linkUrl: '/products',
      gradient: 'from-blue-600 via-cyan-600 to-blue-500'
    },
    {
      id: '2',
      title: 'Thương Hiệu Uy Tín',
      description: 'Sản phẩm từ các thương hiệu nổi tiếng thế giới',
      imageUrl: '/api/placeholder/1200/400',
      linkUrl: '/brands',
      gradient: 'from-purple-600 via-pink-600 to-purple-500'
    },
    {
      id: '3',
      title: 'Giao Hàng Nhanh',
      description: 'Miễn phí vận chuyển cho đơn hàng trên 500.000đ',
      imageUrl: '/api/placeholder/1200/400',
      linkUrl: '/products',
      gradient: 'from-green-600 via-emerald-600 to-green-500'
    }
  ];

  // Fetch homepage data
  const { data: homepageData, isLoading, error: homepageError, refetch } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      try {
        const response = await ProductService.getHomepage({ size: 12 });
        console.log('Homepage data received:', response);
        return response;
      } catch (err: any) {
        console.error('Error fetching homepage data:', err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });

  // Handle homepage data
  useEffect(() => {
    if (homepageData) {
      console.log('Homepage data structure:', homepageData);
      
      const data = homepageData.data || homepageData;
      
      if (data) {
        const products = (data.products || []).map((p: any) => ({
          ...p,
          id: p.id || p.productID,
          productID: p.productID || p.id,
        }));
        
        const categories = (data.categories || []).map((c: any) => ({
          id: c.id || c.categoryID,
          name: c.name || c.categoryName,
        }));
        
        const brands = (data.brands || []).map((b: any) => ({
          brandID: b.brandID || b.id,
          name: b.name || b.brandName,
          imageURL: b.imageURL,
        }));
        
        console.log('Normalized data:', {
          products: products.length,
          categories: categories.length,
          brands: brands.length,
        });
        
        setFeaturedProducts(products);
        setCategories(categories);
        setBrands(brands);
        setError(null);
      } else {
        console.warn('No data in homepage response');
        setError('Không có dữ liệu để hiển thị');
      }
    } else if (homepageError) {
      console.error('Homepage error:', homepageError);
      setError('Không thể tải dữ liệu trang chủ. Vui lòng thử lại sau.');
    }
  }, [homepageData, homepageError]);

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  // Stats data
  const stats = [
    { icon: Users, value: '10K+', label: 'Khách hàng' },
    { icon: Package, value: '500+', label: 'Sản phẩm' },
    { icon: Award, value: '50+', label: 'Thương hiệu' },
    { icon: ThumbsUp, value: '99%', label: 'Hài lòng' },
  ];

  // Features data
  const features = [
    {
      icon: Truck,
      title: 'Giao hàng nhanh',
      description: 'Miễn phí vận chuyển cho đơn hàng trên 500.000đ',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Bảo hành chính hãng',
      description: 'Cam kết bảo hành từ nhà sản xuất',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: RotateCcw,
      title: 'Đổi trả dễ dàng',
      description: 'Đổi trả trong vòng 7 ngày',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Phone,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ CSKH luôn sẵn sàng',
      color: 'from-orange-500 to-red-500'
    },
  ];

  // Testimonials data
  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Khách hàng',
      content: 'Sản phẩm chất lượng tốt, giao hàng nhanh. Tôi rất hài lòng!',
      rating: 5,
      avatar: '👤'
    },
    {
      name: 'Trần Thị B',
      role: 'Khách hàng',
      content: 'Quạt điện hoạt động êm, tiết kiệm điện. Đáng mua!',
      rating: 5,
      avatar: '👤'
    },
    {
      name: 'Lê Văn C',
      role: 'Khách hàng',
      content: 'Dịch vụ chăm sóc khách hàng rất tốt. Cảm ơn OnlyFan!',
      rating: 5,
      avatar: '👤'
    },
  ];

  if (loading && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-[500px] lg:h-[600px]">
          <AnimatePresence mode="wait">
            {heroBanners.map((banner, index) => (
              index === currentBannerIndex && (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} flex items-center justify-center`}
                >
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white z-10">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl lg:text-6xl font-bold mb-4 drop-shadow-lg"
                    >
                      {banner.title}
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-xl lg:text-2xl mb-8 drop-shadow-md"
                    >
                      {banner.description}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Link href={banner.linkUrl}>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold shadow-xl rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                        >
                          Khám phá ngay
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
          
          {/* Banner Navigation */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {heroBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentBannerIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>

          {/* Banner Arrows */}
          <button
            onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full z-20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % heroBanners.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full z-20 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      <div className="relative z-20 -mt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-2xl p-8 mb-12 border border-gray-200"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4 shadow-lg">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  refetch();
                }}
                className="text-red-600 hover:text-red-800 underline text-sm"
              >
                Thử lại
              </button>
            </motion.div>
          )}

          {/* Features Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Tại sao chọn OnlyFan?
              </h2>
              <p className="text-gray-600 text-lg">Những lý do bạn nên tin tưởng chúng tôi</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-4 shadow-md`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Featured Products Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 mb-12 p-6 lg:p-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  Sản phẩm nổi bật
                </h2>
                <p className="text-gray-600 text-lg">
                  Những sản phẩm được yêu thích nhất với hiệu ứng 3D
                </p>
              </div>
              <Link href="/products">
                <button
                  type="button"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 hover:from-blue-700 hover:to-cyan-700 shadow-lg px-6 py-3 text-base rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 8).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard3D
                      product={product}
                      className="hover:shadow-2xl transition-shadow duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Chưa có sản phẩm nào</p>
                <Link href="/products" className="mt-4 inline-block">
                  <Button variant="outline" className="mt-4">
                    Khám phá sản phẩm
                  </Button>
                </Link>
              </div>
            )}
          </motion.section>

          {/* Categories Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 mb-12 p-6 lg:p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Danh mục sản phẩm
              </h2>
              <p className="text-gray-600 text-lg">
                Khám phá đa dạng các loại quạt điện
              </p>
            </div>

            {categories.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                  {categories.slice(0, 8).map((category, index) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={`/products?category=${category.id}`}
                        className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-300 block"
                      >
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                            <TrendingUp className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link href="/products">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 hover:from-blue-700 hover:to-cyan-700 shadow-lg px-6 py-3 text-base rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Xem tất cả danh mục
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Chưa có danh mục nào</p>
              </div>
            )}
          </motion.section>

          {/* Brands Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 mb-12 p-6 lg:p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Thương hiệu đối tác
              </h2>
              <p className="text-gray-600 text-lg">
                Những thương hiệu uy tín hàng đầu
              </p>
            </div>

            {brands.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
                {brands.slice(0, 6).map((brand, index) => (
                  <motion.div
                    key={brand.brandID}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/products?brand=${brand.brandID}`}
                      className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-300 block"
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                          {brand.name}
                        </h3>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Chưa có thương hiệu nào</p>
              </div>
            )}
          </motion.section>

          {/* Testimonials Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Khách hàng nói gì về chúng tôi
              </h2>
              <p className="text-gray-600 text-lg">Những đánh giá chân thực từ khách hàng</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-blue-500 mb-4" />
                  <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl mr-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Newsletter Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 rounded-2xl shadow-2xl p-8 lg:p-12 mb-12 text-white"
          >
            <div className="max-w-2xl mx-auto text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-80" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Đăng ký nhận tin khuyến mãi
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newsletterEmail) {
                      alert('Cảm ơn bạn đã đăng ký!');
                      setNewsletterEmail('');
                    }
                  }}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}