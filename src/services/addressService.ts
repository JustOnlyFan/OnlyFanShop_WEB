import axios from 'axios'
import { VietnamProvince, VietnamWard } from '@/types'

// Using vietnamlabs.com API for Vietnamese addresses (after merger - 34 provinces)
// API provides provinces and wards, but no districts
const VIETNAM_API_URL = 'https://vietnamlabs.com/api/vietnamprovince'

export class AddressService {
  // Get all provinces (34 after merger in 2025)
  static async getProvinces(): Promise<VietnamProvince[]> {
    try {
      // Try vietnamlabs.com API first
      try {
        const response = await axios.get(`${VIETNAM_API_URL}/provinces`, {
          timeout: 5000
        })
        if (response.data && Array.isArray(response.data)) {
          return response.data
        }
      } catch (vietnamlabsError) {
        console.warn('vietnamlabs.com API not available, trying fallback:', vietnamlabsError)
      }
      
      // Fallback to open-api.vn if vietnamlabs.com is not available
      const fallbackResponse = await axios.get('https://provinces.open-api.vn/api/v2/p/')
      return fallbackResponse.data
    } catch (error: any) {
      console.error('Failed to fetch provinces:', error)
      throw new Error('Failed to fetch provinces')
    }
  }

  // Get province with wards (no districts - only provinces and wards after merger)
  static async getProvinceWithWards(provinceCode: number): Promise<VietnamProvince> {
    try {
      // Try vietnamlabs.com API first
      try {
        const response = await axios.get(`${VIETNAM_API_URL}/provinces/${provinceCode}/wards`, {
          timeout: 5000
        })
        if (response.data) {
          // Transform response to match VietnamProvince interface
          const province = await this.getProvinces().then(provinces => 
            provinces.find(p => p.code === provinceCode)
          )
          if (province) {
            return {
              ...province,
              wards: response.data.wards || response.data || []
            }
          }
        }
      } catch (vietnamlabsError) {
        console.warn('vietnamlabs.com API not available, trying fallback:', vietnamlabsError)
      }
      
      // Fallback to open-api.vn if vietnamlabs.com is not available
      const fallbackResponse = await axios.get(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`)
      const data = fallbackResponse.data
      // Remove districts if present, only keep wards
      if (data.districts && Array.isArray(data.districts)) {
        // Flatten districts to get all wards
        const allWards: VietnamWard[] = []
        data.districts.forEach((district: any) => {
          if (district.wards && Array.isArray(district.wards)) {
            district.wards.forEach((ward: any) => {
              allWards.push({
                ...ward,
                provinceCode: provinceCode
              })
            })
          }
        })
        return {
          ...data,
          wards: allWards
        }
      }
      return data
    } catch (error: any) {
      console.error('Failed to fetch province wards:', error)
      throw new Error('Failed to fetch province wards')
    }
  }

  // Format full address from checkout info (after merger - no districts)
  static formatAddress(info: {
    deliveryType: 'pickup' | 'delivery'
    provinceName?: string
    wardName?: string
    storeName?: string
    homeAddress?: string
    note?: string
  }): string {
    if (info.deliveryType === 'pickup') {
      const parts = [
        info.storeName,
        info.wardName,
        info.provinceName
      ].filter(Boolean)
      
      if (info.note) {
        parts.push(`Ghi chú: ${info.note}`)
      }
      
      return parts.join(', ') || 'Nhận tại cửa hàng'
    } else {
      const parts = [
        info.homeAddress,
        info.wardName,
        info.provinceName
      ].filter(Boolean)
      
      if (info.note) {
        parts.push(`Ghi chú: ${info.note}`)
      }
      
      return parts.join(', ') || ''
    }
  }
}







