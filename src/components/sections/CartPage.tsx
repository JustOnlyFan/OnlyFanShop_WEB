'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCartIcon, 
  TrashIcon,
  PlusIcon,
  MinusIcon,
  HeartIcon,
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  GiftIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

export function CartPage() {
  const { items, totalPrice, totalItems, isLoading, removeItem, updateQuantity, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [savings, setSavings] = useState(0)

  useEffect(() => {
    if (items.length > 0) {
      const totalOriginalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      const calculatedSavings = Math.max(0, totalOriginalPrice - totalPrice)
      setSavings(calculatedSavings)
    }
  }, [items, totalPrice])

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

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCartIcon className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Đăng nhập để xem giỏ hàng
          </h2>
          <p className="text-gray-600 mb-8">
            Lưu giỏ hàng và đồng bộ trên mọi thiết bị
          </p>
          <Link href="/auth/login">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Đăng nhập ngay
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-8">
            Hãy khám phá những sản phẩm tuyệt vời của chúng tôi
          </p>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <SparklesIcon className="w-5 h-5 mr-2" />
              Khám phá sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Giỏ hàng của bạn
                </h1>
                <p className="text-gray-600">
                  {totalItems} sản phẩm • {formatPrice(totalPrice)}
                </p>
              </div>
            </div>
            
            {items.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.cartItemID}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={item.product.imageURL || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&q=80&auto=format'}
                          alt={item.product.productName}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {item.quantity}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.product.productName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.product.brand?.name || 'Thương hiệu'}
                        </p>
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(item.price)}
                          </span>
                          {item.product.price > item.price && (
                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                              Tiết kiệm {formatPrice(item.product.price - item.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            disabled={isUpdating === item.product.id}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-all duration-200"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            disabled={isUpdating === item.product.id}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-all duration-200"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200">
                            <HeartIcon className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200">
                            <ShareIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Tiết kiệm:</span>
                    <span className="font-medium">{formatPrice(savings)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Thanh toán
                  </Button>
                </Link>
                
                <Link href="/products" className="block">
                  <Button variant="outline" className="w-full">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TruckIcon className="w-4 h-4" />
                    <span>Miễn phí vận chuyển</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Bảo hành 2 năm</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <GiftIcon className="w-4 h-4" />
                    <span>Tích điểm thưởng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
