'use client'

import { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    location: 'TP.HCM',
    rating: 5,
    content: 'Quạt Panasonic mua tại OnlyFan rất êm và tiết kiệm điện. Giao hàng nhanh, nhân viên tư vấn nhiệt tình. Sẽ ủng hộ shop lâu dài!',
    avatar: '/images/avatars/user1.jpg'
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    location: 'Hà Nội',
    rating: 5,
    content: 'Quạt hơi nước Dyson rất mát, thiết kế đẹp và an toàn cho trẻ em. Giá cả hợp lý hơn so với mua trực tiếp từ cửa hàng.',
    avatar: '/images/avatars/user2.jpg'
  },
  {
    id: 3,
    name: 'Lê Minh Cường',
    location: 'Đà Nẵng',
    rating: 5,
    content: 'Dịch vụ bảo hành rất tốt. Khi quạt có vấn đề, shop hỗ trợ sửa chữa nhanh chóng. Rất hài lòng với chất lượng phục vụ.',
    avatar: '/images/avatars/user3.jpg'
  },
  {
    id: 4,
    name: 'Phạm Thị Dung',
    location: 'Cần Thơ',
    rating: 5,
    content: 'Quạt trần Mitsubishi rất bền, đã sử dụng 2 năm không có vấn đề gì. Tiết kiệm điện và làm mát hiệu quả.',
    avatar: '/images/avatars/user4.jpg'
  },
  {
    id: 5,
    name: 'Hoàng Văn Em',
    location: 'Hải Phòng',
    rating: 5,
    content: 'Chất lượng sản phẩm tốt, giá cả cạnh tranh. Đặc biệt là chính sách đổi trả rất linh hoạt, khách hàng yên tâm mua sắm.',
    avatar: '/images/avatars/user5.jpg'
  }
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Khách hàng nói gì về chúng tôi
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Hàng nghìn khách hàng đã tin tưởng và hài lòng với dịch vụ của OnlyFan
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 md:p-12">
            <div className="text-center">
              {/* Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`w-6 h-6 ${
                      i < currentTestimonial.rating
                        ? 'text-yellow-400'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-lg md:text-xl text-neutral-700 mb-8 leading-relaxed">
                "{currentTestimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {currentTestimonial.name.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-neutral-900">
                    {currentTestimonial.name}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {currentTestimonial.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200"
              >
                <ChevronLeftIcon className="w-5 h-5 text-neutral-600" />
              </button>

              {/* Dots */}
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentIndex
                        ? 'bg-primary-600'
                        : 'bg-neutral-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors duration-200"
              >
                <ChevronRightIcon className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
              10,000+
            </div>
            <div className="text-neutral-600">Khách hàng hài lòng</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
              50,000+
            </div>
            <div className="text-neutral-600">Sản phẩm đã bán</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
              4.9/5
            </div>
            <div className="text-neutral-600">Đánh giá trung bình</div>
          </div>
        </div>
      </div>
    </section>
  )
}
