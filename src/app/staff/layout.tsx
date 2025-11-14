'use client'

import { RouteGuard } from '@/components/auth/RouteGuard'

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard allowedRoles={['STAFF']}>
      {children}
    </RouteGuard>
  )
}


