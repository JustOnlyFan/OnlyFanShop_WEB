'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ChatService, Message } from '@/services/chatService'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Send,
  MessageCircle,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function CustomerChatRoomPage() {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const roomId = params.roomId as string
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
  }, [hasHydrated, isAuthenticated, router])

  const loadMessages = useCallback(async () => {
    if (!roomId) return
    try {
      const response = await ChatService.getMessages(roomId, 0, 100)
      if (response.data) {
        setMessages(response.data)
        setLoading(false)
      }
    } catch (error: any) {
      console.error('Error loading messages:', error)
      setLoading(false)
      if (error.message && !error.message.includes('Failed')) {
        toast.error('Không thể tải tin nhắn')
      }
    }
  }, [roomId])

  useEffect(() => {
    if (roomId && isAuthenticated) {
      loadMessages()
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        loadMessages()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [roomId, isAuthenticated, loadMessages])

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return

    try {
      setSending(true)
      await ChatService.sendMessage({
        roomId,
        message: messageText.trim()
      })
      setMessageText('')
      // Reload messages
      await loadMessages()
    } catch (error: any) {
      console.error('Error sending message:', error)
      toast.error('Không thể gửi tin nhắn')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (timestamp: string | number | undefined) => {
    try {
      let date: Date
      if (typeof timestamp === 'number') {
        date = new Date(timestamp)
      } else if (typeof timestamp === 'string') {
        date = new Date(timestamp)
      } else {
        return 'Unknown'
      }
      
      if (isNaN(date.getTime())) {
        return 'Invalid'
      }
      return format(date, 'HH:mm')
    } catch {
      return 'Unknown'
    }
  }

  if (!hasHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between border-b border-gray-200 flex-shrink-0 shadow-md">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-white hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Trang chủ
        </button>
        <div className="flex items-center space-x-3">
          <MessageCircle className="w-6 h-6 text-white" />
          <div className="text-right">
            <h2 className="text-white font-semibold text-lg">
              Chat với hỗ trợ
            </h2>
            <p className="text-white/80 text-sm">OnlyFanShop Support</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-white min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Chưa có tin nhắn nào</p>
            <p className="text-sm mt-2">Hãy bắt đầu cuộc trò chuyện với chúng tôi!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === user?.userID?.toString()
            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId

            const messageContent = message.message || message.content || ''
            const messageKey = message.messageId || message.id || `msg-${index}`
            const messageTimestamp = message.epochMillis || message.timestamp

            return (
              <motion.div
                key={messageKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                {showAvatar && (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                    isOwn ? 'bg-blue-600' : 'bg-green-500'
                  }`}>
                    {isOwn ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <MessageCircle className="w-5 h-5" />
                    )}
                  </div>
                )}
                {!showAvatar && <div className="w-10 flex-shrink-0" />}

                {/* Message Bubble */}
                <div className={`relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  isOwn 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  {!isOwn && showAvatar && (
                    <p className="text-xs font-semibold mb-1 text-blue-600">
                      {message.senderName || 'Hỗ trợ'}
                    </p>
                  )}
                  <p className="break-words text-sm leading-relaxed">{messageContent}</p>
                  <p className={`text-xs mt-2 ${
                    isOwn ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(messageTimestamp)}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white flex-shrink-0 shadow-lg">
        <div className="flex items-end space-x-3">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn của bạn..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending}
            className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {sending ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}





