'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/services/productService';
import { Brand, Category, Product } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { ProductsSection } from '@/components/home/ProductsSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { BrandsSection } from '@/components/home/BrandsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { StatsSection } from '@/components/home/StatsSection';
import { AlertCircle } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: homepageData, isLoading, error: homepageError, refetch } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const response = await ProductService.getHomepage({ size: 12 });
      return response;
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  } as any);

  useEffect(() => {
    if (homepageData) {
      const data = (homepageData as any)?.data || homepageData;
      
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
        
        setFeaturedProducts(products);
        setCategories(categories);
        setBrands(brands);
        setError(null);
      }
    } else if (homepageError) {
      setError('Không thể tải dữ liệu trang chủ. Vui lòng thử lại sau.');
    }
  }, [homepageData, homepageError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
            <button onClick={() => { setError(null); refetch(); }} className="text-red-600 hover:text-red-800 underline text-sm">
              Thử lại
            </button>
          </div>
        </div>
      )}

      <HeroSection />
      <FeaturesSection />
      <ProductsSection products={featuredProducts} />
      <CategoriesSection categories={categories} />
      <BrandsSection brands={brands} />
      <StatsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}
