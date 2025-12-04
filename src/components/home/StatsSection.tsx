'use client';

import { motion } from 'framer-motion';
import { Users, Package, Award, ThumbsUp } from 'lucide-react';

export function StatsSection() {
  const stats = [
    { icon: Users, value: '10,000+', label: 'Khách hàng', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Package, value: '500+', label: 'Sản phẩm', gradient: 'from-green-500 to-emerald-500' },
    { icon: Award, value: '50+', label: 'Thương hiệu', gradient: 'from-purple-500 to-pink-500' },
    { icon: ThumbsUp, value: '99%', label: 'Hài lòng', gradient: 'from-orange-500 to-red-500' },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Con số <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">ấn tượng</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Niềm tin từ hàng nghìn khách hàng trên toàn quốc
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="relative inline-block mb-6"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-2xl`}>
                  <stat.icon className="w-10 h-10 text-white" />
                </div>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} blur-xl opacity-50`} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              >
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-lg text-gray-300">
                  {stat.label}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
