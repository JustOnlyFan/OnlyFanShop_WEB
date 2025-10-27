import Link from 'next/link'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'Về chúng tôi', href: '/about' },
      { name: 'Tin tức', href: '/news' },
      { name: 'Tuyển dụng', href: '/careers' },
      { name: 'Liên hệ', href: '/contact' },
    ],
    support: [
      { name: 'Trung tâm trợ giúp', href: '/help' },
      { name: 'Hướng dẫn mua hàng', href: '/guide' },
      { name: 'Chính sách bảo hành', href: '/warranty' },
      { name: 'Đổi trả hàng', href: '/returns' },
    ],
    legal: [
      { name: 'Điều khoản sử dụng', href: '/terms' },
      { name: 'Chính sách bảo mật', href: '/privacy' },
      { name: 'Chính sách cookie', href: '/cookies' },
      { name: 'Thông báo pháp lý', href: '/legal' },
    ],
  }

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="ml-2 text-xl font-bold">OnlyFan</span>
            </div>
            <p className="text-neutral-400 mb-4">
              Cửa hàng quạt điện cao cấp với đa dạng sản phẩm từ các thương hiệu uy tín. 
              Mang lại "cơn gió mát" cho cuộc sống của bạn.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-neutral-400">
                <PhoneIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">+84 123 456 789</span>
              </div>
              <div className="flex items-center text-neutral-400">
                <EnvelopeIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">info@onlyfanshop.com</span>
              </div>
              <div className="flex items-center text-neutral-400">
                <MapPinIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Pháp lý</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-neutral-400 text-sm mb-4 md:mb-0">
              <span>© {currentYear} OnlyFan Shop. Được phát triển với</span>
              <HeartIcon className="w-4 h-4 mx-1 text-red-500" />
              <span>bởi team OnlyFan</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <span className="text-neutral-400 text-sm">Thanh toán an toàn</span>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-800">VN</span>
                </div>
                <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-white">VISA</span>
                </div>
                <div className="w-8 h-5 bg-green-600 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-white">MOMO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}








