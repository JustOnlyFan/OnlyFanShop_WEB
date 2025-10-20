'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  PlayIcon, 
  StarIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/product/ProductCard'
import { useQuery } from 'react-query'
import { ProductService } from '@/services/productService'

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const { data: featuredProducts } = useQuery(
    'featured-products',
    () => ProductService.getHomepage({ size: 4 }),
    {
      select: (data) => data.data?.products || []
    }
  )

  const heroSlides = [
    {
      title: 'Quạt Điện Cao Cấp',
      subtitle: 'Mang lại cơn gió mát cho cuộc sống',
      description: 'Khám phá bộ sưu tập quạt điện đa dạng từ các thương hiệu uy tín. Từ quạt đứng, quạt trần đến quạt không cánh cao cấp.',
      image: '/images/hero-fan-1.jpg',
      features: ['Tiết kiệm điện', 'Vận hành êm', 'Thiết kế hiện đại']
    },
    {
      title: 'Quạt Hơi Nước',
      subtitle: 'Giải pháp làm mát tối ưu',
      description: 'Công nghệ làm mát bằng hơi nước, mang lại cảm giác mát mẻ tự nhiên cho không gian của bạn.',
      image: '/images/hero-fan-2.jpg',
      features: ['Làm mát nhanh', 'Tăng độ ẩm', 'Lọc không khí']
    },
    {
      title: 'Quạt Không Cánh',
      subtitle: 'Công nghệ tiên tiến, an toàn tuyệt đối',
      description: 'Thiết kế độc đáo không cánh quạt, an toàn cho trẻ em và thú cưng, vẫn đảm bảo hiệu quả làm mát tối ưu.',
      image: '/images/hero-fan-3.jpg',
      features: ['An toàn tuyệt đối', 'Dễ vệ sinh', 'Tiết kiệm không gian']
    }
  ]

  const currentSlideData = heroSlides[currentSlide]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg" />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900"
              >
                {currentSlideData.title}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-primary-600 font-medium"
              >
                {currentSlideData.subtitle}
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg text-neutral-600 max-w-lg"
              >
                {currentSlideData.description}
              </motion.p>
            </div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="space-y-3"
            >
              {currentSlideData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckIcon className="w-5 h-5 text-accent-500" />
                  <span className="text-neutral-700">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Khám phá sản phẩm
                </Button>
              </Link>
              
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <PlayIcon className="w-5 h-5 mr-2" />
                Xem video
              </Button>
            </motion.div>

            {/* Slide Indicators */}
            <div className="flex space-x-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    currentSlide === index 
                      ? 'bg-primary-600' 
                      : 'bg-neutral-300 hover:bg-neutral-400'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Right Content - Featured Products */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Sản phẩm nổi bật
              </h3>
              <p className="text-neutral-600">
                Những sản phẩm được yêu thích nhất
              </p>
            </div>

            {featuredProducts && featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featuredProducts.slice(0, 4).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="h-32 bg-neutral-200 rounded-lg mb-4" />
                    <div className="h-4 bg-neutral-200 rounded mb-2" />
                    <div className="h-4 bg-neutral-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <Link href="/products">
                <Button variant="outline" className="w-full">
                  Xem tất cả sản phẩm
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-primary-100 rounded-full opacity-50 animate-bounce-gentle" />
      <div className="absolute bottom-20 left-20 w-16 h-16 bg-secondary-100 rounded-full opacity-50 animate-bounce-gentle" style={{ animationDelay: '1s' }} />
    </section>
  )
}
