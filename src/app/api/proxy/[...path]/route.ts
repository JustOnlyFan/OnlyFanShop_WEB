import { NextRequest, NextResponse } from 'next/server'

// In development, use localhost:8080 for direct backend access in server-side routes
// In production, backend should be accessible via relative URL or reverse proxy
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URL in production (backend should be same domain or reverse proxy)
  : 'http://localhost:8080' // Direct access in development

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const url = BACKEND_URL 
      ? new URL(`/api/${path}`, BACKEND_URL)
      : new URL(`/api/${path}`, request.url)
    
    // Copy query parameters
    const searchParams = request.nextUrl.searchParams
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Backend request failed', status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const url = BACKEND_URL 
      ? new URL(`/api/${path}`, BACKEND_URL)
      : new URL(`/api/${path}`, request.url)
    
    const body = await request.json()

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Backend request failed', status: response.status },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
