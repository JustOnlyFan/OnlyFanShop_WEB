import { apiClient } from '@/lib/api';

export interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannerResponse {
  banners: Banner[];
  total: number;
}

export class BannerService {
  // Get all active banners
  static async getBanners(): Promise<Banner[]> {
    try {
      const response = await apiClient.get('/banners/active');
      return (response.data as Banner[]) || [];
    } catch (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
  }

  // Get banner by ID
  static async getBannerById(id: string): Promise<Banner | null> {
    try {
      const response = await apiClient.get(`/banners/${id}`);
      return response.data as Banner;
    } catch (error) {
      console.error('Error fetching banner:', error);
      return null;
    }
  }

  // Get homepage banners (for hero section)
  static async getHomepageBanners(): Promise<Banner[]> {
    try {
      const response = await apiClient.get('/banners/homepage');
      return (response.data as Banner[]) || [];
    } catch (error) {
      console.error('Error fetching homepage banners:', error);
      return [];
    }
  }

  // Get promotional banners
  static async getPromotionalBanners(): Promise<Banner[]> {
    try {
      const response = await apiClient.get('/banners/promotional');
      return (response.data as Banner[]) || [];
    } catch (error) {
      console.error('Error fetching promotional banners:', error);
      return [];
    }
  }
}
