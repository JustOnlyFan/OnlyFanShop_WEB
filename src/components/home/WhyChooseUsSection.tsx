'use client';

import { motion } from 'framer-motion';
import { Shield, ThumbsUp, Headphones, TrendingUp } from 'lucide-react';

export function WhyChooseUsSection() {
  const reasons = [
    {
      icon: Shield,
      title: 'Sản phẩm chính hãng',
      description: '100% sản phẩm chính hãng, có tem nhận diện và giấy bảo hành từ nhà sản xuất',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: ThumbsUp,
      title: 'Giá cả cạnh tranh',
      description: 'Cam kết giá tốt nhất thị trường với nhiều chương trình khuyến mãi hấp dẫn',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Headphones,
      title: 'Dịch vụ tận tâm',
      description: 'Đội ngũ tư vấn chuyên nghiệp, nhiệt tình hỗ trợ 24/7 qua nhiều kênh',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Uy tín lâu năm',
      description: 'Hơn 10 năm xây dựng và phát triển, được hàng trăm nghìn khách hàng tin tưởng',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Vì sao khách hàng <span className="text-primary-600">chọn chúng tôi?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            OnlyFan Shop không chỉ bán sản phẩm, chúng tôi mang đến giải pháp làm mát hoàn hảo cho ngôi nhà của bạn
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${reason.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <reason.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>

                <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${reason.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
