'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { XMarkIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, totalPrice, totalItems, isLoading, removeItem, updateQuantity, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  const getProductId = (product: any): number => product.id || product.productID || 0

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

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeItem(productId)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
    } catch (error: any) {
      toast.error(error.message || 'Xóa sản phẩm thất bại')
    }
  }

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(productId)
      return
    }

    setIsUpdating(productId)
    try {
      await updateQuantity(productId, newQuantity)
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật số lượng thất bại')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCart()
      toast.success('Đã xóa toàn bộ giỏ hàng')
    } catch (error: any) {
      toast.error(error.message || 'Xóa giỏ hàng thất bại')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <ShoppingCartIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">
              Giỏ hàng ({totalItems})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!isAuthenticated ? (
            <div className="p-6 text-center">
              <p className="text-neutral-600 mb-4">Vui lòng đăng nhập để xem giỏ hàng</p>
              <Link href="/login">
                <Button className="w-full">Đăng nhập</Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="p-6 text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-neutral-600">Đang tải giỏ hàng...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingCartIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 mb-4">Giỏ hàng trống</p>
              <Link href="/products">
                <Button variant="outline" className="w-full">Tiếp tục mua sắm</Button>
              </Link>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {items.map((item) => (
                <div key={item.cartItemID} className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.product.imageURL || '/images/placeholder.jpg'}
                      alt={item.product.productName}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-900 truncate">
                      {item.product.productName}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {formatPrice(item.product.price)} × {item.quantity}
                    </p>
                    <p className="font-semibold text-primary-600">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateQuantity(getProductId(item.product), item.quantity - 1)}
                      disabled={isUpdating === getProductId(item.product)}
                      className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(getProductId(item.product), item.quantity + 1)}
                      disabled={isUpdating === getProductId(item.product)}
                      className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(getProductId(item.product))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Clear Cart Button */}
              {items.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="w-full text-center text-sm text-red-500 hover:text-red-700 py-2"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && items.length > 0 && (
          <div className="border-t border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-neutral-900">Tổng cộng:</span>
              <span className="text-xl font-bold text-primary-600">
                {formatPrice(totalPrice)}
              </span>
            </div>
            
            <div className="space-y-3">
              <Link href="/cart" className="block">
                <Button variant="outline" className="w-full">
                  Xem giỏ hàng chi tiết
                </Button>
              </Link>
              <Link href="/checkout" className="block">
                <Button className="w-full">
                  Thanh toán
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}








