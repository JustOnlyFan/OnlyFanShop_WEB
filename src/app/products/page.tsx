'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Product, Category, Brand } from '@/types';
import { ProductService } from '@/services/productService';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Filter, ChevronDown, ShoppingBag, FileText, DollarSign, ArrowUpDown, Search } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('categoryId');
  const brandId = searchParams.get('brandId');
  const priceRange = searchParams.get('priceRange');
  const productType = searchParams.get('productType');
  const bladeCount = searchParams.get('bladeCount');
  const utility = searchParams.get('utility');
  const sortBy = searchParams.get('sortBy') || 'ProductID';
  const order = searchParams.get('order') || 'DESC';
  
  const [selectedFilters, setSelectedFilters] = useState({
    brandId: brandId || '',
    priceRange: priceRange || '',
    productType: categoryId || productType || '',
    bladeCount: bladeCount || '',
    utility: utility || ''
  });

  // Tối ưu: Dùng React Query để cache categories và brands
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ProductService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000, // 30 phút (renamed from cacheTime in v5)
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => ProductService.getBrands(),
    staleTime: 10 * 60 * 1000, // 10 phút
    gcTime: 30 * 60 * 1000, // 30 phút (renamed from cacheTime in v5)
  });

  // Tối ưu: Dùng React Query cho products với caching
  const queryParams = useMemo(() => ({
    keyword,
    categoryId: categoryId ? parseInt(categoryId) : undefined,
    brandId: brandId ? parseInt(brandId) : undefined,
    page: currentPage,
    size: 12,
    sortBy,
    order
  }), [keyword, categoryId, brandId, currentPage, sortBy, order]);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => ProductService.getHomepage(queryParams),
    staleTime: 2 * 60 * 1000, // 2 phút
    gcTime: 5 * 60 * 1000, // 5 phút (renamed from cacheTime in v5)
    placeholderData: (previousData) => previousData, // Giữ data cũ khi đang fetch data mới (renamed from keepPreviousData in v5)
  });

  // Update state từ React Query
  useEffect(() => {
    if (categoriesData?.data) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (brandsData?.data) {
      setBrands(brandsData.data);
    }
  }, [brandsData]);

  useEffect(() => {
    if (productsData?.data) {
      setProducts(productsData.data.products || []);
      setTotalPages(productsData.data.pagination?.totalPages || 1);
      setTotalProducts(productsData.data.pagination?.totalElements || 0);
    }
    setLoading(isLoadingProducts);
  }, [productsData, isLoadingProducts]);

  const updateURL = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    router.push(`/products?${newParams.toString()}`);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    let urlKey = filterType;
    // Map productType to categoryId when selecting from dropdown
    if (filterType === 'productType' && value) {
      urlKey = 'categoryId';
      setSelectedFilters(prev => ({ ...prev, productType: value }));
      updateURL({ categoryId: value || null });
    } else {
      urlKey = filterType === 'brandId' ? 'brandId' : filterType;
      setSelectedFilters(prev => ({ ...prev, [filterType]: value }));
      updateURL({ [urlKey]: value || null });
    }
    setCurrentPage(1);
  };

  const handleSort = (newSortBy: string, newOrder: string) => {
    updateURL({ sortBy: newSortBy, order: newOrder });
  };

  const handleCategoryClick = (catId: number) => {
    updateURL({ categoryId: catId.toString() });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading || isLoadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Map category name to icon
  const getCategoryIcon = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes('không cánh') || name.includes('tuần hoàn')) return '🌀';
    if (name.includes('hộp')) return '📦';
    if (name.includes('hút')) return '💨';
    if (name.includes('sắc màu') || name.includes('màu')) return '🎨';
    return '🪭';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
          {/* Filter Dropdowns */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 relative z-20">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
              </button>

              <div className="relative">
                  <select
                      value={selectedFilters.brandId}
                      onChange={(e) => handleFilterChange('brandId', e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer whitespace-nowrap"
                  >
                      <option value="">Thương hiệu</option>
                      {brands.map((brand) => (
                          <option key={brand.brandID} value={brand.brandID}>
                              {brand.name}
                          </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                  <select
                      value={selectedFilters.priceRange}
                      onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer whitespace-nowrap"
                  >
                      <option value="">Giá bán</option>
                      <option value="0-500000">Dưới 500.000₫</option>
                      <option value="500000-1000000">500.000₫ - 1.000.000₫</option>
                      <option value="1000000-2000000">1.000.000₫ - 2.000.000₫</option>
                      <option value="2000000-5000000">2.000.000₫ - 5.000.000₫</option>
                      <option value="5000000-">Trên 5.000.000₫</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                  <select
                      value={selectedFilters.productType}
                      onChange={(e) => handleFilterChange('productType', e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer whitespace-nowrap"
                  >
                      <option value="">Loại sản phẩm</option>
                      {categories.map((category) => (
                          <option key={category.id} value={category.id.toString()}>
                              {category.name}
                          </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                  <select
                      value={selectedFilters.bladeCount}
                      onChange={(e) => handleFilterChange('bladeCount', e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer whitespace-nowrap"
                  >
                      <option value="">Số cánh quạt</option>
                      <option value="3">3 cánh</option>
                      <option value="4">4 cánh</option>
                      <option value="5">5 cánh</option>
                      <option value="6">6 cánh</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                  <select
                      value={selectedFilters.utility}
                      onChange={(e) => handleFilterChange('utility', e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer whitespace-nowrap"
                  >
                      <option value="">Tiện ích</option>
                      <option value="remote">Điều khiển từ xa</option>
                      <option value="timer">Hẹn giờ</option>
                      <option value="oscillation">Quay 360 độ</option>
                      <option value="led">Đèn LED</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
          </div>

        {/* Product Count and Sort Buttons */}
          <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center gap-4">
              {/* Title + sort buttons nhóm sát nhau */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">
                      Quạt ({totalProducts} Sản Phẩm)
                  </h2>

                  {/* Sort Buttons sát bên trái */}
                  <div className="flex flex-wrap gap-2">
                      <button
                          onClick={() => handleSort('recommended', 'DESC')}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                      >
                          <ShoppingBag className="w-4 h-4" />
                          Nên mua
                      </button>

                      <button
                          onClick={() => handleSort('sold', 'DESC')}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                      >
                          <FileText className="w-4 h-4" />
                          Bán chạy
                      </button>

                      <button
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                      >
                          <DollarSign className="w-4 h-4" />
                          Trả góp 0%
                      </button>

                      <button
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                          New 2025
                      </button>

                      <button
                          onClick={() => handleSort('price', 'ASC')}
                          className={`px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 ${
                              sortBy === 'price' && order === 'ASC' ? 'bg-blue-50 border-blue-500 text-blue-700' : ''
                          }`}
                      >
                          <ArrowUpDown className="w-4 h-4" />
                          Giá thấp &gt; cao
                      </button>

                      <button
                          onClick={() => handleSort('price', 'DESC')}
                          className={`px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 ${
                              sortBy === 'price' && order === 'DESC' ? 'bg-blue-50 border-blue-500 text-blue-700' : ''
                          }`}
                      >
                          <ArrowUpDown className="w-4 h-4" />
                          Giá cao &gt; thấp
                      </button>
                  </div>
              </div>
          </div>


          {/* Category Selection */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn quạt theo loại:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id || 0)}
                  className={`flex flex-col items-center justify-center p-4 bg-white border-2 rounded-lg transition-all ${
                    categoryId === category.id?.toString()
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <span className="text-3xl mb-2">{getCategoryIcon(category.name)}</span>
                  <span className="text-xs font-medium text-gray-700 text-center">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        {products.length > 0 ? (
          <>
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3'
                : 'space-y-3'
            }>
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-gray-600 mb-4">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
