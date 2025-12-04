'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useState } from 'react';

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Khách hàng thân thiết',
      content: 'Sản phẩm chất lượng tuyệt vời, giao hàng nhanh chóng. Tôi rất hài lòng với dịch vụ của OnlyFan Shop!',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Trần Thị B',
      role: 'Khách hàng mới',
      content: 'Quạt điện hoạt động êm ái, tiết kiệm điện. Giá cả hợp lý, đáng đồng tiền bát gạo!',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Lê Văn C',
      role: 'Khách hàng VIP',
      content: 'Dịch vụ chăm sóc khách hàng tuyệt vời, nhân viên nhiệt tình. Sẽ tiếp tục ủng hộ!',
      rating: 5,
      avatar: '👨‍🎓'
    },
    {
      name: 'Phạm Thị D',
      role: 'Khách hàng',
      content: 'Mua quạt cho cả gia đình, ai cũng hài lòng. Cảm ơn OnlyFan Shop!',
      rating: 5,
      avatar: '👩‍🏫'
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Khách hàng <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">nói gì</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hàng nghìn đánh giá 5 sao từ khách hàng hài lòng
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                {/* Quote icon */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <Quote className="w-6 h-6 text-white" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
