'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Loader2, MapPin, Navigation } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoreLocationService } from '@/services/storeLocationService'

type AddressState = {
  address: string
  city: string
  district: string
  ward: string
  latitude: number
  longitude: number
}

interface Province {
  code: number
  name: string
}

interface Ward {
  code: number
  name: string
  districtName?: string
}

interface AddressPickerModalProps {
  initial: AddressState
  onClose: () => void
  onApply: (value: AddressState) => void
}

// API Việt Nam
const VIETNAM_API = 'https://provinces.open-api.vn/api'

export default function AddressPickerModal({ initial, onClose, onApply }: AddressPickerModalProps) {
  const [value, setValue] = useState<AddressState>({
    address: '',
    city: '',
    district: '',
    ward: '',
    latitude: 10.8231,
    longitude: 106.6297
  })
  const [provinces, setProvinces] = useState<Province[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null)
  const [loading, setLoading] = useState({ provinces: false, wards: false, geocode: false })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load Leaflet map
  useEffect(() => {
    let destroyed = false
    
    const initMap = async () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject()
          document.body.appendChild(script)
        })
      }

      if (destroyed || !mapRef.current) return

      const L = (window as any).L
      const map = L.map(mapRef.current).setView([10.8231, 106.6297], 12)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map)

      const marker = L.marker([10.8231, 106.6297], { draggable: true }).addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        setValue(prev => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))
      })

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        setValue(prev => ({ ...prev, latitude: lat, longitude: lng }))
      })

      mapInstanceRef.current = map
      markerRef.current = marker
    }

    initMap().catch(() => toast.error('Không thể tải bản đồ'))

    return () => {
      destroyed = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [])

  const loadProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }))
    try {
      const res = await fetch(`${VIETNAM_API}/p/`)
      const data = await res.json()
      setProvinces(data || [])
    } catch (err) {
      toast.error('Không thể tải danh sách tỉnh/thành')
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }))
    }
  }

  const loadWards = async (provinceCode: number) => {
    setLoading(prev => ({ ...prev, wards: true }))
    setWards([])
    try {
      const res = await fetch(`${VIETNAM_API}/p/${provinceCode}?depth=3`)
      const data = await res.json()
      
      const allWards: Ward[] = []
      if (data.districts && Array.isArray(data.districts)) {
        data.districts.forEach((district: any) => {
          if (district.wards && Array.isArray(district.wards)) {
            district.wards.forEach((ward: any) => {
              allWards.push({
                code: ward.code,
                name: ward.name,
                districtName: district.name
              })
            })
          }
        })
      }
      
      allWards.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      setWards(allWards)
    } catch (err) {
      console.error('Failed to load wards:', err)
    } finally {
      setLoading(prev => ({ ...prev, wards: false }))
    }
  }

  useEffect(() => {
    if (selectedProvince) {
      loadWards(selectedProvince)
    }
  }, [selectedProvince])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: `${query}, Vietnam`,
          format: 'json',
          limit: '5',
          countrycodes: 'vn',
          'accept-language': 'vi'
        })
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
        const data = await res.json()
        setSearchResults(data || [])
        setShowSearchResults(true)
      } catch (err) {
        console.error('Search error:', err)
      }
    }, 500)
  }

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setValue(prev => ({ ...prev, latitude: lat, longitude: lng }))
      
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([lat, lng], 17)
        markerRef.current.setLatLng([lat, lng])
      }
    }

    setSearchQuery('')
    setShowSearchResults(false)
    toast.success('Đã chọn vị trí')
  }

  const handleGetCurrentLocation = async () => {
    setLoading(prev => ({ ...prev, geocode: true }))
    try {
      const { latitude, longitude } = await StoreLocationService.getCurrentLocation()
      setValue(prev => ({ ...prev, latitude, longitude }))
      
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([latitude, longitude], 17)
        markerRef.current.setLatLng([latitude, longitude])
      }
      
      toast.success('Đã lấy vị trí hiện tại')
    } catch (err: any) {
      toast.error(err.message || 'Không thể lấy vị trí')
    } finally {
      setLoading(prev => ({ ...prev, geocode: false }))
    }
  }

  const handleProvinceChange = (code: number) => {
    const province = provinces.find(p => p.code === code)
    setSelectedProvince(code)
    setValue(prev => ({ ...prev, city: province?.name || '', ward: '', district: '' }))
  }

  const handleWardChange = (wardName: string) => {
    const ward = wards.find(w => w.name === wardName)
    setValue(prev => ({ 
      ...prev, 
      ward: wardName,
      district: ward?.districtName || ''
    }))
  }

  const geocodeFromAddress = async () => {
    const parts = [value.address, value.ward, value.city].filter(Boolean)
    if (parts.length === 0) {
      toast.error('Vui lòng nhập địa chỉ')
      return
    }

    setLoading(prev => ({ ...prev, geocode: true }))
    try {
      const query = parts.join(', ') + ', Vietnam'
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        countrycodes: 'vn'
      })
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
      const data = await res.json()
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lng = parseFloat(data[0].lon)
        
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          setValue(prev => ({ ...prev, latitude: lat, longitude: lng }))
          
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 17)
            markerRef.current.setLatLng([lat, lng])
          }
          toast.success('Đã tìm thấy vị trí')
        }
      } else {
        toast.error('Không tìm thấy địa chỉ')
      }
    } catch (err) {
      toast.error('Lỗi khi tra cứu địa chỉ')
    } finally {
      setLoading(prev => ({ ...prev, geocode: false }))
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Chọn địa chỉ cửa hàng</h3>
                <p className="text-sm text-white/70">Nhấp vào bản đồ hoặc kéo marker để chọn vị trí</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Search Box */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Tìm kiếm địa chỉ nhanh..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={loading.geocode}
                  className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 flex items-center gap-2 font-medium disabled:opacity-50"
                >
                  {loading.geocode ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                  <span className="hidden sm:inline">Vị trí hiện tại</span>
                </button>
              </div>
              
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSearchResult(result)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-start gap-3 border-b border-gray-100 last:border-0"
                    >
                      <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 line-clamp-2">{result.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Address Dropdowns - Chỉ Tỉnh và Phường/Xã */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Thành phố *</label>
                <select
                  value={selectedProvince || ''}
                  onChange={(e) => handleProvinceChange(Number(e.target.value))}
                  disabled={loading.provinces}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white disabled:bg-gray-50"
                >
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phường/Xã *</label>
                <select
                  value={value.ward}
                  onChange={(e) => handleWardChange(e.target.value)}
                  disabled={!selectedProvince || loading.wards}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white disabled:bg-gray-50"
                >
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.name}>
                      {w.name}{w.districtName ? ` (${w.districtName})` : ''}
                    </option>
                  ))}
                </select>
                {loading.wards && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
                  </p>
                )}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ chi tiết (số nhà, tên đường) *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={value.address}
                  onChange={(e) => setValue(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="VD: 123 Nguyễn Văn Linh"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  onClick={geocodeFromAddress}
                  disabled={loading.geocode}
                  className="px-4 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 flex items-center gap-2 font-medium disabled:opacity-50"
                >
                  {loading.geocode ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  Tìm
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="relative">
              <div ref={mapRef} className="w-full h-[300px] rounded-xl border border-gray-200 overflow-hidden" />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm text-xs text-gray-600">
                📍 Nhấp vào bản đồ hoặc kéo marker để chọn vị trí
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="px-4 py-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 block mb-1">Vĩ độ</span>
                <span className="font-mono text-sm text-gray-900">{value.latitude.toFixed(6)}</span>
              </div>
              <div className="px-4 py-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-500 block mb-1">Kinh độ</span>
                <span className="font-mono text-sm text-gray-900">{value.longitude.toFixed(6)}</span>
              </div>
            </div>

            {/* Preview */}
            {(value.address || value.ward || value.city) && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Địa chỉ đã chọn:</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {[value.address, value.ward, value.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium"
            >
              Hủy
            </button>
            <button
              onClick={() => onApply(value)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg shadow-blue-500/25"
            >
              Áp dụng địa chỉ
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
