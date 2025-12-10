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
      { name: 'Tin tức & Blog', href: '/news' },
      { name: 'Tuyển dụng', href: '/careers' },
      { name: 'Liên hệ', href: '/contact' },
      { name: 'Hệ thống cửa hàng', href: '/stores' },
    ],
    support: [
      { name: 'Trung tâm trợ giúp', href: '/help' },
      { name: 'Hướng dẫn mua hàng', href: '/guide' },
      { name: 'Chính sách bảo hành', href: '/warranty' },
      { name: 'Đổi trả & Hoàn tiền', href: '/returns' },
      { name: 'Câu hỏi thường gặp', href: '/faq' },
    ],
    legal: [
      { name: 'Điều khoản sử dụng', href: '/terms' },
      { name: 'Chính sách bảo mật', href: '/privacy' },
      { name: 'Chính sách cookie', href: '/cookies' },
      { name: 'Chính sách vận chuyển', href: '/shipping' },
      { name: 'Thông báo pháp lý', href: '/legal' },
    ],
    products: [
      { name: 'Quạt đứng', href: '/products?category=quat-dung' },
      { name: 'Quạt trần', href: '/products?category=quat-tran' },
      { name: 'Quạt hơi nước', href: '/products?category=quat-hoi-nuoc' },
      { name: 'Quạt không cánh', href: '/products?category=quat-khong-canh' },
      { name: 'Phụ kiện', href: '/products?category=phu-kien' },
    ],
  }

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="ml-2 text-xl font-bold">OnlyFan</span>
            </div>
            <p className="text-neutral-400 mb-4 text-sm">
              Cửa hàng quạt điện cao cấp với đa dạng sản phẩm từ các thương hiệu uy tín. 
              Mang lại "cơn gió mát" cho cuộc sống của bạn.
            </p>
            <div className="space-y-2">
              <div className="flex items-start text-neutral-400">
                <PhoneIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div>Hotline: +84 123 456 789</div>
                  <div>CSKH: +84 987 654 321</div>
                </div>
              </div>
              <div className="flex items-center text-neutral-400">
                <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm">support@onlyfanshop.com</span>
              </div>
              <div className="flex items-start text-neutral-400">
                <MapPinIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Kết nối với chúng tôi</h4>
              <div className="flex space-x-3">
                <a href="#" className="w-8 h-8 bg-neutral-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs">FB</span>
                </a>
                <a href="#" className="w-8 h-8 bg-neutral-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs">IG</span>
                </a>
                <a href="#" className="w-8 h-8 bg-neutral-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs">YT</span>
                </a>
                <a href="#" className="w-8 h-8 bg-neutral-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-xs">TW</span>
                </a>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Về OnlyFan</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sản phẩm</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Chính sách</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Business Info Section */}
        <div className="border-t border-neutral-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-semibold mb-3">Thông tin doanh nghiệp</h4>
              <div className="text-neutral-400 text-sm space-y-1">
                <p>Công ty TNHH OnlyFan Shop Việt Nam</p>
                <p>Mã số thuế: 0123456789</p>
                <p>Giấy CNĐKDN: 0123456789 do Sở KH & ĐT TP.HCM cấp ngày 01/01/2014</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Giờ làm việc</h4>
              <div className="text-neutral-400 text-sm space-y-1">
                <p>Thứ 2 - Thứ 6: 8:00 - 20:00</p>
                <p>Thứ 7 - Chủ nhật: 8:00 - 18:00</p>
                <p>Hotline hỗ trợ 24/7: +84 123 456 789</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center text-neutral-400 text-sm">
              <span>© {currentYear} OnlyFan Shop. Được phát triển với</span>
              <HeartIcon className="w-4 h-4 mx-1 text-red-500" />
              <span>bởi team OnlyFan</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              <span className="text-neutral-400 text-sm">Phương thức thanh toán:</span>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-neutral-800">VNPAY</span>
                </div>
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">VISA</span>
                </div>
                <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">MC</span>
                </div>
                <div className="w-10 h-6 bg-purple-600 rounded flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">MOMO</span>
                </div>
                <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">ZLP</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Certification */}
          <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
            <p className="text-neutral-500 text-xs">
              OnlyFan Shop cam kết bảo vệ thông tin khách hàng và tuân thủ các quy định về bảo mật dữ liệu
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}








