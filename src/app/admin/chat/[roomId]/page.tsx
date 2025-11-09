'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ChatService, Message, ChatRoom } from '@/services/chatService'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Send,
  Paperclip,
  Image as ImageIcon,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminChatRoomPage() {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const router = useRouter()
  const params = useParams()
  const roomId = params.roomId as string
  const { user, isAuthenticated, hasHydrated } = useAuthStore()

  useEffect(() => {
    if (!hasHydrated) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
  }, [hasHydrated, isAuthenticated, user, router])

  // Extract customer name from roomId
  const extractCustomerName = (roomId: string): string => {
    try {
      if (roomId && roomId.startsWith("chatRoom_")) {
        const parts = roomId.split("_")
        // Format: chatRoom_username_userId
        if (parts.length >= 3) {
          return parts[1] // Return username (e.g., "NTT")
        } else if (parts.length === 2) {
          return parts[1] // Return userID if old format
        }
      }
      return roomId
    } catch {
      return roomId
    }
  }

  const customerName = extractCustomerName(roomId)

  const loadMessages = useCallback(async () => {
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
      toast.success('Đã gửi tin nhắn')
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

  const handleDeleteMessage = async (messageId?: string) => {
    if (!messageId || deletingId) return
    const confirmed = window.confirm('Xóa tin nhắn này?')
    if (!confirmed) return
    try {
      setDeletingId(messageId)
      await ChatService.deleteMessage(messageId)
      // Optimistic update
      setMessages(prev => prev.filter(m => (m.messageId || m.id) !== messageId))
      toast.success('Đã xóa tin nhắn')
    } catch (error: any) {
      console.error('Error deleting message:', error)
      toast.error('Không thể xóa tin nhắn')
    } finally {
      setDeletingId(null)
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
      
      // Check if date is valid
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
    <div className="w-full h-full flex flex-col bg-gray-100">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-fuchsia-700 px-6 py-4 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => router.push('/admin/chat')}
          className="flex items-center text-white hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </button>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <h2 className="text-white font-semibold text-lg">
              {customerName || 'Loading...'}
            </h2>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-white min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Chưa có tin nhắn nào</p>
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${
                    isOwn ? 'bg-blue-600' : 'bg-gray-400'
                  }`}>
                    {message.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
                {!showAvatar && <div className="w-8 flex-shrink-0" />}

                {/* Message Bubble */}
                <div className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwn 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  {!isOwn && showAvatar && (
                    <p className="text-xs font-semibold mb-1 opacity-75">
                      {message.senderName}
                    </p>
                  )}
                  <p className="break-words">{messageContent}</p>
                  <p className={`text-xs mt-1 ${
                    isOwn ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatMessageTime(messageTimestamp)}
                  </p>
                  {/* Delete button for admin */}
                  <button
                    aria-label="Xóa tin nhắn"
                    title="Xóa tin nhắn"
                    onClick={() => handleDeleteMessage(message.messageId || message.id)}
                    className={`absolute -top-2 ${isOwn ? '-left-2' : '-right-2'} p-1 rounded-full bg-white/80 border border-gray-200 shadow hover:bg-white transition text-gray-600`}
                  >
                    <X className={`w-3.5 h-3.5 ${deletingId === (message.messageId || message.id) ? 'animate-pulse' : ''}`} />
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white flex-shrink-0">
        <div className="flex items-end space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={1}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending}
            className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
