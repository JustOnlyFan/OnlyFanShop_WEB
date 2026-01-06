'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AuthProvider } from './AuthProvider'
import { NotificationProvider } from './NotificationProvider'

const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then(mod => ({ default: mod.ReactQueryDevtools })),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
            // Tối ưu: không refetch khi reconnect
            refetchOnReconnect: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
