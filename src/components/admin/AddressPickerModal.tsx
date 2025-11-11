'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Crosshair, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { StoreLocationService } from '@/services/storeLocationService'
import { AddressService } from '@/services/addressService'
import type { VietnamProvince, VietnamWard } from '@/types'

type AddressState = {
  address: string
  city: string
  district: string // Deprecated - kept for backward compatibility
  ward: string
  latitude: number
  longitude: number
}

interface AddressPickerModalProps {
  initial: AddressState
  onClose: () => void
  onApply: (value: AddressState) => void
}

export default function AddressPickerModal({ initial, onClose, onApply }: AddressPickerModalProps) {
  const [value, setValue] = useState<AddressState>(initial)
  const [provinces, setProvinces] = useState<VietnamProvince[]>([])
  const [wards, setWards] = useState<VietnamWard[]>([])
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

  // Load Leaflet from CDN (no dependency installation needed)
  useEffect(() => {
    // Load provinces list
    AddressService.getProvinces()
      .then((p) => setProvinces(p))
      .catch(() => {})

    const ensureLeaflet = async () => {
      if ((window as any).L) return (window as any).L
      await new Promise<void>((resolve, reject) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        link.onload = () => resolve()
        link.onerror = () => resolve()
        document.head.appendChild(link)
      })
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
        script.crossOrigin = ''
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Leaflet'))
        document.body.appendChild(script)
      })
      return (window as any).L
    }

    let destroyed = false
    ensureLeaflet()
      .then((L) => {
        if (destroyed || !mapRef.current) return
        leafletRef.current = L
        const map = L.map(mapRef.current).setView([value.latitude || 10.776, value.longitude || 106.700], 13)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map)
        const marker = L.marker([value.latitude || 10.776, value.longitude || 106.700], { draggable: true }).addTo(map)
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          setValue((prev) => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))
          // Reverse geocode to get accurate address
          reverseGeocode(pos.lat, pos.lng, { recenter: false })
        })
        
        // Click on map to move marker and get address
        map.on('click', (e: any) => {
          const lat = e.latlng.lat
          const lng = e.latlng.lng
          marker.setLatLng([lat, lng])
          setValue((prev) => ({ ...prev, latitude: lat, longitude: lng }))
          reverseGeocode(lat, lng, { recenter: false })
        })
        
        markerRef.current = marker
        mapInstanceRef.current = map
        ;(map as any)._leaflet_id // keep ref

        // If we came in with coordinates but missing address, fetch it once
        if ((!initial.address || !initial.city) && (initial.latitude && initial.longitude)) {
          reverseGeocode(initial.latitude, initial.longitude, { recenter: true })
        }
      })
      .catch(() => toast.error('Không thể tải bản đồ'))

    return () => {
      destroyed = true
      try {
        const L = (window as any).L
        if (L && mapRef.current && (mapRef.current as any)._leaflet_id) {
          const map = (mapRef.current as any)
          // Leaflet cleans up when element is removed
        }
      } catch {}
    }
  }, [])

  const reverseGeocode = async (lat: number, lon: number, opts?: { recenter?: boolean }) => {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        addressdetails: '1',
        'accept-language': 'vi'
      })
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
        headers: { 'Accept-Language': 'vi' }
      })
      const result = await resp.json()
      if (result && result.address) {
        const addr = result.address
        // Prefer explicit fields. Vietnam has provinces (state/city), no districts (post-merger).
        const road = addr.road || addr.street || addr.pedestrian || ''
        const house = addr.house_number ? `${addr.house_number} ` : ''
        const ward = addr.quarter || addr.neighbourhood || addr.village || addr.suburb || ''
        const city = addr.state || addr.city || addr.town || addr.county || ''

        setValue((prev) => ({
          ...prev,
          address: (house + road).trim() || prev.address,
          city: city || prev.city,
          district: '', // deprecated
          ward: ward || prev.ward,
          latitude: lat,
          longitude: lon
        }))
        // Recenter and zoom closer if requested
        if (opts?.recenter && mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lon], 17)
          markerRef.current.setLatLng([lat, lon])
        }
        toast.success('Đã cập nhật địa chỉ từ vị trí')
      }
    } catch (err) {
      console.error('Reverse geocode error:', err)
    }
  }

  const geocode = async () => {
    if (!value.address?.trim() && !value.city?.trim()) {
      toast.error('Vui lòng nhập địa chỉ hoặc chọn tỉnh/thành phố')
      return
    }
    
    // Build query with proper format for Vietnam addresses (no district after merger)
    const parts: string[] = []
    if (value.address?.trim()) parts.push(value.address.trim())
    if (value.ward?.trim()) parts.push(value.ward.trim())
    if (value.city?.trim()) parts.push(value.city.trim())
    parts.push('Vietnam')
    
    const query = parts.join(', ')
    
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '5',
        addressdetails: '1',
        countrycodes: 'vn',
        'accept-language': 'vi'
      })
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { 'Accept-Language': 'vi' }
      })
      const results = await resp.json()
      if (Array.isArray(results) && results.length > 0) {
        // Use first result (most relevant)
        const first = results[0]
        const lat = parseFloat(first.lat)
        const lon = parseFloat(first.lon)
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          // Update coordinates
          setValue((prev) => ({ ...prev, latitude: lat, longitude: lon }))
          
          // Update address from result if available
          if (first.address) {
            const addr = first.address
            setValue((prev) => ({
              ...prev,
              address: addr.house_number 
                ? `${addr.house_number} ${addr.road || addr.street || ''}`.trim()
                : (addr.road || addr.street || prev.address),
              city: addr.state || addr.city || prev.city,
              district: addr.suburb || addr.city_district || prev.district,
              ward: addr.quarter || addr.neighbourhood || prev.ward,
              latitude: lat,
              longitude: lon
            }))
          }
          
          const map = mapInstanceRef.current
          if (map && markerRef.current) {
            map.setView([lat, lon], 18) // Zoom closer for accuracy
            markerRef.current.setLatLng([lat, lon])
          }
          toast.success(`Đã tìm thấy: ${first.display_name || 'Địa chỉ'}`)
        } else {
          toast.error('Không tìm thấy toạ độ phù hợp')
        }
      } else {
        toast.error('Không tìm thấy địa chỉ phù hợp. Vui lòng kiểm tra lại thông tin.')
      }
    } catch (err) {
      console.error('Geocode error:', err)
      toast.error('Lỗi khi tra cứu địa chỉ')
    }
  }

  // When province name changes, fetch wards from API v2
  useEffect(() => {
    const selected = provinces.find((p) => p.name === value.city || p.fullName === value.city)
    if (!selected) {
      setWards([])
      return
    }
    AddressService.getProvinceWithWards(selected.code)
      .then((prov) => setWards(prov.wards || []))
      .catch(() => setWards([]))
  }, [value.city, provinces])

  const useCurrent = async () => {
    try {
      const { latitude, longitude } = await StoreLocationService.getCurrentLocation()
      setValue((prev) => ({ ...prev, latitude, longitude }))
      const map = mapInstanceRef.current
      if (map && markerRef.current) {
        map.setView([latitude, longitude], 15)
        markerRef.current.setLatLng([latitude, longitude])
      }
      toast.success('Đã lấy vị trí hiện tại')
    } catch (err: any) {
      toast.error(err.message || 'Không thể lấy vị trí')
    }
  }

  const apply = () => {
    onApply(value)
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lấy địa chỉ và vị trí</h3>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <select
                className="px-3 py-2 border rounded-lg bg-white"
                value={value.city}
                onChange={(e) => setValue({ ...value, city: e.target.value, district: '', ward: '' })}
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>

              <select
                className="px-3 py-2 border rounded-lg bg-white"
                value={value.ward}
                onChange={(e) => setValue({ ...value, ward: e.target.value })}
                disabled={!value.city || wards.length === 0}
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Địa chỉ (số nhà, đường) *"
                value={value.address}
                onChange={(e) => setValue({ ...value, address: e.target.value })}
              />
              <button onClick={geocode} type="button" className="px-3 py-2 border rounded-lg inline-flex items-center gap-2 hover:bg-gray-50">
                <Search className="w-4 h-4" /> Tra cứu
              </button>
              <button onClick={useCurrent} type="button" className="px-3 py-2 border rounded-lg inline-flex items-center gap-2 hover:bg-gray-50">
                <Crosshair className="w-4 h-4" /> Vị trí hiện tại
              </button>
            </div>

            <div ref={mapRef} className="w-full h-[360px] rounded-lg border" />

            <div className="grid md:grid-cols-2 gap-3">
              <div className="px-3 py-2 border rounded-lg bg-gray-50">Vĩ độ: {value.latitude.toFixed(6)}</div>
              <div className="px-3 py-2 border rounded-lg bg-gray-50">Kinh độ: {value.longitude.toFixed(6)}</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button type="button" onClick={apply} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Áp dụng</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


