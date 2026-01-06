'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Product, Category, Brand, CategoryDTO, CategoryType, TagDTO } from '@/types';
import { ProductService } from '@/services/productService';
import CategoryService from '@/services/categoryService';
import TagService from '@/services/tagService';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Filter, ChevronDown, ShoppingBag, FileText, ArrowUpDown, Search, X, Wind, Clock, RotateCcw, Tag } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';

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
  tagCodes: string[];
  spaceId: string;
  purposeId: string;
  technologyId: string;
}

const PRICE_RANGES = [
  { labelKey: 'under500k', min: '0', max: '500000' },
  { labelKey: 'range500kTo1m', min: '500000', max: '1000000' },
  { labelKey: 'range1mTo2m', min: '1000000', max: '2000000' },
  { labelKey: 'range2mTo5m', min: '2000000', max: '5000000' },
  { labelKey: 'above5m', min: '5000000', max: '' },
];

const POWER_RANGES = [
  { labelKey: 'under50w', min: '0', max: '50' },
  { labelKey: 'range50wTo70w', min: '50', max: '70' },
  { labelKey: 'range70wTo100w', min: '70', max: '100' },
  { labelKey: 'above100w', min: '100', max: '' },
];

const BLADE_COUNTS = [3, 4, 5, 6, 7];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<TagDTO[]>([]);
  const [spaceCategories, setSpaceCategories] = useState<CategoryDTO[]>([]);
  const [purposeCategories, setPurposeCategories] = useState<CategoryDTO[]>([]);
  const [technologyCategories, setTechnologyCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguageStore();
  const queryClient = useQueryClient();
  
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
  const tagCodesParam = searchParams.get('tags');
  const spaceId = searchParams.get('spaceId');
  const purposeId = searchParams.get('purposeId');
  const technologyId = searchParams.get('technologyId');
  const sortBy = searchParams.get('sortBy') || 'ProductID';
  const order = searchParams.get('order') || 'DESC';
  
  const [tempFilters, setTempFilters] = useState<FilterState>({
    brandId: '', minPrice: '', maxPrice: '', categoryId: '', bladeCount: '',
    remoteControl: false, oscillation: false, timer: false, minPower: '', maxPower: '',
    tagCodes: [], spaceId: '', purposeId: '', technologyId: ''
  });

  // OPTIMIZATION: Load products first (most critical), extract categories/brands from response
  // OPTIMIZATION: Lazy load filter data only when filter popup opens
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ProductService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: showFilterPopup, // Only load when filter popup is open
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => ProductService.getBrands(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: showFilterPopup, // Only load when filter popup is open
  });

  // Fetch tags - lazy load
  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: () => TagService.getAllTags(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: showFilterPopup, // Only load when filter popup is open
  });

  // Fetch category types for filters - lazy load
  const { data: spaceCategoriesData } = useQuery({
    queryKey: ['categories', 'SPACE'],
    queryFn: () => CategoryService.getCategoriesByType(CategoryType.SPACE),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: showFilterPopup, // Only load when filter popup is open
  });

  const { data: purposeCategoriesData } = useQuery({
    queryKey: ['categories', 'PURPOSE'],
    queryFn: () => CategoryService.getCategoriesByType(CategoryType.PURPOSE),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: showFilterPopup, // Only load when filter popup is open
  });

  const { data: technologyCategoriesData } = useQuery({
    queryKey: ['categories', 'TECHNOLOGY'],
    queryFn: () => CategoryService.getCategoriesByType(CategoryType.TECHNOLOGY),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: showFilterPopup, // Only load when filter popup is open
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
    page: currentPage, size: 15, sortBy, order
  }), [keyword, categoryId, brandId, minPrice, maxPrice, bladeCount, remoteControl, oscillation, timer, minPower, maxPower, currentPage, sortBy, order]);

  // OPTIMIZATION: Products query with better caching and placeholder data
  const { data: productsData, isLoading: isLoadingProducts, isFetching: isFetchingProducts } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => ProductService.getHomepage(queryParams),
    staleTime: 2 * 60 * 1000, // 2 minutes (matches backend cache)
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (prev) => prev, // Show previous data while fetching
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
  });

  // OPTIMIZATION: Extract categories and brands from productsData first (backend returns them)
  useEffect(() => {
    if (productsData?.data) {
      setProducts(productsData.data.products || []);
      setTotalPages(productsData.data.pagination?.totalPages || 1);
      setTotalProducts(productsData.data.pagination?.totalElements || 0);
      
      // Extract categories and brands from productsData if available (faster than separate API calls)
      if (productsData.data.categories && productsData.data.categories.length > 0) {
        const mappedCategories = productsData.data.categories.map((c: any) => ({
          id: c.id ?? c.categoryID,
          name: c.name ?? c.categoryName
        }));
        setCategories(mappedCategories);
      }
      
      if (productsData.data.brands && productsData.data.brands.length > 0) {
        const mappedBrands = productsData.data.brands.map((b: any) => ({
          brandID: b.brandID ?? b.id,
          name: b.name ?? b.brandName,
          imageURL: b.imageURL
        }));
        setBrands(mappedBrands);
      }
    }
    setLoading(isLoadingProducts && !productsData); // Only show loading if no data at all
  }, [productsData, isLoadingProducts]);

  // Fallback: Load categories/brands from separate API if not in productsData
  useEffect(() => { 
    if (categoriesData?.data && categories.length === 0) {
      setCategories(categoriesData.data);
    }
  }, [categoriesData, categories.length]);
  
  useEffect(() => { 
    if (brandsData?.data && brands.length === 0) {
      setBrands(brandsData.data);
    }
  }, [brandsData, brands.length]);
  
  useEffect(() => { if (tagsData) setTags(tagsData); }, [tagsData]);
  useEffect(() => { if (spaceCategoriesData) setSpaceCategories(spaceCategoriesData); }, [spaceCategoriesData]);
  useEffect(() => { if (purposeCategoriesData) setPurposeCategories(purposeCategoriesData); }, [purposeCategoriesData]);
  useEffect(() => { if (technologyCategoriesData) setTechnologyCategories(technologyCategoriesData); }, [technologyCategoriesData]);

  // Sync URL to temp filters when popup opens
  useEffect(() => {
    if (showFilterPopup) {
      setTempFilters({
        brandId: brandId || '', minPrice: minPrice || '', maxPrice: maxPrice || '',
        categoryId: categoryId || '', bladeCount: bladeCount || '',
        remoteControl, oscillation, timer, minPower: minPower || '', maxPower: maxPower || '',
        tagCodes: tagCodesParam ? tagCodesParam.split(',') : [],
        spaceId: spaceId || '', purposeId: purposeId || '', technologyId: technologyId || ''
      });
    }
  }, [showFilterPopup, brandId, minPrice, maxPrice, categoryId, bladeCount, remoteControl, oscillation, timer, minPower, maxPower, tagCodesParam, spaceId, purposeId, technologyId]);

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
      tags: tempFilters.tagCodes.length > 0 ? tempFilters.tagCodes.join(',') : null,
      spaceId: tempFilters.spaceId || null,
      purposeId: tempFilters.purposeId || null,
      technologyId: tempFilters.technologyId || null,
    });
    setShowFilterPopup(false);
    setCurrentPage(1);
  };

  const clearTempFilters = () => {
    setTempFilters({
      brandId: '', minPrice: '', maxPrice: '', categoryId: '', bladeCount: '',
      remoteControl: false, oscillation: false, timer: false, minPower: '', maxPower: '',
      tagCodes: [], spaceId: '', purposeId: '', technologyId: ''
    });
  };

  const clearURLFilters = () => { router.push('/products'); setCurrentPage(1); };
  const handleSort = (newSortBy: string, newOrder: string) => updateURL({ sortBy: newSortBy, order: newOrder });
  const handlePageChange = (page: number) => { 
    setCurrentPage(page); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };
  
  // OPTIMIZATION: Prefetch next page data when user is near bottom
  useEffect(() => {
    if (currentPage < totalPages && !isFetchingProducts) {
      const nextPageParams = { ...queryParams, page: currentPage + 1 };
      queryClient.prefetchQuery({
        queryKey: ['products', nextPageParams],
        queryFn: () => ProductService.getHomepage(nextPageParams),
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [currentPage, totalPages, isFetchingProducts, queryParams, queryClient]);

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
    if (tagCodesParam) count++;
    if (spaceId) count++;
    if (purposeId) count++;
    if (technologyId) count++;
    return count;
  };

  const handleTagToggle = (tagCode: string) => {
    setTempFilters(prev => ({
      ...prev,
      tagCodes: prev.tagCodes.includes(tagCode)
        ? prev.tagCodes.filter(c => c !== tagCode)
        : [...prev.tagCodes, tagCode]
    }));
  };

  const getTagBadgeColor = (tag: TagDTO) => {
    const colorMap: Record<string, string> = {
      'NEW': 'bg-blue-500',
      'BESTSELLER': 'bg-red-500',
      'SALE': 'bg-orange-500',
      'PREMIUM': 'bg-purple-500',
      'IMPORTED': 'bg-green-500',
      'AUTHENTIC': 'bg-yellow-500',
    };
    return tag.badgeColor || colorMap[tag.code] || 'bg-gray-500';
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

  // OPTIMIZATION: Show skeleton loading instead of full page spinner
  const showSkeleton = isLoadingProducts && !productsData;


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
              <span>{t('filter')}</span>
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
                <h3 className="text-base font-semibold text-gray-900">{t('productFilter')}</h3>
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
                    <span className="text-sm font-semibold text-gray-800">{t('brand')}</span>
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
                    <span className="text-sm font-semibold text-gray-800">{t('productType')}</span>
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

                {/* Công suất */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1 h-4 bg-yellow-500 rounded-full"></span>
                    <span className="text-sm font-semibold text-gray-800">{t('power')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POWER_RANGES.map((range) => (
                      <button
                        key={range.labelKey}
                        onClick={() => handlePowerSelect(range.min, range.max)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          tempFilters.minPower === range.min && tempFilters.maxPower === range.max
                            ? 'bg-yellow-500 text-white border-yellow-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400'
                        }`}
                      >
                        {t(range.labelKey as any)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Không gian sử dụng (Space) */}
                {spaceCategories.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">{t('categorySpace')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {spaceCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setTempFilters(prev => ({ 
                            ...prev, 
                            spaceId: prev.spaceId === cat.id?.toString() ? '' : cat.id?.toString() || '' 
                          }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                            tempFilters.spaceId === cat.id?.toString()
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mục đích sử dụng (Purpose) */}
                {purposeCategories.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">{t('categoryPurpose')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {purposeCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setTempFilters(prev => ({ 
                            ...prev, 
                            purposeId: prev.purposeId === cat.id?.toString() ? '' : cat.id?.toString() || '' 
                          }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                            tempFilters.purposeId === cat.id?.toString()
                              ? 'bg-indigo-500 text-white border-indigo-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Công nghệ (Technology) */}
                {technologyCategories.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-pink-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">{t('categoryTechnology')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {technologyCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setTempFilters(prev => ({ 
                            ...prev, 
                            technologyId: prev.technologyId === cat.id?.toString() ? '' : cat.id?.toString() || '' 
                          }))}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                            tempFilters.technologyId === cat.id?.toString()
                              ? 'bg-pink-500 text-white border-pink-500'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-pink-400'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-rose-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleTagToggle(tag.code)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                            tempFilters.tagCodes.includes(tag.code)
                              ? `${getTagBadgeColor(tag)} text-white border-transparent`
                              : 'bg-white text-gray-700 border-gray-300 hover:border-rose-400'
                          }`}
                        >
                          <Tag className="w-3.5 h-3.5" /> {tag.displayName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Số cánh + Tính năng - 2 columns */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Số cánh quạt */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">{t('bladeCount')}</span>
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
                          {count} {t('blades')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tính năng */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-4 bg-cyan-500 rounded-full"></span>
                      <span className="text-sm font-semibold text-gray-800">{t('features')}</span>
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
                        <Wind className="w-3.5 h-3.5" /> {t('remote')}
                      </button>
                      <button
                        onClick={() => setTempFilters(prev => ({ ...prev, timer: !prev.timer }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          tempFilters.timer
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" /> {t('timer')}
                      </button>
                      <button
                        onClick={() => setTempFilters(prev => ({ ...prev, oscillation: !prev.oscillation }))}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                          tempFilters.oscillation
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> {t('oscillation')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <button onClick={clearTempFilters} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                  {t('clearFilter')}
                </button>
                <button onClick={applyFilters} className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                  {t('viewResults')} ({totalProducts})
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
              <option value="">{t('brand')}</option>
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
              <option value="">{t('priceRange')}</option>
              {PRICE_RANGES.map((r) => (
                <option key={r.labelKey} value={`${r.min}-${r.max}`}>{t(r.labelKey as any)}</option>
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
              <option value="">{t('productType')}</option>
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
            <Wind className="w-4 h-4" /> {t('remote')}
          </button>

          <button
            onClick={() => updateURL({ timer: timer ? null : 'true' })}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
              timer ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
            }`}
          >
            <Clock className="w-4 h-4" /> {t('timer')}
          </button>
        </div>

        {/* Active Filter Tags */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">{t('filtering')}:</span>
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
                {(() => {
                  const found = PRICE_RANGES.find(r => r.min === minPrice && r.max === maxPrice);
                  return found ? t(found.labelKey as any) : (minPrice && maxPrice ? `${(+minPrice/1000)}K - ${(+maxPrice/1000)}K` : minPrice ? `${(+minPrice/1000)}K+` : `< ${(+maxPrice!/1000)}K`);
                })()}
                <button onClick={() => updateURL({ minPrice: null, maxPrice: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {(minPower || maxPower) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                {(() => {
                  const found = POWER_RANGES.find(r => r.min === minPower && r.max === maxPower);
                  return found ? t(found.labelKey as any) : `${minPower || 0}W - ${maxPower || '∞'}W`;
                })()}
                <button onClick={() => updateURL({ minPower: null, maxPower: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {bladeCount && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {bladeCount} {t('blades')}
                <button onClick={() => updateURL({ bladeCount: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {remoteControl && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">
                <Wind className="w-3.5 h-3.5" /> {t('remote')}
                <button onClick={() => updateURL({ remoteControl: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {timer && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                <Clock className="w-3.5 h-3.5" /> {t('timer')}
                <button onClick={() => updateURL({ timer: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {oscillation && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                <RotateCcw className="w-3.5 h-3.5" /> {t('oscillation')}
                <button onClick={() => updateURL({ oscillation: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {spaceId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                {spaceCategories.find(c => c.id?.toString() === spaceId)?.name}
                <button onClick={() => updateURL({ spaceId: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {purposeId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {purposeCategories.find(c => c.id?.toString() === purposeId)?.name}
                <button onClick={() => updateURL({ purposeId: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {technologyId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                {technologyCategories.find(c => c.id?.toString() === technologyId)?.name}
                <button onClick={() => updateURL({ technologyId: null })}><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {tagCodesParam && tagCodesParam.split(',').map(tagCode => {
              const tag = tags.find(t => t.code === tagCode);
              return tag ? (
                <span key={tagCode} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                  <Tag className="w-3.5 h-3.5" /> {tag.displayName}
                  <button onClick={() => {
                    const newTags = tagCodesParam.split(',').filter(c => c !== tagCode);
                    updateURL({ tags: newTags.length > 0 ? newTags.join(',') : null });
                  }}><X className="w-3.5 h-3.5" /></button>
                </span>
              ) : null;
            })}
            <button onClick={clearURLFilters} className="text-red-500 hover:text-red-600 text-sm font-medium ml-2">
              {t('clearAll')}
            </button>
          </div>
        )}

        {/* Header + Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h1 className="text-xl font-bold text-gray-900">
            {t('fan')} <span className="text-gray-400 font-normal text-base">({totalProducts} {t('productCount')})</span>
          </h1>
          
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { labelKey: 'recommended', sort: 'recommended', icon: ShoppingBag },
              { labelKey: 'bestSeller', sort: 'sold', icon: FileText },
              { labelKey: 'priceLow', sort: 'price', ord: 'ASC', icon: ArrowUpDown },
              { labelKey: 'priceHigh', sort: 'price', ord: 'DESC', icon: ArrowUpDown },
            ].map((item) => (
              <button
                key={item.labelKey}
                onClick={() => handleSort(item.sort, item.ord || 'DESC')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  sortBy === item.sort && (item.ord ? order === item.ord : true)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {t(item.labelKey as any)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {showSkeleton ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                <div className="w-full aspect-square bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard 
                  key={`product-${product.id || product.productID}`} 
                  product={product} 
                  viewMode="grid" 
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <div className="inline-flex items-center gap-1 bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-100">‹ {t('prev')}</button>
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
                    className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-100">{t('next')} ›</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noProductsFound')}</h3>
            <p className="text-gray-500 mb-6">{t('tryChangeFilter')}</p>
            <button onClick={clearURLFilters} className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600">
              {t('clearFilter')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
