'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { 
  Heart, 
  ShoppingBag, 
  Trash2, 
  Grid, 
  List,
  ArrowLeft,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Load wishlist from localStorage (in real app, this would be from API)
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    }
    setLoading(false);
  }, [isAuthenticated, router]);

  const removeFromWishlist = (productId: number) => {
    const updatedItems = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updatedItems);
    localStorage.setItem('wishlist', JSON.stringify(updatedItems));
  };

  const removeSelectedItems = () => {
    const updatedItems = wishlistItems.filter(item => !selectedItems.includes(item.id));
    setWishlistItems(updatedItems);
    setSelectedItems([]);
    localStorage.setItem('wishlist', JSON.stringify(updatedItems));
  };

  const toggleItemSelection = (productId: number) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(wishlistItems.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Trang chủ
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Danh sách yêu thích
            </h1>
            <p className="text-gray-600">
              {wishlistItems.length} sản phẩm trong danh sách yêu thích
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Xem:</span>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Bulk Actions */}
            {wishlistItems.length > 0 && (
              <div className="flex items-center gap-2">
                {selectedItems.length === 0 ? (
                  <Button variant="outline" onClick={selectAllItems}>
                    Chọn tất cả
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={clearSelection}>
                      Bỏ chọn
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={removeSelectedItems}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa đã chọn
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Danh sách yêu thích trống
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy thêm sản phẩm yêu thích để xem chúng ở đây
            </p>
            <Link href="/products">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Khám phá sản phẩm
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {wishlistItems.map((product) => (
                <div key={product.id} className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(product.id)}
                      onChange={() => toggleItemSelection(product.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromWishlist(product.id)}
                      className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <ProductCard
                    product={product}
                    viewMode={viewMode}
                    className="hover:shadow-lg transition-shadow duration-300"
                  />
                </div>
              ))}
            </div>

            {/* Selected Items Actions */}
            {selectedItems.length > 0 && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Đã chọn {selectedItems.length} sản phẩm
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={removeSelectedItems}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa đã chọn
                  </Button>
                  <Button onClick={clearSelection}>
                    Bỏ chọn
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}








