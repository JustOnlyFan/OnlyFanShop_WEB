import { apiClient } from '@/lib/api'

export type StoreStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED'

export interface StoreLocation {
  id: number
  name: string
  address: string
  city?: string
  district?: string
  ward?: string
  latitude: number
  longitude: number
  phoneNumber?: string
  phone?: string
  email?: string
  openingHours: string
  description?: string
  status: StoreStatus
  isActive?: boolean
  images?: string[]
  services?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateStoreLocationRequest {
  name: string
  address: string
  city?: string
  district?: string
  ward?: string
  latitude: number
  longitude: number
  phoneNumber: string
  email?: string
  openingHours: string
  description?: string
  images?: string[]
  services?: string[]
  // Optional: create branch warehouse under this regional parent
  parentRegionalWarehouseId?: number
  status?: StoreStatus
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
  status?: StoreStatus
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
  // Get store locations (backend may not support pagination; send only provided params)
  static async getStoreLocations(page?: number, size?: number, city?: string): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams()
      if (typeof page === 'number') params.append('page', page.toString())
      if (typeof size === 'number') params.append('size', size.toString())
      if (city) params.append('city', city)

      const query = params.toString()
      const url = query ? `/store-locations?${query}` : `/store-locations`
      const response = await apiClient.get(url)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get store locations')
    }
  }

  // Get store location by ID
  static async getStoreLocationById(storeId: number): Promise<ApiResponse<StoreLocation>> {
    try {
      const response = await apiClient.get(`/store-locations/${storeId}`)
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

      const response = await apiClient.get(`/api/store-locations/nearby?${params}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get nearby stores')
    }
  }

  // Create store location (Admin only)
  static async createStoreLocation(storeData: CreateStoreLocationRequest): Promise<ApiResponse<StoreLocation>> {
    try {
      const response = await apiClient.post(`/store-locations`, storeData)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create store location')
    }
  }

  // Update store location (Admin only)
  static async updateStoreLocation(storeId: number, storeData: UpdateStoreLocationRequest): Promise<ApiResponse<StoreLocation>> {
    try {
      const response = await apiClient.put(`/store-locations/${storeId}`, storeData)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update store location')
    }
  }

  // Delete store location (Admin only)
  static async deleteStoreLocation(storeId: number): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/store-locations/${storeId}`)
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

      const response = await apiClient.get(`/api/store-locations/search?${params}`)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search stores')
    }
  }

  // Get stores that have a specific product in stock
  static async getStoresWithProduct(productId: number, city?: string, district?: string): Promise<ApiResponse<StoreLocation[]>> {
    try {
      const params = new URLSearchParams()
      if (city) params.append('city', city)
      if (district) params.append('district', district)

      const queryString = params.toString()
      const url = queryString 
        ? `/store-locations/product/${productId}?${queryString}`
        : `/store-locations/product/${productId}`
      const response = await apiClient.get(url)
      return response.data
    } catch (error: any) {
      // If endpoint doesn't exist, return empty array
      if (error.response?.status === 404) {
        return { statusCode: 200, message: 'Success', data: [] }
      }
      throw new Error(error.response?.data?.message || 'Failed to get stores with product')
    }
  }

  // Get store statistics (Admin only)
  static async getStoreStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(`/api/store-locations/statistics`)
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

    // City/ward are optional depending on reverse-geocode; address must exist

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
    const parts = [store.address, store.ward, store.city].filter(Boolean)
    return parts.join(', ')
  }

  // Get store status color
  static getStoreStatusColor(status?: StoreStatus | string | null, fallback?: boolean): string {
    const normalized = this.normalizeStoreStatus(status, fallback)
    switch (normalized) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Get store status label
  static getStoreStatusLabel(status?: StoreStatus | string | null, fallback?: boolean): string {
    const normalized = this.normalizeStoreStatus(status, fallback)
    switch (normalized) {
      case 'ACTIVE':
        return 'Hoạt động'
      case 'PAUSED':
        return 'Tạm dừng'
      case 'CLOSED':
        return 'Đã đóng cửa'
      default:
        return 'Không xác định'
    }
  }

  static normalizeStoreStatus(status?: StoreStatus | string | null, fallback?: boolean): StoreStatus {
    if (typeof status === 'string') {
      const upper = status.toUpperCase()
      if (upper === 'ACTIVE' || upper === 'PAUSED' || upper === 'CLOSED') {
        return upper as StoreStatus
      }
    }
    if (fallback !== undefined) {
      return fallback ? 'ACTIVE' : 'PAUSED'
    }
    return 'ACTIVE'
  }

  static resolveStoreStatus(store: Partial<StoreLocation>): StoreStatus {
    return this.normalizeStoreStatus(store.status, store.isActive)
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

      // Try multiple known endpoints (backend variants)
      const candidates = [
        `/api/upload/store-image`,
        `/api/upload/image`,
        `/api/upload/brand-image`,
      ]

      let lastError: any = null
      for (const url of candidates) {
        try {
          const response = await apiClient.post(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
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