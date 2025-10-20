import { apiClient } from '@/lib/api';
import { User } from '@/types';

export const userService = {
  // Lấy thông tin user hiện tại
  async getUser(): Promise<{ data: User }> {
    try {
      const response = await apiClient.get('/users/getUser');
      return response.data as { data: User };
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Return mock data if API fails
      return {
        data: {
          userID: 1,
          username: 'demo_user',
          email: 'demo@example.com',
          phoneNumber: '0123456789',
          address: 'Demo Address',
          role: 'CUSTOMER',
          authProvider: 'LOCAL'
        }
      };
    }
  },

  // Cập nhật thông tin user
  async updateUser(userData: Partial<User>): Promise<{ data: User }> {
    const response = await apiClient.put('/users/updateUser', userData);
    return response.data as { data: User };
  },

  // Đổi mật khẩu
  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.put('/users/changePassword', {
      oldPassword,
      newPassword
    });
    return response.data as { message: string };
  },

  // Đổi địa chỉ
  async changeAddress(address: string): Promise<{ message: string }> {
    const response = await apiClient.put(`/users/changeAddress?address=${address}`);
    return response.data as { message: string };
  },

  // Đăng xuất
  async logout(): Promise<{ message: string }> {
    const response = await apiClient.post('/users/logout');
    return response.data as { message: string };
  }
};
