'use client';

import { motion } from 'framer-motion';
import { Users, Store, Award } from 'lucide-react';

export function AboutSection() {
  const highlights = [
    { icon: Users, text: 'Hơn 100,000+ khách hàng tin tưởng' },
    { icon: Store, text: '50+ cửa hàng trên toàn quốc' },
    { icon: Award, text: '10+ năm kinh nghiệm trong ngành' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Store className="w-16 h-16" />
                  </div>
                  <h3 className="text-2xl font-bold">OnlyFan Shop</h3>
                  <p className="text-lg">Cửa hàng quạt điện uy tín #1</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Về <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">OnlyFan Shop</span>
            </h2>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              OnlyFan Shop là cửa hàng chuyên cung cấp các sản phẩm quạt điện chất lượng cao từ các thương hiệu uy tín hàng đầu. 
              Với hơn 10 năm kinh nghiệm, chúng tôi tự hào là đối tác tin cậy của hàng trăm nghìn gia đình Việt Nam.
            </p>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Chúng tôi cam kết mang đến những sản phẩm chính hãng, giá cả hợp lý cùng dịch vụ chăm sóc khách hàng tận tâm. 
              Mỗi sản phẩm đều được kiểm tra kỹ lưỡng trước khi đến tay khách hàng.
            </p>

            <div className="space-y-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
