'use client'

import { useState, useEffect } from 'react'
import { MapPin, Clock, Thermometer } from 'lucide-react'

export function DesktopSystemInfo() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState('Hồ Chí Minh, Việt Nam')
  const [temperature, setTemperature] = useState(28)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-50">
      <div className="flex items-center space-x-4">
        {/* Location */}
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-blue-300" />
          <span className="text-xs">{location}</span>
        </div>

        {/* Temperature */}
        <div className="flex items-center space-x-1">
          <Thermometer className="w-4 h-4 text-orange-300" />
          <span className="text-xs">{temperature}°C</span>
        </div>

        {/* Time */}
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4 text-green-300" />
          <div className="text-xs">
            <div className="font-mono">{formatTime(currentTime)}</div>
            <div className="text-xs opacity-75">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
