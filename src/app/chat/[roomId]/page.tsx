'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ChatService, Message } from '@/services/chatService'
import { websocketService, WebSocketMessage } from '@/services/websocketService'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Send,
  MessageCircle,
  User,
  Package
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import Image from 'next/image'

export default function CustomerChatRoomPage() {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [productInfo, setProductInfo] = useState<{ id: string; name: string; image: string } | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  
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
      // Load initial messages from Firebase
      loadMessages()
      
      // Connect WebSocket for real-time messages
      websocketService.connect()
        .then(() => {
          setWsConnected(true)
          
          // Subscribe to room for real-time messages
          websocketService.subscribeToRoom(roomId, (wsMessage: WebSocketMessage) => {
            // Add new message from WebSocket
            const newMessage: Message = {
              roomId: wsMessage.roomId,
              senderId: wsMessage.senderId,
              senderName: wsMessage.senderName || 'User',
              message: wsMessage.message,
              timestamp: wsMessage.timestamp?.toString(),
              epochMillis: wsMessage.timestamp,
              isRead: wsMessage.isRead || false
            }
            
            setMessages(prev => {
              // Avoid duplicates
              const exists = prev.some(m => 
                m.messageId === newMessage.messageId || 
                (m.senderId === newMessage.senderId && 
                 m.message === newMessage.message && 
                 Math.abs((m.epochMillis || 0) - (newMessage.epochMillis || 0)) < 1000)
              )
              if (exists) return prev
              return [...prev, newMessage]
            })
          })
        })
        .catch((error) => {
          console.error('WebSocket connection failed:', error)
          // Fallback to polling if WebSocket fails
          const interval = setInterval(() => {
            loadMessages()
          }, 3000)
          return () => clearInterval(interval)
        })
      
      return () => {
        websocketService.unsubscribeFromRoom(roomId)
      }
    }
  }, [roomId, isAuthenticated, loadMessages])

  // Load product info if available
  useEffect(() => {
    if (roomId && roomId.includes('_product_')) {
      const parts = roomId.split('_product_')
      if (parts.length > 1) {
        const productId = parts[1]
        // You can fetch product details here if needed
        setProductInfo({
          id: productId,
          name: 'Sản phẩm',
          image: '/images/placeholder.svg'
        })
      }
    }
  }, [roomId])

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return

    try {
      setSending(true)
      
      // Try WebSocket first (faster, real-time)
      if (wsConnected && websocketService.isConnectedToServer()) {
        websocketService.sendMessage(roomId, messageText.trim())
        // Message will appear via WebSocket subscription
        setMessageText('')
      } else {
        // Fallback to REST API (saves to Firebase)
        await ChatService.sendMessage({
          roomId,
          message: messageText.trim()
        })
        setMessageText('')
        // Reload messages to get the new one
        await loadMessages()
      }
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
              Chat với nhân viên
            </h2>
            <p className="text-white/80 text-sm">OnlyFanShop Support</p>
          </div>
        </div>
        {wsConnected && (
          <div className="flex items-center text-white/80 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Đã kết nối
          </div>
        )}
      </div>

      {/* Product Info Banner */}
      {productInfo && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">Đang trao đổi về sản phẩm</p>
            <p className="text-xs text-blue-700">{productInfo.name}</p>
          </div>
          {productInfo.image && (
            <div className="w-10 h-10 relative rounded overflow-hidden">
              <Image
                src={productInfo.image}
                alt={productInfo.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      )}

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






