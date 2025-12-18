'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Product, CategoryDTO, CategoryType, Brand } from '@/types';
import { ProductService } from '@/services/productService';
import CategoryService from '@/services/categoryService';
import AccessoryCompatibilityService from '@/services/accessoryCompatibilityService';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Filter, ChevronDown, X, Wrench, Settings } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';

interface FilterState {
  categoryId: string;
  compatibleFanTypeId: string;
  brandId: string;
  minPrice: string;
  maxPrice: string;
}

const PRICE_RANGES = [
  { labelKey: 'under500k', min: '0', max: '500000' },
  { labelKey: 'range500kTo1m', min: '500000', max: '1000000' },
  { labelKey: 'range1mTo2m', min: '1000000', max: '2000000' },
  { labelKey: 'range2mTo5m', min: '2000000', max: '5000000' },
  { labelKey: 'above5m', min: '5000000', max: '' },
];

export default function AccessoryProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [accessoryCategories, setAccessoryCategories] = useState<CategoryDTO[]>([]);
  const [fanTypeCategories, setFanTypeCategories] = useState<CategoryDTO[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguageStore();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const compatibleFanTypeId = searchParams.get('compatibleFanTypeId');
  const brandId = searchParams.get('brandId');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const [tempFilters, setTempFilters] = useState<FilterState>({
    categoryId: '', compatibleFanTypeId: '', brandId: '', minPrice: '', maxPrice: ''
  });

  // Fetch accessory categories
  const { data: accessoryCategoriesData } = useQuery({
    queryKey: ['categories', 'ACCESSORY_TYPE'],
    queryFn: () => CategoryService.getCategoryTree(CategoryType.ACCESSORY_TYPE),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch fan type categories for compatibility filter
  const { data: fanTypeCategoriesData } = useQuery({
    queryKey: ['categories', 'FAN_TYPE'],
    queryFn: () => CategoryService.getCategoryTree(CategoryType.FAN_TYPE),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch brands
  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => ProductService.getBrands(),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch accessory products - either by compatible fan type or all accessories
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['accessory-products', compatibleFanTypeId, categoryId, brandId],
    queryFn: async () => {
      if (compatibleFanTypeId) {
        // Filter by compatible fan type (Requirements 8.4)
        return AccessoryCompatibilityService.getAccessoriesByFanType(parseInt(compatibleFanTypeId));
      }
      // Get all accessory products
      const response = await ProductService.getHomepage({
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        brandId: brandId ? parseInt(brandId) : undefined,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        page: 1,
        size: 100,
      });
      return response.data?.products || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => { if (accessoryCategoriesData) setAccessoryCategories(accessoryCategoriesData); }, [accessoryCategoriesData]);
  useEffect(() => { if (fanTypeCategoriesData) setFanTypeCategories(fanTypeCategoriesData); }, [fanTypeCategoriesData]);
  useEffect(() => { if (brandsData?.data) setBrands(brandsData.data); }, [brandsData]);
  useEffect(() => {
    if (productsData) {
      setProducts(Array.isArray(productsData) ? productsData : []);
    }
    setLoading(isLoadingProducts);
  }, [productsData, isLoadingProducts]);

  // Sync URL to temp filters when popup opens
  useEffect(() => {
    if (showFilterPopup) {
      setTempFilters({
        categoryId: categoryId || '',
        compatibleFanTypeId: compatibleFanTypeId || '',
        brandId: brandId || '',
        minPrice: minPrice || '',
        maxPrice: maxPrice || ''
      });
    }
  }, [showFilterPopup, categoryId, compatibleFanTypeId, brandId, minPrice, maxPrice]);

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
    router.push(`/products/accessories?${newParams.toString()}`);
  };

  const applyFilters = () => {
    updateURL({
      categoryId: tempFilters.categoryId || null,
      compatibleFanTypeId: tempFilters.compatibleFanTypeId || null,
      brandId: tempFilters.brandId || null,
      minPrice: tempFilters.minPrice || null,
      maxPrice: tempFilters.maxPrice || null,
    });
    setShowFilterPopup(false);
  };

  const clearTempFilters = () => {
    setTempFilters({
      categoryId: '', compatibleFanTypeId: '', brandId: '', minPrice: '', maxPrice: ''
    });
  };

  const clearURLFilters = () => { router.push('/products/accessories'); };

  const getActiveFilterCount = () => {
    let count = 0;
    if (categoryId) count++;
    if (compatibleFanTypeId) count++;
    if (brandId) count++;
    if (minPrice || maxPrice) count++;
    return count;
  };

  const handlePriceSelect = (min: string, max: string) => {
    if (tempFilters.minPrice === min && tempFilters.maxPrice === max) {
      setTempFilters(prev => ({ ...prev, minPrice: '', maxPrice: '' }));
    } else {
      setTempFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
    }
  };

  if (loading || isLoadingProducts) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-10 sm:px-16 lg:px-24 xl:px-32 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Wrench className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('accessoryProducts')}</h1>
          </div>
          <p className="text-gray-600">{t('filterByCompatibility')}</p>
        </div>

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
              <span>{t('filter')}</span>
              {getActiveFilterCount() > 0 && (
                <span className="bg-white text-blue-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilterPopup ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Popup */}
            {showFilterPopup && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-[calc(75vw-2rem)] max-w-[700px]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">{t('productFilter')}</h3>
                  <button onClick={() => setShowFilterPopup(false)} className="p-1.5 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 max-h-[400px] overflow-y-auto overscroll-contain space-y-5">
                  {/* Compatible Fan Type Filter (Requirements 8.4) */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">{t('compatibleFanTypes')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {fanTypeCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setTempFilters(prev => ({ 
                            ...prev, 
                            compatibleFanTypeId: prev.compatibleFanTypeId === cat.id?.toString() ? '' : cat.id?.toString() || '' 
                          }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                            tempFilters.compatibleFanTypeId === cat.id?.toString()
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accessory Type Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">{t('categoryAccessoryType')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {accessoryCategories.map((cat) => (
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

                  {/* Brand Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">{t('compatibleBrands')}</span>
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

                  {/* Price Range */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">{t('priceRange')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PRICE_RANGES.map((range) => (
                        <button
                          key={range.labelKey}
                          onClick={() => handlePriceSelect(range.min, range.max)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                            tempFilters.minPrice === range.min && tempFilters.maxPrice === range.max
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                          }`}
                        >
                          {t(range.labelKey as any)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                  <button onClick={clearTempFilters} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                    {t('clearFilter')}
                  </button>
                  <button onClick={applyFilters} className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                    {t('viewResults')} ({products.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Filter: Compatible Fan Type */}
          <div className="relative">
            <select
              value={compatibleFanTypeId || ''}
              onChange={(e) => updateURL({ compatibleFanTypeId: e.target.value || null })}
              className={`appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-medium border cursor-pointer ${
                compatibleFanTypeId ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <option value="">{t('compatibleFanTypes')}</option>
              {fanTypeCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Quick Filter: Accessory Type */}
          <div className="relative">
            <select
              value={categoryId || ''}
              onChange={(e) => updateURL({ categoryId: e.target.value || null })}
              className={`appearance-none px-4 py-2 pr-8 rounded-lg text-sm font-medium border cursor-pointer ${
                categoryId ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }`}
            >
              <option value="">{t('categoryAccessoryType')}</option>
              {accessoryCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>


        {/* Active Filter Tags */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">{t('filtering')}:</span>
            {compatibleFanTypeId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {t('compatibleWith')}: {fanTypeCategories.find(c => c.id?.toString() === compatibleFanTypeId)?.name}
                <button onClick={() => updateURL({ compatibleFanTypeId: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {categoryId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {accessoryCategories.find(c => c.id?.toString() === categoryId)?.name}
                <button onClick={() => updateURL({ categoryId: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {brandId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {brands.find(b => b.brandID?.toString() === brandId)?.name}
                <button onClick={() => updateURL({ brandId: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                {(() => {
                  const found = PRICE_RANGES.find(r => r.min === minPrice && r.max === maxPrice);
                  return found ? t(found.labelKey as any) : (minPrice && maxPrice ? `${(+minPrice/1000)}K - ${(+maxPrice/1000)}K` : minPrice ? `${(+minPrice/1000)}K+` : `< ${(+maxPrice!/1000)}K`);
                })()}
                <button onClick={() => updateURL({ minPrice: null, maxPrice: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            <button onClick={clearURLFilters} className="text-red-500 hover:text-red-600 text-sm font-medium ml-2">
              {t('clearAll')}
            </button>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id || product.productID} product={product} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noProductsFound')}</h3>
            <p className="text-gray-500">{t('tryChangeFilter')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
