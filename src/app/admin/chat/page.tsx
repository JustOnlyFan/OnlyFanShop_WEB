'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ChatService, ChatRoomAdmin } from '@/services/chatService'
import { motion } from 'framer-motion'
import { Search, MessageCircle, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import Image from 'next/image'
import { AdminCard, AdminCardHeader, AdminCardBody, AdminInput, AdminStats } from '@/components/admin/ui'

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
    router.push(`/admin/chat/${roomId}`)
  }

  const totalChats = chatRooms.length
  const totalUnread = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0)
  const totalOnline = chatRooms.filter(room => room.isOnline).length

  if (!hasHydrated || loading) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStats title="Tổng cuộc chat" value={totalChats} icon={<MessageCircle className="w-5 h-5" />} color="blue" />
        <AdminStats title="Chưa đọc" value={totalUnread} icon={<MessageCircle className="w-5 h-5" />} color="orange" />
        <AdminStats title="Đang online" value={totalOnline} icon={<Users className="w-5 h-5" />} color="green" />
      </div>

      {/* Search */}
      <AdminCard><AdminCardBody><AdminInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm theo tên khách hàng hoặc tin nhắn..." icon={<Search className="w-5 h-5" />} /></AdminCardBody></AdminCard>

      {/* Chat Rooms List */}
      <AdminCard>
        <AdminCardHeader title="Danh sách cuộc chat" subtitle={`${filteredRooms.length} cuộc chat`} />
        <AdminCardBody className="p-0">
          {filteredRooms.length === 0 ? (
            <div className="p-12 text-center"><MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">Không tìm thấy cuộc chat nào</p></div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRooms.map((room, index) => (
                <motion.div key={room.roomId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="p-4 hover:bg-cyan-50/50 transition-colors cursor-pointer" onClick={() => handleOpenChat(room.roomId)}>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden">
                        {room.customerAvatar ? (
                          <Image src={room.customerAvatar} alt={room.customerName} fill className="rounded-full object-cover" />
                        ) : (
                          <span className="text-white font-semibold">{room.customerName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      {room.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{room.customerName}</h3>
                        <span className="text-sm text-gray-500 flex-shrink-0 ml-2">{formatTime(room.lastMessageTime)}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{room.lastMessage || 'Chưa có tin nhắn'}</p>
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
          )}
        </AdminCardBody>
      </AdminCard>
    </div>
  )
}
