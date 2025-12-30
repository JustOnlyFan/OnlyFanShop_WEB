import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // Lấy subdomain
  const subdomain = hostname.split('.')[0]
  const backendProxyPrefixes = [
    '/api',
    '/login',
    '/store-locations',
    '/product',
    '/category',
    '/brands',
    '/colors',
    '/warranties',
    '/order',
    '/users',
    '/warehouses',
    '/payment',
    '/cart',
    '/store-inventory',
  ]

  // Nếu là admin subdomain
  if (subdomain === 'admin') {
    // Cho phép các route proxy về backend đi qua (tránh redirect vòng về /admin)
    if (backendProxyPrefixes.some((prefix) => url.pathname.startsWith(prefix))) {
      return NextResponse.next()
    }
    // Redirect /auth/login sang /auth/admin-login cho admin
    if (url.pathname === '/auth/login') {
      url.pathname = '/auth/admin-login'
      return NextResponse.redirect(url)
    }
    // Nếu đang ở trang chủ hoặc route không hợp lệ, redirect về /admin
    if (url.pathname === '/' || 
      (!url.pathname.startsWith('/admin') &&
       !url.pathname.startsWith('/auth') &&
       !url.pathname.startsWith('/_next') &&
       !url.pathname.startsWith('/api'))
    ) {
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  // Nếu là staff subdomain
  if (subdomain === 'staff') {
    // Cho phép các route proxy về backend đi qua (tránh redirect vòng về /staff)
    if (backendProxyPrefixes.some((prefix) => url.pathname.startsWith(prefix))) {
      return NextResponse.next()
    }
    // Redirect /auth/login sang /auth/staff-login cho staff
    if (url.pathname === '/auth/login') {
      url.pathname = '/auth/staff-login'
      return NextResponse.redirect(url)
    }
    // Nếu đang ở trang chủ hoặc route không hợp lệ, redirect về /staff
    if (url.pathname === '/' ||
      (!url.pathname.startsWith('/staff') &&
       !url.pathname.startsWith('/auth') &&
       !url.pathname.startsWith('/_next') &&
       !url.pathname.startsWith('/api'))
    ) {
      url.pathname = '/staff'
      return NextResponse.redirect(url)
    }
  }

  // Nếu là main domain (onlyfan.local hoặc localhost)
  if (subdomain === 'onlyfan' || subdomain === 'localhost' || hostname.startsWith('localhost:')) {
    // Không cho phép truy cập /admin hoặc /staff từ main domain
    if (url.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('http://admin.onlyfan.local:3000' + url.pathname))
    }
    if (url.pathname.startsWith('/staff')) {
      return NextResponse.redirect(new URL('http://staff.onlyfan.local:3000' + url.pathname))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - login (Backend login API - proxied by rewrites)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|login|_next/static|_next/image|favicon.ico).*)',
  ],
}
