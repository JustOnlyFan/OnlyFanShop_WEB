'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Mail, Send, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

import { useLanguageStore } from '@/store/languageStore';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { language } = useLanguageStore();

  const texts = {
    vi: { title: 'Nhận ưu đãi đặc biệt', desc: 'Đăng ký nhận tin để được thông báo về sản phẩm mới và các chương trình khuyến mãi hấp dẫn', placeholder: 'Nhập email của bạn', button: 'Đăng ký', processing: 'Đang xử lý...', privacy: 'Chúng tôi tôn trọng quyền riêng tư của bạn. Không spam!', success: 'Đăng ký thành công! Kiểm tra email để nhận ưu đãi.', error: 'Vui lòng nhập email' },
    en: { title: 'Get special offers', desc: 'Subscribe to receive notifications about new products and attractive promotions', placeholder: 'Enter your email', button: 'Subscribe', processing: 'Processing...', privacy: 'We respect your privacy. No spam!', success: 'Subscribed successfully! Check your email for offers.', error: 'Please enter email' },
    ja: { title: '特別オファーを受け取る', desc: '新製品や魅力的なプロモーションの通知を受け取るために登録してください', placeholder: 'メールアドレスを入力', button: '登録', processing: '処理中...', privacy: 'プライバシーを尊重します。スパムなし！', success: '登録成功！オファーをメールで確認してください。', error: 'メールを入力してください' },
    zh: { title: '获取特别优惠', desc: '订阅以接收新产品和优惠活动的通知', placeholder: '输入您的邮箱', button: '订阅', processing: '处理中...', privacy: '我们尊重您的隐私。不发送垃圾邮件！', success: '订阅成功！请查看邮箱获取优惠。', error: '请输入邮箱' },
  };

  const t = texts[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error(t.error); return; }
    setLoading(true);
    setTimeout(() => { toast.success(t.success); setEmail(''); setLoading(false); }, 1000);
  };

  return (
    <section className="py-16 lg:py-20 bg-primary-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Gift className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">{t.title}</h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">{t.desc}</p>
          <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.placeholder} className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-white/60 transition-all" />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="px-6 py-3.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50">
                {loading ? <span>{t.processing}</span> : <><span>{t.button}</span><Send className="w-4 h-4" /></>}
              </motion.button>
            </div>
          </motion.form>
          <p className="text-sm text-white/70 mt-4">{t.privacy}</p>
        </motion.div>
      </div>
    </section>
  );
}
