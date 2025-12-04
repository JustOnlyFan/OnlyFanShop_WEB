#!/usr/bin/env node

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
}

const c = (color, text) => `${colors[color]}${text}${colors.reset}`
const bold = (color, text) => `${colors.bright}${colors[color]}${text}${colors.reset}`

console.log('\n' + bold('cyan', '═══════════════════════════════════════════════════════════'))
console.log(bold('cyan', '  OnlyFan Shop - Development Server'))
console.log(bold('cyan', '═══════════════════════════════════════════════════════════') + '\n')

console.log(bold('green', '✓ Server is running on port 3000\n'))

console.log(bold('yellow', '📍 Available Domains:\n'))

console.log(bold('white', '  Customer Portal (Main):'))
console.log(c('cyan', '  → http://onlyfan.local:3000'))
console.log(c('gray', '    Dành cho khách hàng - Xem sản phẩm, đặt hàng\n'))

console.log(bold('white', '  Admin Panel:'))
console.log(c('cyan', '  → http://admin.onlyfan.local:3000'))
console.log(c('gray', '    Dành cho quản trị viên - Quản lý toàn bộ hệ thống'))
console.log(c('gray', '    Login: http://admin.onlyfan.local:3000/auth/login\n'))

console.log(bold('white', '  Staff Panel:'))
console.log(c('cyan', '  → http://staff.onlyfan.local:3000'))
console.log(c('gray', '    Dành cho nhân viên - Quản lý cửa hàng'))
console.log(c('gray', '    Login: http://staff.onlyfan.local:3000/auth/staff-login\n'))

console.log(bold('yellow', '⚠️  Lưu ý:'))
console.log(c('gray', '  - Cần cấu hình file hosts trước khi sử dụng'))
console.log(c('gray', '  - Xem hướng dẫn tại: SUBDOMAIN_SETUP.md\n'))

console.log(bold('cyan', '═══════════════════════════════════════════════════════════\n'))
