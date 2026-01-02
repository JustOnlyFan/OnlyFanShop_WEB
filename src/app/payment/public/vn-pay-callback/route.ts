import { NextRequest } from 'next/server'

// In development, use localhost:8080 for direct backend access in server-side routes
// In production, backend should be accessible via relative URL or reverse proxy
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URL in production (backend should be same domain or reverse proxy)
  : 'http://localhost:8080' // Direct access in development

export async function GET(request: NextRequest) {
  try {
    // Forward all query parameters to backend
    const searchParams = request.nextUrl.searchParams
    const backendUrl = BACKEND_URL 
      ? new URL('/payment/public/vn-pay-callback', BACKEND_URL)
      : new URL('/payment/public/vn-pay-callback', request.url)
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value)
    })

    console.log('Proxying VNPay callback to backend:', backendUrl.toString())

    // Forward the request to backend with manual redirect handling
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      redirect: 'manual', // Don't follow redirects automatically
    })

    console.log('Backend response status:', response.status)
    
    // If backend returns a redirect (302, 301, etc)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      console.log('Backend redirect location:', location)
      
      if (location) {
        // Check if redirect is to our frontend (payment result page) or external URL we can't reach
        try {
          const locationUrl = new URL(location)
          
          // If redirect is to payment-result, use relative path
          if (locationUrl.pathname === '/payment-result' || locationUrl.pathname.includes('/payment-result')) {
            const redirectPath = locationUrl.pathname + locationUrl.search
            console.log('Redirecting to frontend:', redirectPath)
            return Response.redirect(redirectPath, 302)
          }
          
          // If redirect is to external URL (like onlyfanshop.app), this is for mobile app
          // We can't reach it, so just show success/failure based on the response
          console.log('External redirect detected, cannot follow')
          return new Response('Redirect external', { status: 302, headers: { Location: location } })
        } catch (e) {
          // Relative URL redirect
          console.log('Relative redirect:', location)
          return Response.redirect(location, 302)
        }
      }
    }

    // For other responses, return as-is
    const data = await response.text()
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'text/html',
      },
    })
  } catch (error) {
    console.error('VNPay callback proxy error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

