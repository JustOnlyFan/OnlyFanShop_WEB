'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center p-8">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy trang</h2>
          <p className="text-gray-600 mb-6">
            Trang admin bạn đang tìm kiếm không tồn tại.
          </p>
        </div>
        <Link href="/admin">
          <Button className="w-full flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Về Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
