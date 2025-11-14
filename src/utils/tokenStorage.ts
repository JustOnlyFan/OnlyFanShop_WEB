const isBrowser = typeof window !== 'undefined'

const ACCESS_TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const REFRESH_COOKIE_NAME = 'refreshToken'
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60

const setCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (!isBrowser) return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`
}

const clearCookie = (name: string) => {
  if (!isBrowser) return
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

const getCookie = (name: string): string | null => {
  if (!isBrowser) return null
  const cookies = document.cookie ? document.cookie.split('; ') : []
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.split('=')
    if (cookieName === name) {
      return rest.join('=') || ''
    }
  }
  return null
}

export const tokenStorage = {
  setAccessToken(token: string | null) {
    if (!isBrowser) return
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  },

  setRefreshToken(refreshToken: string | null, persistCookie: boolean = true) {
    if (!isBrowser) return
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
      if (persistCookie) {
        setCookie(REFRESH_COOKIE_NAME, refreshToken, SEVEN_DAYS_IN_SECONDS)
      }
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      clearCookie(REFRESH_COOKIE_NAME)
    }
  },

  getAccessToken(): string | null {
    if (!isBrowser) return null
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    if (!isBrowser) return null
    const stored = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (stored) {
      return stored
    }
    return getCookie(REFRESH_COOKIE_NAME)
  },

  clearAll() {
    if (!isBrowser) return
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    clearCookie(REFRESH_COOKIE_NAME)
  }
}





