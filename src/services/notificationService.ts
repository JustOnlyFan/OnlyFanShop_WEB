import { apiClient } from '@/lib/api';
import { Notification } from '@/types';

export const notificationService = {
  // Lấy danh sách thông báo của user
  async getUserNotifications(userId: number): Promise<{ data: Notification[] }> {
    const response = await apiClient.get(`/notifications/user/${userId}`);
    return response.data as { data: Notification[] };
  },

  // Tạo thông báo mới
  async createNotification(userId: number, message: string): Promise<{ data: Notification }> {
    const response = await apiClient.post(`/notifications/create?userID=${userId}&message=${message}`);
    return response.data as { data: Notification };
  },

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId: number): Promise<{ message: string }> {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data as { message: string };
  },

  // Lấy số lượng thông báo chưa đọc
  async getUnreadCount(userId: number): Promise<{ data: number }> {
    const response = await apiClient.get(`/notifications/user/${userId}/unread-count`);
    return response.data as { data: number };
  }
};
