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
  Award,
  Users,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch homepage data
  const { data: homepageData, isLoading, error: homepageError } = useQuery({
    queryKey: ['homepage'],
    queryFn: () => ProductService.getHomepage({ size: 8 }),
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle homepage data
  useEffect(() => {
    if (homepageData?.data) {
      setFeaturedProducts(homepageData.data.products || []);
      setCategories(homepageData.data.categories || []);
      setBrands(homepageData.data.brands || []);
    }
  }, [homepageData]);

  // Fetch banners
  const { data: bannersData, error: bannersError } = useQuery({
    queryKey: ['banners'],
    queryFn: () => BannerService.getHomepageBanners(),
    retry: 2,
    retryDelay: 1000,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (bannersData) {
      setBanners(bannersData);
    }
  }, [bannersData]);

  // Auto-refresh data on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 2000); // Fallback timeout

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Desktop-style Content Windows */}
      <div className="relative z-20 pt-16">
        {/* Featured Products Window */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8 p-6"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                  Sản phẩm nổi bật
                </h2>
                <p className="text-lg text-gray-200 drop-shadow-md">
                  Những sản phẩm được yêu thích nhất với hiệu ứng 3D
                </p>
              </div>
              <Link href="/products">
                <Button variant="outline" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard3D
                  key={product.id}
                  product={product}
                  className="hover:shadow-2xl transition-shadow duration-300"
                />
              ))}
            </div>
          </div>

          {/* Categories Window */}
          <div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8 p-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                Danh mục sản phẩm
              </h2>
              <p className="text-lg text-gray-200 drop-shadow-md">
                Khám phá đa dạng các loại quạt điện
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.id}`}
                  className="group bg-white/20 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/40 transition-colors">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/products">
                <Button variant="outline" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  Xem tất cả danh mục
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Brands Window */}
          <div 
            className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8 p-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                Thương hiệu đối tác
              </h2>
              <p className="text-lg text-gray-200 drop-shadow-md">
                Những thương hiệu uy tín hàng đầu
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {brands.slice(0, 6).map((brand) => (
                <Link
                  key={brand.brandID}
                  href={`/products?brand=${brand.brandID}`}
                  className="group bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl hover:bg-white/30 transition-all duration-300 border border-white/30"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/30 rounded flex items-center justify-center mx-auto mb-2 group-hover:bg-white/40 transition-colors">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                      {brand.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}