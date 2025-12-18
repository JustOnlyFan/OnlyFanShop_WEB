'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Shield, Clock, Award, Truck, HeadphonesIcon } from 'lucide-react';

export function ServiceCommitmentSection() {
  const commitments = [
    {
      icon: CheckCircle2,
      title: 'Sản phẩm chính hãng 100%',
      description: 'Cam kết tất cả sản phẩm đều chính hãng, có tem nhận diện và giấy bảo hành đầy đủ từ nhà sản xuất.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Bảo hành tận tâm',
      description: 'Bảo hành chính hãng 12-24 tháng. Hỗ trợ đổi mới trong 7 ngày đầu nếu có lỗi từ nhà sản xuất.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Truck,
      title: 'Giao hàng toàn quốc',
      description: 'Miễn phí vận chuyển cho đơn hàng từ 500.000đ. Giao hàng nhanh chóng trong 1-3 ngày.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Clock,
      title: 'Đổi trả linh hoạt',
      description: 'Chính sách đổi trả trong vòng 7 ngày. Hoàn tiền 100% nếu sản phẩm không đúng mô tả.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: HeadphonesIcon,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ tư vấn chuyên nghiệp sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi qua hotline và chat online.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Award,
      title: 'Giá tốt nhất',
      description: 'Cam kết giá cạnh tranh nhất thị trường. Hoàn tiền chênh lệch nếu tìm thấy giá rẻ hơn.',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Cam kết <span className="text-primary-600">của chúng tôi</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sự hài lòng của khách hàng là ưu tiên hàng đầu. Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {commitments.map((commitment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${commitment.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <commitment.icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {commitment.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {commitment.description}
                </p>

                {/* Decorative gradient */}
                <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${commitment.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-primary-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Bạn cần tư vấn?</h3>
            <p className="text-lg mb-6 text-white/90">
              Đội ngũ chuyên gia của chúng tôi sẵn sàng tư vấn giúp bạn chọn sản phẩm phù hợp nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="tel:+84123456789"
                className="px-8 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                Gọi ngay: +84 123 456 789
              </a>
              <a
                href="/contact"
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 border-2 border-white/20"
              >
                Liên hệ tư vấn
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
