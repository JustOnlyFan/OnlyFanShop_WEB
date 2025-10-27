'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/productService';
import { Brand } from '@/types';
import { Product } from '@/services/productService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { 
  Award, 
  Star, 
  TrendingUp, 
  Users, 
  Globe, 
  Shield,
  Zap,
  Heart,
  ArrowRight,
  Search,
  Filter,
  Grid,
  List,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch brands and products
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => ProductService.getBrands()
  });
  const { data: productsData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => ProductService.getHomepage({ size: 12 })
  });

  useEffect(() => {
    if (brandsData?.data) setBrands(brandsData.data);
    if (productsData?.data) setFeaturedProducts(productsData.data.products || []);
    setLoading(false);
  }, [brandsData, productsData]);

  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBrandStats = (brandId: number) => {
    const brandProducts = featuredProducts.filter(product => product.brand?.brandID === brandId);
    return {
      productCount: brandProducts.length,
      avgRating: 4.5 + Math.random() * 0.5, // Mock data
      totalSales: Math.floor(Math.random() * 10000) + 1000
    };
  };

  const getBrandStory = (brandName: string) => {
    const stories: { [key: string]: string } = {
      'Panasonic': 'Từ năm 1918, Panasonic đã dẫn đầu trong công nghệ điện tử với sứ mệnh "A Better Life, A Better World". Quạt điện Panasonic kết hợp công nghệ tiên tiến và thiết kế bền vững.',
      'Mitsubishi': 'Mitsubishi Electric với hơn 100 năm kinh nghiệm, cam kết mang đến những sản phẩm quạt điện tiết kiệm năng lượng và thân thiện môi trường.',
      'Daikin': 'Daikin - thương hiệu Nhật Bản hàng đầu về HVAC, nổi tiếng với công nghệ inverter tiên tiến và hiệu suất năng lượng cao.',
      'Sharp': 'Sharp với công nghệ Plasmacluster độc quyền, mang đến không khí trong lành và sạch khuẩn cho mọi gia đình.',
      'Toshiba': 'Toshiba - niềm tin từ Nhật Bản, kết hợp truyền thống và đổi mới trong từng sản phẩm quạt điện.'
    };
    return stories[brandName] || 'Thương hiệu uy tín với cam kết chất lượng và dịch vụ tốt nhất.';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              Thương Hiệu
              <span className="block text-yellow-400">Uy Tín</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Khám phá những thương hiệu hàng đầu thế giới, 
              mang đến sản phẩm quạt điện chất lượng cao và đáng tin cậy
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                <Award className="w-5 h-5 mr-2" />
                Khám phá thương hiệu
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Star className="w-5 h-5 mr-2" />
                Sản phẩm nổi bật
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm thương hiệu..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Xem:</span>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              <span className="text-sm text-gray-600">
                {filteredBrands.length} thương hiệu
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredBrands.map((brand) => {
              const stats = getBrandStats(brand.brandID);
              const story = getBrandStory(brand.name);
              
              return (
                <div
                  key={brand.brandID}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  {/* Brand Header */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 p-6">
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                    <div className="relative z-10 flex items-center justify-between h-full">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {brand.name}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          Thương hiệu uy tín
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Brand Content */}
                  <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.productCount}
                        </div>
                        <div className="text-xs text-gray-600">Sản phẩm</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.avgRating.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600">Đánh giá</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.totalSales.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Bán ra</div>
                      </div>
                    </div>

                    {/* Brand Story */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-red-500" />
                        Câu chuyện thương hiệu
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {story}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Shield className="w-4 h-4 mr-2 text-green-500" />
                        Bảo hành chính hãng
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                        Tiết kiệm năng lượng
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2 text-blue-500" />
                        Thân thiện môi trường
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/products?brand=${brand.brandID}`} className="flex-1">
                        <Button className="w-full">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Xem sản phẩm
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedBrand(brand)}
                        className="px-4"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredBrands.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy thương hiệu
              </h3>
              <p className="text-gray-600 mb-4">
                Thử thay đổi từ khóa tìm kiếm
              </p>
              <Button onClick={() => setSearchQuery('')}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Our Brands */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn thương hiệu của chúng tôi?
            </h2>
            <p className="text-lg text-gray-600">
              Cam kết mang đến những thương hiệu tốt nhất thế giới
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chính hãng 100%</h3>
              <p className="text-gray-600">Sản phẩm chính hãng từ nhà sản xuất</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bảo hành toàn diện</h3>
              <p className="text-gray-600">Bảo hành chính hãng trên toàn quốc</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Dịch vụ chuyên nghiệp</h3>
              <p className="text-gray-600">Đội ngũ kỹ thuật chuyên nghiệp</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-200 transition-colors">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chất lượng cao</h3>
              <p className="text-gray-600">Tiêu chuẩn chất lượng quốc tế</p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Detail Modal */}
      {selectedBrand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600 p-8">
              <div className="absolute inset-0 bg-black opacity-20"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {selectedBrand.name}
                  </h3>
                  <p className="text-blue-100">
                    Thương hiệu uy tín hàng đầu
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedBrand(null)}
                  className="bg-white/20 border-white text-white hover:bg-white hover:text-blue-600"
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">
                    Thông tin thương hiệu
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-gray-700">Thương hiệu quốc tế</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-gray-700">Bảo hành chính hãng</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-600 mr-3" />
                      <span className="text-gray-700">Đánh giá cao từ khách hàng</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">
                    Thống kê
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sản phẩm:</span>
                      <span className="font-semibold">{getBrandStats(selectedBrand.brandID).productCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đánh giá:</span>
                      <span className="font-semibold">{getBrandStats(selectedBrand.brandID).avgRating.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã bán:</span>
                      <span className="font-semibold">{getBrandStats(selectedBrand.brandID).totalSales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  Câu chuyện thương hiệu
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {getBrandStory(selectedBrand.name)}
                </p>
              </div>
              
              <div className="mt-8 flex gap-4">
                <Link href={`/products?brand=${selectedBrand.brandID}`} className="flex-1">
                  <Button className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Xem sản phẩm
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setSelectedBrand(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
