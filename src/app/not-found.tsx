'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy trang</h2>
          <p className="text-gray-600 mb-6">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại.
          </p>
        </div>
        <Link href="/">
          <Button className="w-full">
            Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
