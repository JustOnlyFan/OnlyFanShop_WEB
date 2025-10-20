'use client'

import { useQuery } from 'react-query'
import { ProductService } from '@/services/productService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import Image from 'next/image'

export function BrandsSection() {
  const { data: brands, isLoading, error } = useQuery(
    'brands',
    () => ProductService.getBrands(),
    {
      select: (data) => data
    }
  )

  // Fallback brands if API fails
  const fallbackBrands = [
    {
      brandID: 1,
      name: 'Panasonic',
      logo: '/images/brands/panasonic.png',
      description: 'Thương hiệu Nhật Bản uy tín'
    },
    {
      brandID: 2,
      name: 'Mitsubishi',
      logo: '/images/brands/mitsubishi.png',
      description: 'Công nghệ tiên tiến'
    },
    {
      brandID: 3,
      name: 'Daikin',
      logo: '/images/brands/daikin.png',
      description: 'Chất lượng cao cấp'
    },
    {
      brandID: 4,
      name: 'LG',
      logo: '/images/brands/lg.png',
      description: 'Thiết kế hiện đại'
    },
    {
      brandID: 5,
      name: 'Samsung',
      logo: '/images/brands/samsung.png',
      description: 'Công nghệ thông minh'
    },
    {
      brandID: 6,
      name: 'Dyson',
      logo: '/images/brands/dyson.png',
      description: 'Sáng tạo đột phá'
    }
  ]

  const displayBrands = brands && brands.length > 0 ? brands : fallbackBrands

  if (isLoading) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-neutral-600">Đang tải thương hiệu...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Thương hiệu uy tín
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Hợp tác với các thương hiệu hàng đầu thế giới để mang đến sản phẩm chất lượng tốt nhất
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {displayBrands.map((brand) => (
            <Link
              key={brand.brandID}
              href={`/products?brand=${brand.brandID}`}
              className="group relative bg-white rounded-xl shadow-sm border border-neutral-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-square relative mb-4">
                <Image
                  src='/images/brands/placeholder.png'
                  alt={brand.name}
                  fill
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors duration-200">
                  {brand.name}
                </h3>
                <p className="text-xs text-neutral-600">
                  Thương hiệu uy tín
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              Tại sao chọn chúng tôi?
            </h3>
            <p className="text-neutral-600">
              Cam kết chất lượng và dịch vụ tốt nhất
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-600 font-bold text-lg">✓</span>
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Chính hãng 100%</h4>
              <p className="text-sm text-neutral-600">Sản phẩm chính hãng với đầy đủ bảo hành</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-accent-600 font-bold text-lg">🚚</span>
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Giao hàng nhanh</h4>
              <p className="text-sm text-neutral-600">Giao hàng trong 24h tại TP.HCM</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-secondary-600 font-bold text-lg">🔧</span>
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Bảo hành dài hạn</h4>
              <p className="text-sm text-neutral-600">Bảo hành từ 12-24 tháng</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-neutral-600 font-bold text-lg">💬</span>
              </div>
              <h4 className="font-semibold text-neutral-900 mb-1">Hỗ trợ 24/7</h4>
              <p className="text-sm text-neutral-600">Tư vấn và hỗ trợ mọi lúc</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
