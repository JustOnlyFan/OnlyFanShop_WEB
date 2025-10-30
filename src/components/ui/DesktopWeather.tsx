'use client'

import { useState, useEffect } from 'react'
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer, 
  MapPin, 
  Droplets,
  Eye,
  Compass,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WeatherData {
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  visibility: number
  location: string
  country: string
  icon: string
}

export function DesktopWeather() {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    condition: '',
    description: '',
    humidity: 0,
    windSpeed: 0,
    windDirection: 0,
    pressure: 0,
    visibility: 0,
    location: 'Đang tải...',
    country: '',
    icon: '01d'
  })

  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Lấy vị trí và dữ liệu thời tiết
  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setLoading(true)
        setError('')

        // Lấy vị trí hiện tại
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          })
        })

        const { latitude, longitude } = position.coords

        // Gọi API thời tiết (sử dụng OpenWeatherMap)
        const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '89190a7eddee3a2d67cb02f8bda29a99'
        
        if (!API_KEY || API_KEY === 'your_api_key_here') {
          throw new Error('API key chưa được cấu hình')
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=vi`
        )

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('API key không hợp lệ')
          } else if (response.status === 429) {
            throw new Error('Quá nhiều yêu cầu, vui lòng thử lại sau')
          } else {
            throw new Error(`Lỗi API: ${response.status}`)
          }
        }

        const data = await response.json()

        // Sử dụng reverse geocoding để lấy tên địa điểm chính xác hơn
        let locationName = data.name
        
        // Kiểm tra nếu đang ở khu vực Thủ Đức/Q9
        if (latitude >= 10.8 && latitude <= 10.9 && longitude >= 106.7 && longitude <= 106.8) {
          locationName = 'Thủ Đức, Q9'
        } else {
          try {
            const reverseResponse = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            )
            if (reverseResponse.ok) {
              const reverseData = await reverseResponse.json()
              if (reverseData.length > 0) {
                // Ưu tiên tên quận/huyện nếu có
                locationName = reverseData[0].name
                if (reverseData[0].state) {
                  locationName = `${reverseData[0].name}, ${reverseData[0].state}`
                }
              }
            }
          } catch (reverseError) {
            console.log('Reverse geocoding failed, using weather API location')
          }
        }

        setWeather({
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
          windDirection: data.wind.deg,
          pressure: data.main.pressure,
          visibility: Math.round(data.visibility / 1000), // m to km
          location: locationName,
          country: data.sys.country,
          icon: data.weather[0].icon
        })
      } catch (err) {
        console.error('Weather error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Không thể lấy dữ liệu thời tiết'
        setError(errorMessage)
        
        // Fallback data khi API không khả dụng
        const currentHour = new Date().getHours()
        const isDay = currentHour >= 6 && currentHour < 18
        const isEvening = currentHour >= 18 && currentHour < 22
        
        // Tạo dữ liệu thời tiết mẫu dựa trên thời gian thực tế
        const mockWeather = {
          temperature: isDay ? 28 + Math.floor(Math.random() * 5) : 24 + Math.floor(Math.random() * 3),
          condition: isDay ? 'Clear' : isEvening ? 'Clouds' : 'Clear',
          description: isDay ? 'Trời nắng đẹp (dữ liệu mẫu)' : isEvening ? 'Trời có mây (dữ liệu mẫu)' : 'Trời quang đãng (dữ liệu mẫu)',
          humidity: 60 + Math.floor(Math.random() * 20),
          windSpeed: 8 + Math.floor(Math.random() * 10),
          windDirection: Math.floor(Math.random() * 360),
          pressure: 1010 + Math.floor(Math.random() * 10),
          visibility: 8 + Math.floor(Math.random() * 5),
          location: 'Hồ Chí Minh',
          country: 'VN',
          icon: isDay ? '01d' : isEvening ? '02n' : '01n'
        }
        
        setWeather(mockWeather)
      } finally {
        setLoading(false)
      }
    }

    getWeatherData()
  }, [])

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      '01d': <Sun className="w-8 h-8 text-yellow-400" />,
      '01n': <Sun className="w-8 h-8 text-yellow-300" />,
      '02d': <Cloud className="w-8 h-8 text-blue-300" />,
      '02n': <Cloud className="w-8 h-8 text-gray-300" />,
      '03d': <Cloud className="w-8 h-8 text-gray-400" />,
      '03n': <Cloud className="w-8 h-8 text-gray-500" />,
      '04d': <Cloud className="w-8 h-8 text-gray-500" />,
      '04n': <Cloud className="w-8 h-8 text-gray-600" />,
      '09d': <CloudRain className="w-8 h-8 text-blue-500" />,
      '09n': <CloudRain className="w-8 h-8 text-blue-600" />,
      '10d': <CloudRain className="w-8 h-8 text-blue-400" />,
      '10n': <CloudRain className="w-8 h-8 text-blue-500" />,
      '11d': <CloudRain className="w-8 h-8 text-purple-500" />,
      '11n': <CloudRain className="w-8 h-8 text-purple-600" />,
      '13d': <CloudRain className="w-8 h-8 text-blue-200" />,
      '13n': <CloudRain className="w-8 h-8 text-blue-300" />,
      '50d': <Cloud className="w-8 h-8 text-gray-400" />,
      '50n': <Cloud className="w-8 h-8 text-gray-500" />
    }
    return iconMap[iconCode] || <Sun className="w-8 h-8 text-yellow-400" />
  }

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

  const getWindDirection = (degrees: number) => {
    const directions = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc']
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  const refreshWeather = () => {
    window.location.reload()
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-6 md:bottom-10 lg:bottom-16 right-4 md:right-6 lg:right-8 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-4 text-white z-30 w-[280px] shadow-2xl border border-white/10"
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8"
          >
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
              <span className="text-sm text-gray-300">Đang tải dữ liệu thời tiết...</span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="weather"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Header với địa điểm và refresh button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <div>
                  <h3 className="font-bold text-lg">{weather.location}</h3>
                  <p className="text-xs text-gray-400">{weather.country}</p>
                </div>
              </div>
              <button
                onClick={refreshWeather}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                title="Làm mới"
              >
                <RefreshCw className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Ngày tháng */}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>{formatDate(currentTime)}</span>
            </div>

            {/* Thời gian */}
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="font-mono text-lg">{formatTime(currentTime)}</span>
            </div>

            {/* Thời tiết chính */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {getWeatherIcon(weather.icon)}
                </motion.div>
                <div>
                  <div className="text-4xl font-bold">{weather.temperature}°C</div>
                  <div className="text-sm text-gray-300 capitalize">{weather.description}</div>
                </div>
              </div>
            </div>

            {/* Chi tiết thời tiết */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>Độ ẩm</span>
                </div>
                <span className="font-semibold">{weather.humidity}%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span>Gió</span>
                </div>
                <span className="font-semibold">{weather.windSpeed} km/h</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-orange-400" />
                  <span>Hướng</span>
                </div>
                <span className="font-semibold">{getWindDirection(weather.windDirection)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-red-400" />
                  <span>Áp suất</span>
                </div>
                <span className="font-semibold">{weather.pressure} hPa</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg col-span-2">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Tầm nhìn</span>
                </div>
                <span className="font-semibold">{weather.visibility} km</span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-xs text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20"
              >
                <div className="font-semibold mb-1">⚠️ Thông báo</div>
                <div>{error}</div>
                <div className="text-xs text-amber-300 mt-1">
                  Đang hiển thị dữ liệu mẫu. Kiểm tra kết nối mạng hoặc API key.
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 pt-2 border-t border-white/10">
              Cập nhật lần cuối: {formatTime(currentTime)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}