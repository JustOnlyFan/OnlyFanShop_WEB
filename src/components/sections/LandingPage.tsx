'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProductService } from '@/services/productService'
import { Product } from '@/services/productService'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { 
  Search, 
  Filter, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  ShoppingBag,
  Zap,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export function LandingPage() {
  const [loading, setLoading] = useState(true)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  // Fetch featured products from API
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => ProductService.getHomepage({ size: 6 }),
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update featured products when data is loaded
  useEffect(() => {
    if (productsData?.data) {
      setFeaturedProducts(productsData.data.products || [])
    }
  }, [productsData])

  // Handle error
  useEffect(() => {
    if (error) {
      console.error('Featured products fetch error:', error)
    }
  }, [error])

  useEffect(() => {
    if (!isLoading) {
      setLoading(false)
    }
  }, [isLoading])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-400 rounded-full opacity-10 animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              OnlyFan Shop
              <span className="block text-yellow-400">Quạt Điện Cao Cấp</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Khám phá bộ sưu tập quạt điện đa dạng từ các thương hiệu uy tín. 
              Từ quạt đứng, quạt trần đến quạt không cánh cao cấp.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Khám phá sản phẩm
                </Button>
              </Link>
              <Link href="/brands">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <Star className="w-5 h-5 mr-2" />
                  Thương hiệu nổi bật
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những sản phẩm quạt điện được yêu thích nhất với chất lượng vượt trội
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 6).map((product, index) => (
                <div key={product.id || index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {product.imageURL ? (
                      <img 
                        src={product.imageURL} 
                        alt={product.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">🌀</div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">({Math.floor(Math.random() * 100) + 20} đánh giá)</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.productName}</h3>
                    <p className="text-gray-600 mb-4">{product.briefDescription || 'Sản phẩm chất lượng cao từ thương hiệu ' + (product.brand?.name || 'uy tín')}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">
                        {product.price ? product.price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}
                      </span>
                      <Link href={`/products/${product.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Xem chi tiết
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Chưa có sản phẩm nổi bật
              </h3>
              <p className="text-gray-600 mb-6">
                Sản phẩm sẽ được cập nhật sớm nhất
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Xem tất cả sản phẩm
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn OnlyFan Shop?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến những sản phẩm quạt điện chất lượng cao nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600">Giao hàng trong 24h tại TP.HCM, 2-3 ngày cho các tỉnh thành khác</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bảo hành chính hãng</h3>
              <p className="text-gray-600">Bảo hành 2 năm cho tất cả sản phẩm, hỗ trợ 24/7</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Đổi trả dễ dàng</h3>
              <p className="text-gray-600">Đổi trả trong 7 ngày nếu không hài lòng, miễn phí vận chuyển</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Danh Mục Sản Phẩm
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá đa dạng các loại quạt điện phù hợp với nhu cầu của bạn
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Quạt Đứng', icon: TrendingUp, href: '/products?category=standing' },
              { name: 'Quạt Trần', icon: Zap, href: '/products?category=ceiling' },
              { name: 'Quạt Không Cánh', icon: Award, href: '/products?category=bladeless' },
              { name: 'Quạt Hơi Nước', icon: Users, href: '/products?category=water' }
            ].map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="group bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <category.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">Xem sản phẩm</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Brands */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Thương Hiệu Uy Tín
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những thương hiệu hàng đầu trong lĩnh vực quạt điện
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              'Panasonic', 'Mitsubishi', 'Daikin', 'Toshiba',
              'Sharp', 'Samsung', 'LG', 'Electrolux'
            ].map((brand, index) => (
              <Link
                key={index}
                href={`/products?brand=${brand.toLowerCase()}`}
                className="group text-center"
              >
                <div className="bg-gray-100 rounded-lg p-8 hover:bg-gray-200 transition-colors">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-md transition-shadow">
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{brand}</h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/brands">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                Xem tất cả thương hiệu
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tại sao khách hàng tin tưởng OnlyFan Shop?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Hơn 10 năm kinh nghiệm trong lĩnh vực quạt điện
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">50,000+ Khách hàng</h3>
              <p className="text-blue-100">Tin tưởng và hài lòng với dịch vụ của chúng tôi</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1000+ Sản phẩm</h3>
              <p className="text-blue-100">Đa dạng mẫu mã từ các thương hiệu uy tín</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">99% Hài lòng</h3>
              <p className="text-blue-100">Khách hàng đánh giá 5 sao về chất lượng dịch vụ</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sẵn sàng tìm quạt điện phù hợp?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Liên hệ với chúng tôi để được tư vấn miễn phí về sản phẩm phù hợp nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Liên hệ ngay
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Xem sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}