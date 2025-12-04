'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, RotateCcw, Phone, Award, Zap } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: 'Giao hàng nhanh',
      description: 'Miễn phí vận chuyển cho đơn hàng trên 500.000đ',
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: Shield,
      title: 'Bảo hành chính hãng',
      description: 'Cam kết bảo hành từ nhà sản xuất',
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.2
    },
    {
      icon: RotateCcw,
      title: 'Đổi trả dễ dàng',
      description: 'Đổi trả trong vòng 7 ngày',
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.3
    },
    {
      icon: Phone,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ CSKH luôn sẵn sàng',
      gradient: 'from-orange-500 to-red-500',
      delay: 0.4
    },
    {
      icon: Award,
      title: 'Chất lượng đảm bảo',
      description: 'Sản phẩm chính hãng 100%',
      gradient: 'from-yellow-500 to-orange-500',
      delay: 0.5
    },
    {
      icon: Zap,
      title: 'Tiết kiệm điện',
      description: 'Công nghệ tiết kiệm năng lượng',
      gradient: 'from-indigo-500 to-purple-500',
      delay: 0.6
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
            Tại sao chọn <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">OnlyFan?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Decorative element */}
                <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
