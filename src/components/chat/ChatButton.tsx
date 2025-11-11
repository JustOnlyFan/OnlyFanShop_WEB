'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { ChatService } from '@/services/chatService'
import { MessageCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const handleChatClick = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để sử dụng chat')
      router.push('/auth/login')
      return
    }

    try {
      setLoading(true)
      // Get or create chat room
      const response = await ChatService.getOrCreateCustomerRoom()
      if (response.data) {
        const room = response.data
        // Navigate to chat page
        router.push(`/chat/${room}`)
      }
    } catch (error: any) {
      console.error('Error creating chat room:', error)
      toast.error('Không thể mở chat. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // Only show chat button for customers
  if (!isAuthenticated || user?.role !== 'CUSTOMER') {
    return null
  }

  return (
    <motion.button
      onClick={handleChatClick}
      disabled={loading}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-50 transition-all hover:scale-110 disabled:opacity-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Mở chat với hỗ trợ"
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <MessageCircle className="w-6 h-6" />
      )}
    </motion.button>
  )
}

