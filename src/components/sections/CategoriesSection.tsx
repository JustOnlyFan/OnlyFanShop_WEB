'use client'

import { useQuery } from 'react-query'
import { ProductService } from '@/services/productService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { 
  HomeIcon,
  BuildingOfficeIcon,
  TruckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

export function CategoriesSection() {
  const { data: categories, isLoading, error } = useQuery(
    'categories',
    () => ProductService.getCategories(),
    {
      select: (data) => data
    }
  )

  // Fallback categories if API fails
  const fallbackCategories = [
    {
      id: 1,
      name: 'Quạt Đứng',
      icon: HomeIcon,
      description: 'Quạt đứng cao cấp cho gia đình',
      image: '/images/category-standing.jpg'
    },
    {
      id: 2,
      name: 'Quạt Trần',
      icon: BuildingOfficeIcon,
      description: 'Quạt trần cho văn phòng và nhà ở',
      image: '/images/category-ceiling.jpg'
    },
    {
      id: 3,
      name: 'Quạt Hơi Nước',
      icon: TruckIcon,
      description: 'Quạt làm mát bằng hơi nước',
      image: '/images/category-mist.jpg'
    },
    {
      id: 4,
      name: 'Quạt Công Nghiệp',
      icon: WrenchScrewdriverIcon,
      description: 'Quạt công nghiệp công suất lớn',
      image: '/images/category-industrial.jpg'
    }
  ]

  const displayCategories = categories && categories.length > 0 ? categories : fallbackCategories

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-neutral-600">Đang tải danh mục...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Danh mục sản phẩm
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Khám phá đa dạng các loại quạt điện phù hợp với mọi nhu cầu sử dụng
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.map((category, index) => {
            const IconComponent = 'icon' in category ? category.icon as React.ComponentType<any> : null
            
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group relative bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                    {IconComponent && (
                      <IconComponent className="w-16 h-16 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                    )}
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                </div>

                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                    {category.name}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {'description' in category ? (category.description as string) : 'Khám phá sản phẩm'}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-200 rounded-xl transition-colors duration-300" />
              </Link>
            )
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link href="/products">
            <Button size="lg" variant="outline">
              Xem tất cả danh mục
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
