'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

import { useLanguageStore } from '@/store/languageStore';

export function TestimonialsSection() {
  const { language } = useLanguageStore();

  const titles = {
    vi: { title: 'Khách hàng', highlight: 'nói gì', desc: 'Hàng nghìn đánh giá 5 sao từ khách hàng hài lòng' },
    en: { title: 'What customers', highlight: 'say', desc: 'Thousands of 5-star reviews from satisfied customers' },
    ja: { title: 'お客様の', highlight: '声', desc: '満足したお客様からの数千件の5つ星レビュー' },
    zh: { title: '客户', highlight: '评价', desc: '来自满意客户的数千条五星评价' },
  };

  const t = titles[language];

  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: { vi: 'Khách hàng thân thiết', en: 'Loyal Customer', ja: '常連客', zh: '忠实客户' },
      content: {
        vi: 'Sản phẩm chất lượng tuyệt vời, giao hàng nhanh chóng. Tôi rất hài lòng với dịch vụ của OnlyFan Shop!',
        en: 'Excellent product quality, fast delivery. I am very satisfied with OnlyFan Shop service!',
        ja: '素晴らしい品質、迅速な配送。OnlyFan Shopのサービスにとても満足しています！',
        zh: '产品质量优秀，配送快速。我对OnlyFan Shop的服务非常满意！'
      },
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Trần Thị B',
      role: { vi: 'Khách hàng mới', en: 'New Customer', ja: '新規顧客', zh: '新客户' },
      content: {
        vi: 'Quạt điện hoạt động êm ái, tiết kiệm điện. Giá cả hợp lý, đáng đồng tiền bát gạo!',
        en: 'The fan runs quietly and saves energy. Reasonable price, worth every penny!',
        ja: '静かに動作し、省エネ。価格も手頃で、お値打ちです！',
        zh: '风扇运行安静，节能。价格合理，物超所值！'
      },
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Lê Văn C',
      role: { vi: 'Khách hàng VIP', en: 'VIP Customer', ja: 'VIP顧客', zh: 'VIP客户' },
      content: {
        vi: 'Dịch vụ chăm sóc khách hàng tuyệt vời, nhân viên nhiệt tình. Sẽ tiếp tục ủng hộ!',
        en: 'Excellent customer service, enthusiastic staff. Will continue to support!',
        ja: '素晴らしいカスタマーサービス、熱心なスタッフ。これからも応援します！',
        zh: '客户服务出色，员工热情。会继续支持！'
      },
      rating: 5,
      avatar: '👨‍🎓'
    },
    {
      name: 'Phạm Thị D',
      role: { vi: 'Khách hàng', en: 'Customer', ja: '顧客', zh: '客户' },
      content: {
        vi: 'Mua quạt cho cả gia đình, ai cũng hài lòng. Cảm ơn OnlyFan Shop!',
        en: 'Bought fans for the whole family, everyone is satisfied. Thank you OnlyFan Shop!',
        ja: '家族全員分の扇風機を購入、みんな満足。OnlyFan Shopありがとう！',
        zh: '为全家买了风扇，大家都很满意。感谢OnlyFan Shop！'
      },
      rating: 5,
      avatar: '👩‍🏫'
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {t.title} <span className="text-primary-600">{t.highlight}</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.desc}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
                {/* Quote icon */}
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                  <Quote className="w-5 h-5 text-white" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4 pt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-warning-400 fill-warning-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-600 mb-5 leading-relaxed text-sm">
                  "{testimonial.content[language]}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-gray-500">{testimonial.role[language]}</p>
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
