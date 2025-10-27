'use client'

import { useAuthStore } from '@/store/authStore'
import { User, MapPin, Clock, Thermometer } from 'lucide-react'
import { useState, useEffect } from 'react'

export function DesktopProfileInfo() {
  const { user, isAuthenticated } = useAuthStore()
  const [currentTime, setCurrentTime] = useState(new Date())

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

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-8 bg-black/30 backdrop-blur-md rounded-xl p-3 text-white z-30 w-[260px]">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">{user.username}</h3>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              Online
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Location */}
            <div className="flex items-center space-x-2 text-gray-300">
              <MapPin className="w-3 h-3 text-blue-300" />
              <span>Hồ Chí Minh, Việt Nam</span>
            </div>

            {/* Temperature */}
            <div className="flex items-center space-x-2 text-gray-300">
              <Thermometer className="w-3 h-3 text-orange-300" />
              <span>28°C - Nắng</span>
            </div>

            {/* Time */}
            <div className="flex items-center space-x-2 text-gray-300">
              <Clock className="w-3 h-3 text-green-300" />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>

            {/* User Details */}
            <div className="pt-2 border-t border-white/10">
              <div className="text-gray-400 text-xs">
                <div>Email: {user.email}</div>
                {user.phoneNumber && <div>Phone: {user.phoneNumber}</div>}
                <div>Role: {user.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
