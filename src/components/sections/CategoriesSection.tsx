'use client'

import { useQuery } from '@tanstack/react-query'
import { ProductService } from '@/services/productService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

export function CategoriesSection() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ProductService.getCategories(),
    select: (data) => data
  })

  const displayCategories = categories?.data || []

  if (isLoading) {
    return (
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner size="sm" />
        </div>
      </section>
    )
  }

  if (displayCategories.length === 0) {
    return null
  }

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-sm font-medium text-gray-600 mb-3">
          Chọn quạt theo loại:
        </h2>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {displayCategories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <div className="px-2 py-1.5 bg-white border border-gray-200 rounded text-xs text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-150 cursor-pointer text-center truncate">
                {category.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
