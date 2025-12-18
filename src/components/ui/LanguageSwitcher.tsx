'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { languages, Language } from '@/lib/i18n';

// Flag images mapping
const flagImages: Record<Language, string> = {
  vi: '/flags/vn.svg',
  en: '/flags/us.svg',
  ja: '/flags/jp.svg',
  zh: '/flags/cn.svg',
};

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguageStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
        aria-label="Chọn ngôn ngữ"
      >
        <img
          src={flagImages[currentLanguage.code]}
          alt={currentLanguage.name}
          width={28}
          height={20}
          className="rounded-sm shadow-sm object-cover"
        />
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-2 flex flex-col gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`relative p-2 rounded-lg transition-all duration-200 ${
                    language === lang.code 
                      ? 'bg-primary-50 ring-2 ring-primary-500' 
                      : 'hover:bg-gray-100'
                  }`}
                  title={lang.nativeName}
                >
                  <img
                    src={flagImages[lang.code]}
                    alt={lang.name}
                    width={40}
                    height={28}
                    className="rounded-sm shadow-sm object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
