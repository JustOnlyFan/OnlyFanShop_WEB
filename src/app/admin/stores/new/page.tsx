'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { StoreLocationService, StoreStatus } from '@/services/storeLocationService'
import { ArrowLeft, Save, Store, MapPin, Phone, Search } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'

// Dynamic import Leaflet map to avoid SSR issues
const MapComponent = dynamic(
  () => import('../../../../components/ui/LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
)

export default function NewStorePage() {
  const router = useRouter()
  const { hasHydrated } = useAuthStore()
  
  const [saving, setSaving] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isSearchingWard, setIsSearchingWard] = useState(false)
  const [wardSuggestions, setWardSuggestions] = useState<string[]>([])
  const [showWardSuggestions, setShowWardSuggestions] = useState(false)
  const wardSuggestionsRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    phoneNumber: '',
    email: '',
    openingHours: '',
    description: '',
    latitude: 10.8231, // Default: Ho Chi Minh City
    longitude: 106.6297,
    status: 'ACTIVE' as StoreStatus
  })

  // Search ward/district suggestions based on city
  const searchWardSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2 || !formData.city) {
      setWardSuggestions([])
      return
    }

    try {
      setIsSearchingWard(true)
      
      let cityQuery = formData.city
      if (cityQuery === 'TP. Hồ Chí Minh') cityQuery = 'Ho Chi Minh City'
      else if (cityQuery === 'Hà Nội') cityQuery = 'Hanoi'
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, ${encodeURIComponent(cityQuery)}, Vietnam&limit=10&addressdetails=1`,
        { headers: { 'User-Agent': 'OnlyFanShop/1.0' } }
      )
      const data = await response.json()
      
      const wards = new Set<string>()
      data.forEach((item: any) => {
        const addr = item.address
        if (addr?.suburb) wards.add(addr.suburb)
        if (addr?.quarter) wards.add(addr.quarter)
        if (addr?.neighbourhood) wards.add(addr.neighbourhood)
        if (addr?.city_district) wards.add(addr.city_district)
      })
      
      const filtered = Array.from(wards).filter(w => 
        w.toLowerCase().includes(query.toLowerCase())
      )
      
      setWardSuggestions(filtered.length > 0 ? filtered : Array.from(wards).slice(0, 5))
      setShowWardSuggestions(true)
    } catch (error) {
      console.error('Ward search error:', error)
      setWardSuggestions([])
    } finally {
      setIsSearchingWard(false)
    }
  }, [formData.city])

  // Debounce ward search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.ward.length >= 2 && formData.city) {
        searchWardSuggestions(formData.ward)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [formData.ward, formData.city, searchWardSuggestions])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wardSuggestionsRef.current && !wardSuggestionsRef.current.contains(event.target as Node)) {
        setShowWardSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Geocode full address and update map
  const geocodeAddress = async () => {
    const { address, ward, city } = formData
    if (!address.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết')
      return
    }

    try {
      setIsSearching(true)
      
      let cityQuery = city
      if (city === 'TP. Hồ Chí Minh') cityQuery = 'Ho Chi Minh City'
      else if (city === 'Hà Nội') cityQuery = 'Hanoi'
      
      // Build full address query
      let searchQuery = address
      if (ward) searchQuery += `, ${ward}`
      if (cityQuery) searchQuery += `, ${cityQuery}`
      searchQuery += ', Vietnam'

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=vn`,
        { headers: { 'User-Agent': 'OnlyFanShop/1.0' } }
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }))
        toast.success('Đã tìm thấy vị trí')
      } else {
        toast.error('Không tìm thấy địa chỉ. Vui lòng click trên bản đồ để chọn vị trí.')
      }
    } catch (error) {
      console.error('Geocode error:', error)
      toast.error('Lỗi tìm kiếm địa chỉ')
    } finally {
      setIsSearching(false)
    }
  }

  // Handle map click to update location
  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error('Vui lòng điền tên và địa chỉ cửa hàng')
      return
    }

    try {
      setSaving(true)
      await StoreLocationService.createStoreLocation(formData)
      toast.success('Đã tạo cửa hàng mới')
      router.push('/admin/stores')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không thể tạo cửa hàng')
    } finally {
      setSaving(false)
    }
  }

  if (!hasHydrated) {
    return <div className="min-h-[60vh] grid place-items-center"><LoadingSpinner /></div>
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/stores" className="text-gray-500 hover:text-indigo-600 transition-colors">
          Cửa hàng
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Thêm mới</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm cửa hàng mới</h1>
          <p className="text-sm text-gray-500">Tạo cửa hàng mới trong hệ thống</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            Thông tin cơ bản
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="FanShop Quận 1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Mô tả về cửa hàng"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Địa chỉ
          </h3>
          <div className="space-y-4">
            {/* City and Ward first */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value, ward: '' }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Chọn tỉnh/thành</option>
                  {StoreLocationService.getVietnameseCities().map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="relative" ref={wardSuggestionsRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.ward}
                    onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                    onFocus={() => wardSuggestions.length > 0 && setShowWardSuggestions(true)}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder={formData.city ? "Nhập phường/xã" : "Chọn tỉnh/thành trước"}
                    disabled={!formData.city}
                  />
                  {isSearchingWard && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
                
                {/* Ward suggestions dropdown */}
                {showWardSuggestions && wardSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {wardSuggestions.map((ward, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, ward }))
                          setShowWardSuggestions(false)
                          setWardSuggestions([])
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <p className="text-sm text-gray-900">{ward}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Address input with search button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Số nhà, tên đường..."
                  required
                />
                <button
                  type="button"
                  onClick={geocodeAddress}
                  disabled={!formData.address || isSearching}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {isSearching ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
                  Tìm vị trí
                </button>
              </div>
            </div>

            {/* Leaflet Map - Always visible */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vị trí trên bản đồ
                <span className="text-gray-400 font-normal ml-2">(Click để chọn vị trí)</span>
              </label>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <MapComponent
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onLocationChange={handleMapClick}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tọa độ: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-purple-600" />
            Liên hệ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0xxx xxx xxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="store@example.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ mở cửa</label>
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="8:00 - 22:00"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/stores"
            className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
          >
            {saving ? <LoadingSpinner /> : <Save className="w-5 h-5" />}
            Tạo cửa hàng
          </button>
        </div>
      </form>
    </div>
  )
}
