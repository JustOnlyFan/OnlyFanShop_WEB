const isBrowser = typeof window !== 'undefined'

// Store access token in localStorage to persist across page reloads
const ACCESS_TOKEN_KEY = 'access_token'
const LEGACY_TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'

const purgeLegacyTokenStorage = () => {
  if (!isBrowser) return
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch (e) {
    console.warn('Failed to purge legacy token storage', e)
  }
}

// Purge any tokens that might have been persisted by older versions
if (isBrowser) {
  purgeLegacyTokenStorage()
}

export const tokenStorage = {
  setAccessToken(token: string | null) {
    if (!isBrowser) return
    try {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token)
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
      }
      // Ensure legacy keys stay cleared
      purgeLegacyTokenStorage()
    } catch (e) {
      console.warn('Failed to save access token to localStorage', e)
    }
  },

  getAccessToken(): string | null {
    if (!isBrowser) return null
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY)
    } catch (e) {
      console.warn('Failed to get access token from localStorage', e)
      return null
    }
  },

  clearAll() {
    if (!isBrowser) return
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      purgeLegacyTokenStorage()
    } catch (e) {
      console.warn('Failed to clear token storage', e)
    }
  }
}

