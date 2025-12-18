'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLanguageStore();

  const slides = [
    {
      titleKey: 'heroTitle1',
      subtitleKey: 'heroSubtitle1',
      descKey: 'heroDesc1',
      image: '🌀',
      bgColor: 'bg-primary-600'
    },
    {
      titleKey: 'heroTitle2',
      subtitleKey: 'heroSubtitle2',
      descKey: 'heroDesc2',
      image: '⭐',
      bgColor: 'bg-primary-700'
    },
    {
      titleKey: 'heroTitle3',
      subtitleKey: 'heroSubtitle3',
      descKey: 'heroDesc3',
      image: '🚀',
      bgColor: 'bg-primary-500'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={`relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden ${slides[currentSlide].bgColor} transition-colors duration-700`}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%)',
        }} />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: Math.random() * 8 + 8,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-white mb-8 border border-white/20"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{t('heroWelcome')}</span>
          </motion.div>

          {/* Main Content */}
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.div
              className="text-7xl sm:text-8xl mb-6"
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              {slides[currentSlide].image}
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
              {t(slides[currentSlide].titleKey as any)}
            </h1>

            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-semibold mb-4">
              {t(slides[currentSlide].subtitleKey as any)}
            </p>

            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              {t(slides[currentSlide].descKey as any)}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="group px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  {t('exploreNow')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <Link href="/brands">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-white/15 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/30 hover:bg-white/25 transition-all"
                >
                  {t('viewBrands')}
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/40 w-2 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
          <motion.div
            className="w-1.5 h-1.5 bg-white rounded-full mt-2"
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
