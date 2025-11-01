'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ChatService, ChatRoomAdmin } from '@/services/chatService'
import { motion } from 'framer-motion'
import { 
  Search, 
  ArrowLeft,
  MessageCircle,
  Users,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import Image from 'next/image'

export default function AdminChatPage() {
  const [loading, setLoading] = useState(true)
  const [chatRooms, setChatRooms] = useState<ChatRoomAdmin[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const router = useRouter()
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    loadChatRooms()
  }, [hasHydrated, isAuthenticated, user, router])

  const loadChatRooms = async () => {
    try {
      setLoading(true)
      const data = await ChatService.getAllChatRooms()
      setChatRooms(data || [])
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách chat')
    } finally {
      setLoading(false)
    }
  }

  const filteredRooms = chatRooms.filter(room =>
    room.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatTime = (timeValue: string | Date) => {
    try {
      const date = typeof timeValue === 'string' ? new Date(timeValue) : timeValue
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
        return diffInMinutes < 1 ? 'Vừa xong' : `${diffInMinutes} phút trước`
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} giờ trước`
      } else if (diffInHours < 168) {
        return `${Math.floor(diffInHours / 24)} ngày trước`
      } else {
        return format(date, 'dd/MM/yyyy')
      }
    } catch {
      return typeof timeValue === 'string' ? timeValue : 'Unknown'
    }
  }

  const handleOpenChat = (roomId: string) => {
    // Navigate to chat room or open chat modal
    router.push(`/admin/chat/${roomId}`)
  }

  const totalChats = chatRooms.length
  const totalUnread = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0)
  const totalOnline = chatRooms.filter(room => room.isOnline).length

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Chat</h1>
            <p className="mt-1 text-gray-600">Quản lý tất cả các cuộc trò chuyện với khách hàng</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng cuộc chat</p>
                <p className="text-2xl font-bold text-gray-900">{totalChats}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chưa đọc</p>
                <p className="text-2xl font-bold text-gray-900">{totalUnread}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang online</p>
                <p className="text-2xl font-bold text-gray-900">{totalOnline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên khách hàng hoặc tin nhắn..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Chat Rooms List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredRooms.map((room, index) => (
              <motion.div
                key={room.roomId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleOpenChat(room.roomId)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      {room.customerAvatar ? (
                        <Image
                          src={room.customerAvatar}
                          alt={room.customerName}
                          fill
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold">
                          {room.customerName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {room.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {room.customerName}
                      </h3>
                      <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(room.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {room.lastMessage || 'Chưa có tin nhắn'}
                    </p>
                  </div>

                  {/* Unread Count */}
                  {room.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-semibold rounded-full">
                        {room.unreadCount > 99 ? '99+' : room.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Không tìm thấy cuộc chat nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
