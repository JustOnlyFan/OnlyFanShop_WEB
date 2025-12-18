'use client'

import Link from 'next/link'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { useLanguageStore } from '@/store/languageStore'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useLanguageStore()

  const quickLinks = [
    { name: t('home'), href: '/' },
    { name: t('products'), href: '/products' },
    { name: t('brands'), href: '/brands' },
    { name: t('contact'), href: '/contact' },
  ]

  const supportLinks = [
    { name: t('helpCenter'), href: '/help' },
    { name: t('buyingGuide'), href: '/guide' },
    { name: t('warrantyPolicy'), href: '/warranty' },
    { name: t('returnPolicy'), href: '/returns' },
    { name: t('faq'), href: '/faq' },
  ]

  const policyLinks = [
    { name: t('termsOfUse'), href: '/terms' },
    { name: t('privacyPolicy'), href: '/privacy' },
    { name: t('shippingPolicy'), href: '/shipping' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="ml-2 text-xl font-bold">OnlyFan</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              {t('aboutUsDesc')}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-400">
                <PhoneIcon className="w-4 h-4 mr-2 text-primary-400" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center text-gray-400">
                <EnvelopeIcon className="w-4 h-4 mr-2 text-primary-400" />
                <span>support@onlyfanshop.com</span>
              </div>
              <div className="flex items-start text-gray-400">
                <MapPinIcon className="w-4 h-4 mr-2 mt-0.5 text-primary-400 flex-shrink-0" />
                <span>123 ABC Street, District 1, HCMC</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">{t('connectWithUs')}</p>
              <div className="flex space-x-2">
                <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">FB</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-pink-500 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">IG</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">YT</span>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">TW</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-base font-semibold mb-4">{t('customerSupport')}</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy Links */}
          <div>
            <h3 className="text-base font-semibold mb-4">{t('policies')}</h3>
            <ul className="space-y-2">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">{t('paymentMethods')}</p>
              <div className="flex flex-wrap gap-2">
                <div className="px-2 py-1 bg-white rounded text-xs font-bold text-gray-800">VNPAY</div>
                <div className="px-2 py-1 bg-blue-600 rounded text-xs font-bold">VISA</div>
                <div className="px-2 py-1 bg-red-600 rounded text-xs font-bold">MC</div>
                <div className="px-2 py-1 bg-pink-500 rounded text-xs font-bold">MOMO</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center text-gray-400 text-sm">
              <span>© {currentYear} OnlyFan Shop. {t('developedWith')}</span>
              <HeartIcon className="w-4 h-4 mx-1 text-red-500" />
              <span>{t('byTeam')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
