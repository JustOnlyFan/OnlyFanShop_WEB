import axios from 'axios'

// Respect empty string from next.config rewrites (same-origin proxy in dev)
const API_URL = typeof process.env.NEXT_PUBLIC_API_URL !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL as string)
  : 'http://localhost:8080'

export interface StoreLocation {
  id: number
  name: string
  address: string
  city: string
  district: string
  ward: string
  latitude: number
  longitude: number
  phoneNumber: string
  email?: string
  openingHours: string
  description?: string
  isActive: boolean
  images?: string[]
  services?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateStoreLocationRequest {
  name: string
  address: string
  city: string
  district: string
  ward: string
  latitude: number
  longitude: number
  phoneNumber: string
  email?: string
  openingHours: string
  description?: string
  images?: string[]
  services?: string[]
}

export interface UpdateStoreLocationRequest {
  name?: string
  address?: string
  city?: string
  district?: string
  ward?: string
  latitude?: number
  longitude?: number
  phoneNumber?: string
  email?: string
  openingHours?: string
  description?: string
  isActive?: boolean
  images?: string[]
  services?: string[]
}

export interface StoreLocationResponse {
  stores: StoreLocation[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
}

export interface NearbyStoresRequest {
  latitude: number
  longitude: number
  radius?: number // in kilometers
  limit?: number
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class StoreLocationService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Get store locations (backend may not support pagination; send only provided params)
  static async getStoreLocations(page?: number, size?: number, city?: string): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams()
      if (typeof page === 'number') params.append('page', page.toString())
      if (typeof size === 'number') params.append('size', size.toString())
      if (city) params.append('city', city)

      const query = params.toString()
      const url = query
        ? `${API_URL}/store-locations?${query}`
        : `${API_URL}/store-locations`
      const response = await axios.get(url, { headers: this.getAuthHeaders() })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get store locations')
    }
  }

  // Get store location by ID
  static async getStoreLocationById(storeId: number): Promise<ApiResponse<StoreLocation>> {
    try {
      const response = await axios.get(`${API_URL}/store-locations/${storeId}`,
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get store location')
    }
  }

  // Get nearby stores
  static async getNearbyStores(request: NearbyStoresRequest): Promise<ApiResponse<StoreLocation[]>> {
    try {
      const params = new URLSearchParams()
      params.append('latitude', request.latitude.toString())
      params.append('longitude', request.longitude.toString())
      if (request.radius) params.append('radius', request.radius.toString())
      if (request.limit) params.append('limit', request.limit.toString())

      const response = await axios.get(`${API_URL}/api/store-locations/nearby?${params}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get nearby stores')
    }
  }

  // Create store location (Admin only)
  static async createStoreLocation(storeData: CreateStoreLocationRequest): Promise<ApiResponse<StoreLocation>> {
    try {
      const response = await axios.post(`${API_URL}/store-locations`, storeData, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create store location')
    }
  }

  // Update store location (Admin only)
  static async updateStoreLocation(storeId: number, storeData: UpdateStoreLocationRequest): Promise<ApiResponse<StoreLocation>> {
    try {
      const response = await axios.put(`${API_URL}/store-locations/${storeId}`, storeData, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update store location')
    }
  }

  // Delete store location (Admin only)
  static async deleteStoreLocation(storeId: number): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(`${API_URL}/store-locations/${storeId}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete store location')
    }
  }

  // Search stores
  static async searchStores(query: string, city?: string): Promise<ApiResponse<StoreLocation[]>> {
    try {
      const params = new URLSearchParams()
      params.append('query', query)
      if (city) params.append('city', city)

      const response = await axios.get(`${API_URL}/api/store-locations/search?${params}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search stores')
    }
  }

  // Get store statistics (Admin only)
  static async getStoreStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${API_URL}/api/store-locations/statistics`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get store statistics')
    }
  }

  // Calculate distance between two points
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  // Format distance
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    } else {
      return `${distance.toFixed(1)}km`
    }
  }

  // Get user's current location
  static async getCurrentLocation(): Promise<{ latitude: number, longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  // Get Vietnamese cities for store locations
  static getVietnameseCities() {
    return [
      'Hà Nội',
      'TP. Hồ Chí Minh',
      'Đà Nẵng',
      'Hải Phòng',
      'Cần Thơ',
      'An Giang',
      'Bà Rịa - Vũng Tàu',
      'Bắc Giang',
      'Bắc Kạn',
      'Bạc Liêu',
      'Bắc Ninh',
      'Bến Tre',
      'Bình Định',
      'Bình Dương',
      'Bình Phước',
      'Bình Thuận',
      'Cà Mau',
      'Cao Bằng',
      'Đắk Lắk',
      'Đắk Nông',
      'Điện Biên',
      'Đồng Nai',
      'Đồng Tháp',
      'Gia Lai',
      'Hà Giang',
      'Hà Nam',
      'Hà Tĩnh',
      'Hải Dương',
      'Hậu Giang',
      'Hòa Bình',
      'Hưng Yên',
      'Khánh Hòa',
      'Kiên Giang',
      'Kon Tum',
      'Lai Châu',
      'Lâm Đồng',
      'Lạng Sơn',
      'Lào Cai',
      'Long An',
      'Nam Định',
      'Nghệ An',
      'Ninh Bình',
      'Ninh Thuận',
      'Phú Thọ',
      'Phú Yên',
      'Quảng Bình',
      'Quảng Nam',
      'Quảng Ngãi',
      'Quảng Ninh',
      'Quảng Trị',
      'Sóc Trăng',
      'Sơn La',
      'Tây Ninh',
      'Thái Bình',
      'Thái Nguyên',
      'Thanh Hóa',
      'Thừa Thiên Huế',
      'Tiền Giang',
      'Trà Vinh',
      'Tuyên Quang',
      'Vĩnh Long',
      'Vĩnh Phúc',
      'Yên Bái'
    ]
  }

  // Get common services
  static getCommonServices() {
    return [
      'Bán hàng trực tiếp',
      'Tư vấn sản phẩm',
      'Bảo hành sản phẩm',
      'Đổi trả sản phẩm',
      'Giao hàng tại chỗ',
      'Thanh toán tại cửa hàng',
      'Hỗ trợ kỹ thuật',
      'Lắp đặt sản phẩm',
      'Sửa chữa sản phẩm',
      'Bảo trì sản phẩm'
    ]
  }

  // Validate store location data
  static validateStoreLocationData(storeData: CreateStoreLocationRequest): { isValid: boolean, errors: string[] } {
    const errors: string[] = []

    if (!storeData.name?.trim()) {
      errors.push('Store name is required')
    }

    if (!storeData.address?.trim()) {
      errors.push('Address is required')
    }

    if (!storeData.city?.trim()) {
      errors.push('City is required')
    }

    if (!storeData.district?.trim()) {
      errors.push('District is required')
    }

    if (!storeData.ward?.trim()) {
      errors.push('Ward is required')
    }

    if (!storeData.latitude || storeData.latitude < -90 || storeData.latitude > 90) {
      errors.push('Invalid latitude')
    }

    if (!storeData.longitude || storeData.longitude < -180 || storeData.longitude > 180) {
      errors.push('Invalid longitude')
    }

    if (!storeData.phoneNumber?.trim()) {
      errors.push('Phone number is required')
    }

    if (!storeData.openingHours?.trim()) {
      errors.push('Opening hours are required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Format store address
  static formatStoreAddress(store: StoreLocation): string {
    return `${store.address}, ${store.ward}, ${store.district}, ${store.city}`
  }

  // Get store status color
  static getStoreStatusColor(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  // Get store status label
  static getStoreStatusLabel(isActive: boolean): string {
    return isActive ? 'Hoạt động' : 'Tạm dừng'
  }

  // Generate Google Maps URL
  static generateGoogleMapsUrl(store: StoreLocation): string {
    const address = encodeURIComponent(this.formatStoreAddress(store))
    return `https://www.google.com/maps/search/?api=1&query=${address}`
  }

  // Generate directions URL
  static generateDirectionsUrl(store: StoreLocation, userLat?: number, userLon?: number): string {
    if (userLat && userLon) {
      return `https://www.google.com/maps/dir/${userLat},${userLon}/${store.latitude},${store.longitude}`
    } else {
      return `https://www.google.com/maps/dir//${store.latitude},${store.longitude}`
    }
  }

  // Upload store image (Admin only)
  static async uploadStoreImage(file: File): Promise<ApiResponse<string>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Build headers specifically for multipart: only include Authorization if token exists
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      
      // Optional explicit override via env
      const override = (process.env.NEXT_PUBLIC_UPLOAD_URL as string) || ''

      // Try multiple known endpoints (backend variants)
      const candidates = [
        override && `${API_URL}${override.startsWith('/') ? '' : '/'}${override}`,
        `${API_URL}/api/upload/store-image`,
        `${API_URL}/api/upload/image`,
        `${API_URL}/api/upload/brand-image`,
        `${API_URL}/upload/store-image`,
      ].filter(Boolean) as string[]

      let lastError: any = null
      for (const url of candidates) {
        try {
          const response = await axios.post(url, formData, { headers })
          return response.data
        } catch (err: any) {
          lastError = err
          // Continue to next candidate on 404/403/405
          const status = err?.response?.status
          if (![400, 404, 403, 405].includes(status)) {
            throw err
          }
        }
      }
      throw lastError || new Error('No working upload endpoint found')
    } catch (error: any) {
      console.error('Upload image error:', error)
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Failed to upload image'
      throw new Error(errorMessage)
    }
  }
}