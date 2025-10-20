import { apiClient } from '@/lib/api';
import { StoreLocation } from '@/types';

export const storeLocationService = {
  // Lấy tất cả địa điểm cửa hàng
  async getAllLocations(): Promise<{ data: StoreLocation[] }> {
    const response = await apiClient.get('/store-locations');
    return response.data as { data: StoreLocation[] };
  },

  // Lấy địa điểm theo ID
  async getLocationById(id: number): Promise<{ data: StoreLocation }> {
    const response = await apiClient.get(`/store-locations/${id}`);
    return response.data as { data: StoreLocation };
  },

  // Tạo địa điểm mới
  async createLocation(location: Omit<StoreLocation, 'locationID'>): Promise<{ data: StoreLocation }> {
    const response = await apiClient.post('/store-locations', location);
    return response.data as { data: StoreLocation };
  },

  // Cập nhật địa điểm
  async updateLocation(id: number, location: Omit<StoreLocation, 'locationID'>): Promise<{ data: StoreLocation }> {
    const response = await apiClient.put(`/store-locations/${id}`, location);
    return response.data as { data: StoreLocation };
  },

  // Xóa địa điểm
  async deleteLocation(id: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/store-locations/${id}`);
    return response.data as { message: string };
  }
};
