import axios from 'axios'
import { VietnamProvince, VietnamWard } from '@/types'

const VIETNAM_API_URL = 'https://provinces.open-api.vn/api/v2'

export class AddressService {
  // Get all provinces (34 after merger)
  static async getProvinces(): Promise<VietnamProvince[]> {
    try {
      const response = await axios.get(`${VIETNAM_API_URL}/p/`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch provinces:', error)
      throw new Error('Failed to fetch provinces')
    }
  }

  // Get province with wards (no districts in v2)
  static async getProvinceWithWards(provinceCode: number): Promise<VietnamProvince> {
    try {
      const response = await axios.get(`${VIETNAM_API_URL}/p/${provinceCode}?depth=2`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch province wards:', error)
      throw new Error('Failed to fetch province wards')
    }
  }

  // Format full address from checkout info
  static formatAddress(info: {
    deliveryType: 'pickup' | 'delivery'
    provinceName?: string
    districtName?: string
    wardName?: string
    storeName?: string
    homeAddress?: string
    note?: string
  }): string {
    if (info.deliveryType === 'pickup') {
      const parts = [
        info.storeName,
        info.districtName,
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
        info.districtName,
        info.provinceName
      ].filter(Boolean)
      
      if (info.note) {
        parts.push(`Ghi chú: ${info.note}`)
      }
      
      return parts.join(', ') || ''
    }
  }
}







