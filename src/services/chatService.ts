import { apiClient } from '@/lib/api';
import { ChatMessage } from '@/types';

export const chatService = {
  // Đồng bộ tin nhắn từ Firebase
  async syncMessage(
    senderId: string,
    receiverId: string,
    message: string,
    timestamp: number
  ): Promise<{ message: string }> {
    const response = await apiClient.post(`/api/chat/sync-message?senderId=${senderId}&receiverId=${receiverId}&message=${message}&timestamp=${timestamp}`);
    return response.data as { message: string };
  },

  // Lấy tin nhắn giữa hai user
  async getMessages(
    userId1: number,
    userId2: number,
    page: number = 0,
    size: number = 50
  ): Promise<{ data: ChatMessage[] }> {
    const response = await apiClient.get(`/api/chat/messages?userId1=${userId1}&userId2=${userId2}&page=${page}&size=${size}`);
    return response.data as { data: ChatMessage[] };
  },

  // Đánh dấu tin nhắn đã đọc
  async markAsRead(messageId: number): Promise<{ message: string }> {
    const response = await apiClient.put(`/api/chat/mark-read/${messageId}`);
    return response.data as { message: string };
  }
};
