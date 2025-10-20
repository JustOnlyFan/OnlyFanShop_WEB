'use client'

import { useQuery } from 'react-query'
import { ProductService } from '@/services/productService'
import { ProductCard } from '@/components/product/ProductCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function FeaturedProducts() {
  const { data: homepageData, isLoading, error } = useQuery(
    'featured-products',
    () => ProductService.getHomepage({ size: 8 }),
    {
      select: (data) => data.data
    }
  )

  if (isLoading) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-neutral-600">Đang tải sản phẩm...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Có lỗi xảy ra khi tải sản phẩm</p>
          </div>
        </div>
      </section>
    )
  }

  const products = homepageData?.products || []

  return (
    <section className="py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Sản phẩm nổi bật
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Khám phá những sản phẩm quạt điện được yêu thích nhất với chất lượng cao và thiết kế hiện đại
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500">Chưa có sản phẩm nào</p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link href="/products">
            <Button size="lg" variant="outline">
              Xem tất cả sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
