'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { ProductService } from '@/services/productService'
import { ProductCard } from '@/components/product/ProductCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => ProductService.getHomepage({ keyword: debouncedQuery, size: 6 }),
    enabled: debouncedQuery.length > 2,
    select: (data) => data.data?.products || []
  })

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mt-20">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {query.length === 0 ? (
              <div className="text-center py-8">
                <MagnifyingGlassIcon className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">Nhập từ khóa để tìm kiếm sản phẩm</p>
              </div>
            ) : query.length <= 2 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500">Nhập ít nhất 3 ký tự để tìm kiếm</p>
              </div>
            ) : isLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-neutral-600">Đang tìm kiếm...</p>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-neutral-600">
                    Tìm thấy {searchResults.length} sản phẩm cho "{query}"
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500">Không tìm thấy sản phẩm nào</p>
                <p className="text-sm text-neutral-400 mt-2">
                  Thử với từ khóa khác hoặc kiểm tra chính tả
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}







