'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Edit, Save, X, Lock, ShoppingBag, Heart, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { UserService } from '@/services/userService';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchUserData();
  }, [user, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await UserService.getProfile();
      console.log('Profile API response:', response);
      if (response.data) {
        const data = response.data as any;
        const profileData = {
          fullName: data.fullName || data.username || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || data.phone || '',
          address: data.address || ''
        };
        console.log('Setting form data:', profileData);
        setFormData(profileData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      const response = await UserService.updateProfile({
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });
      if (response.data) {
        // Update formData with response data
        const data = response.data as any;
        setFormData({
          fullName: data.fullName || data.username || formData.fullName,
          email: data.email || formData.email,
          phoneNumber: data.phoneNumber || data.phone || '',
          address: data.address || ''
        });
        setSuccess('Cập nhật thông tin thành công!');
        setEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload data from backend
    fetchUserData();
    setEditing(false);
    setError('');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const openOrderHistory = (status?: string) => {
    if (status) {
      router.push(`/orders?status=${status}`);
    } else {
      router.push('/orders');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden lg:scrollbar-hide">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thông tin cá nhân
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin tài khoản và cài đặt của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {formData.fullName || user.fullName || user.username || 'Khách hàng'}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>

                <nav className="space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-blue-600 bg-blue-50 rounded-lg">
                    <User className="w-5 h-5" />
                    Thông tin cá nhân
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                    <Lock className="w-5 h-5" />
                    Đổi mật khẩu
                  </button>
                  <button 
                    onClick={() => openOrderHistory()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Đơn hàng của tôi
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                    <Heart className="w-5 h-5" />
                    Sản phẩm yêu thích
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg">
                    <Settings className="w-5 h-5" />
                    Cài đặt
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Thông tin cá nhân
                    </h2>
                    {!editing ? (
                      <Button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {saving ? <LoadingSpinner /> : <Save className="w-4 h-4" />}
                          Lưu
                        </Button>
                        <Button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <X className="w-4 h-4" />
                          Hủy
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                      {success}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!editing}
                          rows={3}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Đăng xuất
                        </h3>
                        <p className="text-sm text-gray-600">
                          Bạn có thể đăng xuất khỏi tài khoản của mình
                        </p>
                      </div>
                      <Button
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                      >
                        Đăng xuất
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
