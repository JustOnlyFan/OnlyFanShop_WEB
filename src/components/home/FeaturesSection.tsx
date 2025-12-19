'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, RotateCcw, Phone, Award, Zap } from 'lucide-react';

import { useLanguageStore } from '@/store/languageStore';

export function FeaturesSection() {
  const { t } = useLanguageStore();

  const features = [
    {
      icon: Truck,
      titleKey: 'fastDelivery',
      descKey: 'fastDeliveryDesc',
      color: 'bg-primary-500',
      delay: 0.1
    },
    {
      icon: Shield,
      titleKey: 'warranty',
      descKey: 'warrantyDesc',
      color: 'bg-success-500',
      delay: 0.2
    },
    {
      icon: RotateCcw,
      titleKey: 'easyReturn',
      descKey: 'easyReturnDesc',
      color: 'bg-warning-500',
      delay: 0.3
    },
    {
      icon: Phone,
      titleKey: 'support247',
      descKey: 'support247Desc',
      color: 'bg-danger-500',
      delay: 0.4
    },
    {
      icon: Award,
      titleKey: 'qualityGuarantee',
      descKey: 'qualityGuaranteeDesc',
      color: 'bg-accent-500',
      delay: 0.5
    },
    {
      icon: Zap,
      titleKey: 'energySaving',
      descKey: 'energySavingDesc',
      color: 'bg-info-500',
      delay: 0.6
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
            {t('whyChooseUs')} <span className="text-primary-600">OnlyFan?</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('whyChooseUsDesc')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="relative bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 h-full">
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t(feature.titleKey as any)}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {t(feature.descKey as any)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
