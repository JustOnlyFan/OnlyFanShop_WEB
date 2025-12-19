'use client';

import Link from 'next/link';
import Image from 'next/image';

import { motion } from 'framer-motion';

import { Brand } from '@/types';
import { useLanguageStore } from '@/store/languageStore';

interface BrandsSectionProps {
  brands: Brand[];
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  const { language } = useLanguageStore();

  const titles = {
    vi: { title: 'Thương hiệu', highlight: 'uy tín', desc: 'Đối tác với các thương hiệu hàng đầu thế giới', updating: 'Đang cập nhật thương hiệu...' },
    en: { title: 'Trusted', highlight: 'Brands', desc: 'Partnering with world-leading brands', updating: 'Updating brands...' },
    ja: { title: '信頼の', highlight: 'ブランド', desc: '世界をリードするブランドとの提携', updating: 'ブランドを更新中...' },
    zh: { title: '值得信赖的', highlight: '品牌', desc: '与世界领先品牌合作', updating: '正在更新品牌...' },
  };

  const t = titles[language];

  return (
    <section className="py-16 lg:py-20 bg-white">
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

        {brands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t.updating}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.brandID}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <Link href={`/brands/${brand.brandID}`}>
                  <div className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex items-center justify-center h-24 lg:h-28 overflow-hidden">
                    <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      {brand.imageURL ? (
                        <Image
                          src={brand.imageURL}
                          alt={brand.name}
                          width={100}
                          height={50}
                          className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <span className="text-base lg:text-lg font-bold text-gray-600 group-hover:text-primary-600 transition-colors">
                          {brand.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
