'use client';

import { motion } from 'framer-motion';
import { Brand } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface BrandsSectionProps {
  brands: Brand[];
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Thương hiệu <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">uy tín</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Đối tác với các thương hiệu hàng đầu thế giới
          </p>
        </motion.div>

        {brands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Đang cập nhật thương hiệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.brandID}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              >
                <Link href={`/brands/${brand.brandID}`}>
                  <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex items-center justify-center h-32 overflow-hidden">
                    {/* Gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      {brand.imageURL ? (
                        <Image
                          src={brand.imageURL}
                          alt={brand.name}
                          width={120}
                          height={60}
                          className="object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      ) : (
                        <span className="text-xl font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
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
