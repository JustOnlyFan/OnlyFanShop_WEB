'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Product, Category, Brand } from '@/types';
import { ProductService } from '@/services/productService';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Filter, ChevronDown, ShoppingBag, FileText, ArrowUpDown, Search, X, Wind, Clock, RotateCcw } from 'lucide-react';

interface FilterState {
  brandId: string;
  minPrice: string;
  maxPrice: string;
  categoryId: string;
  bladeCount: string;
  remoteControl: boolean;
  oscillation: boolean;
  timer: boolean;
  minPower: string;
  maxPower: string;
}

const PRICE_RANGES = [
  { label: 'Dưới 500K', min: '0', max: '500000' },
  { label: '500K - 1 triệu', min: '500000', max: '1000000' },
  { label: '1 - 2 triệu', min: '1000000', max: '2000000' },
  { label: '2 - 5 triệu', min: '2000000', max: '5000000' },
  { label: 'Trên 5 triệu', min: '5000000', max: '' },
];

const POWER_RANGES = [
  { label: 'Dưới 50W', min: '0', max: '50' },
  { label: '50W - 70W', min: '50', max: '70' },
  { label: '70W - 100W', min: '70', max: '100' },
  { label: 'Trên 100W', min: '100', max: '' },
];

const BLADE_COUNTS = [3, 4, 5, 6, 7];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const categoryId = searchParams.get('categoryId');
  const brandId = searchParams.get('brandId');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const bladeCount = searchParams.get('bladeCount');
  const remoteControl = searchParams.get('remoteControl') === 'true';
  const oscillation = searchParams.get('oscillation') === 'true';
  const timer = searchParams.get('timer') === 'true';
  const minPower = searchParams.get('minPower');
  const maxPower = searchParams.get('maxPower');
  const sortBy = searchParams.get('sortBy') || 'ProductID';
  const order = searchParams.get('order') || 'DESC';
  
  const [tempFilters, setTempFilters] = useState<FilterState>({
    brandId: '', minPrice: '', maxPrice: '', categoryId: '', bladeCount: '',
    remoteControl: false, oscillation: false, timer: false, minPower: '', maxPower: ''
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ProductService.getCategories(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => ProductService.getBrands(),
    staleTime: 10 * 60 * 1000,
  });

  const queryParams = useMemo(() => ({
    keyword,
    categoryId: categoryId ? parseInt(categoryId) : undefined,
    brandId: brandId ? parseInt(brandId) : undefined,
    minPrice: minPrice ? parseInt(minPrice) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
    bladeCount: bladeCount ? parseInt(bladeCount) : undefined,
    remoteControl: remoteControl || undefined,
    oscillation: oscillation || undefined,
    timer: timer || undefined,
    minPower: minPower ? parseInt(minPower) : undefined,
    maxPower: maxPower ? parseInt(maxPower) : undefined,
    page: currentPage, size: 12, sortBy, order
  }), [keyword, categoryId, brandId, minPrice, maxPrice, bladeCount, remoteControl, oscillation, timer, minPower, maxPower, currentPage, sortBy, order]);

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => ProductService.getHomepage(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  useEffect(() => { if (categoriesData?.data) setCategories(categoriesData.data); }, [categoriesData]);
  useEffect(() => { if (brandsData?.data) setBrands(brandsData.data); }, [brandsData]);
  useEffect(() => {
    if (productsData?.data) {
      setProducts(productsData.data.products || []);
      setTotalPages(productsData.data.pagination?.totalPages || 1);
      setTotalProducts(productsData.data.pagination?.totalElements || 0);
    }
    setLoading(isLoadingProducts);
  }, [productsData, isLoadingProducts]);

  // Sync URL to temp filters when popup opens
  useEffect(() => {
    if (showFilterPopup) {
      setTempFilters({
        brandId: brandId || '', minPrice: minPrice || '', maxPrice: maxPrice || '',
        categoryId: categoryId || '', bladeCount: bladeCount || '',
        remoteControl, oscillation, timer, minPower: minPower || '', maxPower: maxPower || ''
      });
    }
  }, [showFilterPopup, brandId, minPrice, maxPrice, categoryId, bladeCount, remoteControl, oscillation, timer, minPower, maxPower]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateURL = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    router.push(`/products?${newParams.toString()}`);
  };

  const applyFilters = () => {
    updateURL({
      brandId: tempFilters.brandId || null, categoryId: tempFilters.categoryId || null,
      minPrice: tempFilters.minPrice || null, maxPrice: tempFilters.maxPrice || null,
      bladeCount: tempFilters.bladeCount || null,
      remoteControl: tempFilters.remoteControl ? 'true' : null,
      oscillation: tempFilters.oscillation ? 'true' : null,
      timer: tempFilters.timer ? 'true' : null,
      minPower: tempFilters.minPower || null, maxPower: tempFilters.maxPower || null,
    });
    setShowFilterPopup(false);
    setCurrentPage(1);
  };

  const clearTempFilters = () => {
    setTempFilters({
      brandId: '', minPrice: '', maxPrice: '', categoryId: '', bladeCount: '',
      remoteControl: false, oscillation: false, timer: false, minPower: '', maxPower: ''
    });
  };

  const clearURLFilters = () => { router.push('/products'); setCurrentPage(1); };
  const handleSort = (newSortBy: string, newOrder: string) => updateURL({ sortBy: newSortBy, order: newOrder });
  const handlePageChange = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const getActiveFilterCount = () => {
    let count = 0;
    if (brandId) count++;
    if (minPrice || maxPrice) count++;
    if (categoryId) count++;
    if (bladeCount) count++;
    if (remoteControl) count++;
    if (oscillation) count++;
    if (timer) count++;
    if (minPower || maxPower) count++;
    return count;
  };

  const handlePriceSelect = (min: string, max: string) => {
    if (tempFilters.minPrice === min && tempFilters.maxPrice === max) {
      setTempFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }));
    } else {
      setTempFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
    }
  };

  const handlePowerSelect = (min: string, max: string) => {
    if (tempFilters.minPower === min && tempFilters.maxPower === max) {
      setTempFilters(prev => ({ ...prev, minPower: '', maxPower: '' }));
    } else {
      setTempFilters(prev => ({ ...prev, minPower: min, maxPower: max }));
    }
  };

  if (loading || isLoadingProducts) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-10 sm:px-16 lg:px-24 xl:px-32 py-6">
        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Main Filter Button */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilterPopup(!showFilterPopup)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                getActiveFilterCount() > 0 || showFilterPopup
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Bộ lọc</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-white text-blue-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilterPopup ? 'rotate-180' : ''}`} />
            </button>

          {/* Filter Popup - Dropdown style */}
          {showFilterPopup && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-[calc(75vw-2rem)] max-w-[900px]">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Bộ lọc sản phẩm</h3>
                <button onClick={() => setShowFilterPopup(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="p-5 max-h-[400px] overflow-y-auto overscroll-contain space-y-5">
                {/* Thương hiệu */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                    <span className="text-sm font-semibold text-gray-800">Thương hiệu</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((brand) => (
                      <button
                        key={brand.brandID}
                        onClick={() => setTempFilters(prev => ({ 
                          ...prev, 
                          brandId: prev.brandId === brand.brandID?.toString() ? '' : brand.brandID?.toString() || '' 
                        }))}
                        className={`px-3 py-2 border rounded-lg transition-all flex items-center justify-center min-w-[80px] h-12 ${
                          tempFilters.brandId === brand.brandID?.toString()
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {brand.imageURL ? (
                          <img src={brand.imageURL} alt={brand.name} className="max-h-7 max-w-[60px] object-contain" />
                        ) : (
                          <span className="text-xs font-medium text-gray-700">{brand.name}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loại sản phẩm */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-semibold text-gray-800">Loại sản phẩm</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setTempFilters(prev => ({ 
                          ...prev, 
                          categoryId: prev.categoryId === cat.id?.toString() ? '' : cat.id?.toString() || '' 
                        }))}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          tempFilters.categoryId === cat.id?.toString()
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mức giá */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                    <span className="text-sm font-semibold text-gray-800">Mức giá</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => handlePriceSelect(range.min, range.max)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          tempFilters.minPrice === range.min && tempFilters.maxPrice === range.max
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Công suất */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
                    <span className="text-sm font-semibold text-gray-800">Công suất</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POWER_RANGES.map((range) => (
                      <button
                        key={range.label}
                        onClick={() => handlePowerSelect(range.min, range.max)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          tempFilters.minPower === range.min && tempFilters.maxPower === range.max
                            ? 'bg-yellow-500 text-white border-yellow-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Số cánh + Tính năng - 2 columns */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Số cánh quạt */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">Số cánh quạt</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {BLADE_COUNTS.map((count) => (
                        <button
                          key={count}
                          onClick={() => setTempFilters(prev => ({ 
                            ...prev, 
                            bladeCount: prev.bladeCount === count.toString() ? '' : count.toString() 
                          }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                            tempFilters.bladeCount === count.toString()
                              ? 'bg-purple-500 text-white border-purple-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          {count} cánh
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tính năng */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-cyan-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">Tính năng</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setTempFilters(prev => ({ ...prev, remoteControl: !prev.remoteControl }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          tempFilters.remoteControl
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        <Wind className="w-3.5 h-3.5" /> Remote
                      </button>
                      <button
                        onClick={() => setTempFilters(prev => ({ ...prev, timer: !prev.timer }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          tempFilters.timer
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" /> Hẹn giờ
                      </button>
                      <button
                        onClick={() => setTempFilters(prev => ({ ...prev, oscillation: !prev.oscillation }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          tempFilters.oscillation
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Đảo chiều
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <button onClick={clearTempFilters} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Xóa bộ lọc
                </button>
                <button onClick={applyFilters} className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                  Xem {totalProducts} kết quả
                </button>
              </div>
            </div>
          )}
          </div>

          {/* Quick Filter Dropdowns */}
          <div className="relative">
            <select
              value={brandId || ''}
              onChange={(e) => updateURL({ brandId: e.target.value || null })}
              className={`appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-medium border cursor-pointer ${
                brandId ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <option value="">Thương hiệu</option>
              {brands.map((b) => (
                <option key={b.brandID} value={b.brandID}>{b.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={minPrice && maxPrice ? `${minPrice}-${maxPrice}` : minPrice ? `${minPrice}-` : ''}
              onChange={(e) => {
                if (!e.target.value) {
                  updateURL({ minPrice: null, maxPrice: null });
                } else {
                  const [min, max] = e.target.value.split('-');
                  updateURL({ minPrice: min || null, maxPrice: max || null });
                }
              }}
              className={`appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-medium border cursor-pointer ${
                minPrice || maxPrice ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <option value="">Mức giá</option>
              {PRICE_RANGES.map((r) => (
                <option key={r.label} value={`${r.min}-${r.max}`}>{r.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={categoryId || ''}
              onChange={(e) => updateURL({ categoryId: e.target.value || null })}
              className={`appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-medium border cursor-pointer ${
                categoryId ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <option value="">Loại sản phẩm</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Quick Feature Buttons */}
          <button
            onClick={() => updateURL({ remoteControl: remoteControl ? null : 'true' })}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
              remoteControl ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <Wind className="w-4 h-4" /> Remote
          </button>

          <button
            onClick={() => updateURL({ timer: timer ? null : 'true' })}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
              timer ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <Clock className="w-4 h-4" /> Hẹn giờ
          </button>
        </div>

        {/* Active Filter Tags */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Đang lọc:</span>
            {brandId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {brands.find(b => b.brandID?.toString() === brandId)?.name}
                <button onClick={() => updateURL({ brandId: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {categoryId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {categories.find(c => c.id?.toString() === categoryId)?.name}
                <button onClick={() => updateURL({ categoryId: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                {PRICE_RANGES.find(r => r.min === minPrice && r.max === maxPrice)?.label || 
                  (minPrice && maxPrice ? `${(+minPrice/1000)}K - ${(+maxPrice/1000)}K` : minPrice ? `Từ ${(+minPrice/1000)}K` : `Đến ${(+maxPrice!/1000)}K`)}
                <button onClick={() => updateURL({ minPrice: null, maxPrice: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {(minPower || maxPower) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                {POWER_RANGES.find(r => r.min === minPower && r.max === maxPower)?.label || `${minPower || 0}W - ${maxPower || '∞'}W`}
                <button onClick={() => updateURL({ minPower: null, maxPower: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {bladeCount && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {bladeCount} cánh
                <button onClick={() => updateURL({ bladeCount: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {remoteControl && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">
                <Wind className="w-3.5 h-3.5" /> Remote
                <button onClick={() => updateURL({ remoteControl: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {timer && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                <Clock className="w-3.5 h-3.5" /> Hẹn giờ
                <button onClick={() => updateURL({ timer: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {oscillation && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                <RotateCcw className="w-3.5 h-3.5" /> Đảo chiều
                <button onClick={() => updateURL({ oscillation: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            <button onClick={clearURLFilters} className="text-red-500 hover:text-red-600 text-sm font-medium ml-2">
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Header + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h1 className="text-xl font-bold text-gray-900">
            Quạt <span className="text-gray-400 font-normal text-base">({totalProducts} sản phẩm)</span>
          </h1>
          
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { label: 'Nên mua', sort: 'recommended', icon: ShoppingBag },
              { label: 'Bán chạy', sort: 'sold', icon: FileText },
              { label: 'Giá thấp', sort: 'price', ord: 'ASC', icon: ArrowUpDown },
              { label: 'Giá cao', sort: 'price', ord: 'DESC', icon: ArrowUpDown },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleSort(item.sort, item.ord || 'DESC')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  sortBy === item.sort && (item.ord ? order === item.ord : true)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id || product.productID} product={product} viewMode="grid" />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <div className="inline-flex items-center gap-1 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-100">‹ Trước</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                    return (
                      <button key={page} onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium ${currentPage === page ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
                        {page}
                      </button>
                    );
                  })}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-100">Sau ›</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button onClick={clearURLFilters} className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600">
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
