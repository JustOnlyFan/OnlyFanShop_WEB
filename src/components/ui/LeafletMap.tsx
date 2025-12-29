'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

interface LeafletMapProps {
  latitude: number
  longitude: number
  onLocationChange?: (lat: number, lng: number) => void
  height?: string
  zoom?: number
}

export default function LeafletMap({ 
  latitude, 
  longitude, 
  onLocationChange,
  height = '300px',
  zoom = 15
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Create map
    const map = L.map(containerRef.current).setView([latitude, longitude], zoom)
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)

    // Add marker
    const marker = L.marker([latitude, longitude], { 
      icon: defaultIcon,
      draggable: true 
    }).addTo(map)

    // Handle marker drag
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      onLocationChange?.(pos.lat, pos.lng)
    })

    // Handle map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      marker.setLatLng([lat, lng])
      onLocationChange?.(lat, lng)
    })

    mapRef.current = map
    markerRef.current = marker

    // Cleanup
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  // Update marker position when props change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude])
      mapRef.current.setView([latitude, longitude], mapRef.current.getZoom())
    }
  }, [latitude, longitude])

  return (
    <div 
      ref={containerRef} 
      style={{ height, width: '100%' }}
      className="z-0"
    />
  )
}
