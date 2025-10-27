import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface Message {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderRole: 'CUSTOMER' | 'ADMIN'
  content: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE'
  timestamp: string
  isRead: boolean
  replyTo?: string
}

export interface ChatRoom {
  id: string
  customerId: string
  customerName: string
  adminId?: string
  adminName?: string
  lastMessage?: Message
  unreadCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SendMessageRequest {
  roomId: string
  content: string
  messageType?: 'TEXT' | 'IMAGE' | 'FILE'
  replyTo?: string
}

export interface CreateChatRoomRequest {
  customerId: string
  customerName: string
}

export interface ChatRoomResponse {
  rooms: ChatRoom[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

export class ChatService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Get or create customer chat room
  static async getOrCreateCustomerRoom(): Promise<ApiResponse<string>> {
    try {
      const response = await axios.get(`${API_URL}/api/chat/rooms/customer`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get/create chat room')
    }
  }

  // Get chat rooms (Admin only)
  static async getChatRooms(page: number = 0, size: number = 20): Promise<ApiResponse<ChatRoomResponse>> {
    try {
      const response = await axios.get(`${API_URL}/api/chat/rooms?page=${page}&size=${size}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get chat rooms')
    }
  }

  // Create chat room (Admin only)
  static async createChatRoom(roomData: CreateChatRoomRequest): Promise<ApiResponse<string>> {
    try {
      const response = await axios.post(`${API_URL}/api/chat/rooms`, roomData, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create chat room')
    }
  }

  // Get messages from a room
  static async getMessages(roomId: string, page: number = 0, size: number = 50): Promise<ApiResponse<Message[]>> {
    try {
      const response = await axios.get(`${API_URL}/api/chat/rooms/${roomId}/messages?page=${page}&size=${size}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get messages')
    }
  }

  // Send message
  static async sendMessage(messageData: SendMessageRequest): Promise<ApiResponse<string>> {
    try {
      const response = await axios.post(`${API_URL}/api/chat/messages`, messageData, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send message')
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(roomId: string, messageIds: string[]): Promise<ApiResponse<void>> {
    try {
      const response = await axios.put(`${API_URL}/api/chat/rooms/${roomId}/read`, 
        { messageIds },
        { headers: this.getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark messages as read')
    }
  }

  // Get unread message count
  static async getUnreadCount(): Promise<ApiResponse<number>> {
    try {
      const response = await axios.get(`${API_URL}/api/chat/unread-count`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get unread count')
    }
  }

  // Upload file for chat
  static async uploadFile(file: File, roomId: string): Promise<ApiResponse<string>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('roomId', roomId)

      const response = await axios.post(`${API_URL}/api/chat/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload file')
    }
  }

  // Delete message
  static async deleteMessage(messageId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(`${API_URL}/api/chat/messages/${messageId}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete message')
    }
  }

  // Get chat room by ID
  static async getChatRoomById(roomId: string): Promise<ApiResponse<ChatRoom>> {
    try {
      const response = await axios.get(`${API_URL}/api/chat/rooms/${roomId}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get chat room')
    }
  }

  // Search messages
  static async searchMessages(roomId: string, query: string, page: number = 0, size: number = 20): Promise<ApiResponse<Message[]>> {
    try {
      const response = await axios.get(`${API_URL}/api/chat/rooms/${roomId}/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search messages')
    }
  }

  // Get chat statistics (Admin only)
  static async getChatStatistics(): Promise<ApiResponse<any>> {
    try {
      const response = await axios.get(`${API_URL}/api/chat/statistics`, {
        headers: this.getAuthHeaders()
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get chat statistics')
    }
  }

  // Format message timestamp
  static formatMessageTime(timestamp: string): string {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes < 1 ? 'Vừa xong' : `${diffInMinutes} phút trước`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)} ngày trước`
    } else {
      return date.toLocaleDateString('vi-VN')
    }
  }

  // Format message for display
  static formatMessage(message: Message, currentUserId: string): {
    isOwn: boolean
    senderName: string
    timestamp: string
    content: string
  } {
    return {
      isOwn: message.senderId === currentUserId,
      senderName: message.senderName,
      timestamp: this.formatMessageTime(message.timestamp),
      content: message.content
    }
  }

  // Validate message content
  static validateMessage(content: string, messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'): { isValid: boolean, error?: string } {
    if (!content?.trim()) {
      return { isValid: false, error: 'Message content cannot be empty' }
    }

    if (messageType === 'TEXT' && content.length > 1000) {
      return { isValid: false, error: 'Message is too long (max 1000 characters)' }
    }

    return { isValid: true }
  }

  // Generate room ID (for consistency with backend)
  static generateRoomId(customerId: string): string {
    return `chatRoom_${customerId}`
  }
}