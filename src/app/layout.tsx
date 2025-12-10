import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { ConditionalHeader } from '@/components/layout/ConditionalHeader'
import { ConditionalFooter } from '@/components/layout/ConditionalFooter'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'
import { ChatButton } from '@/components/chat/ChatButton'
import { RouteGuard } from '@/components/auth/RouteGuard'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap', // Giảm FOUT
  preload: true,
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap', // Giảm FOUT
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'OnlyFan Shop - Quạt điện cao cấp',
  description: 'Cửa hàng quạt điện cao cấp với đa dạng sản phẩm từ các thương hiệu uy tín. Quạt đứng, quạt trần, quạt hơi nước và nhiều hơn nữa.',
  keywords: 'quạt điện, quạt đứng, quạt trần, quạt hơi nước, quạt không cánh, OnlyFan',
  authors: [{ name: 'OnlyFan Shop Team' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'OnlyFan Shop - Quạt điện cao cấp',
    description: 'Cửa hàng quạt điện cao cấp với đa dạng sản phẩm từ các thương hiệu uy tín.',
    type: 'website',
    locale: 'vi_VN',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${inter.variable} ${poppins.variable}`}>

      <body className="font-sans antialiased overflow-x-hidden">
        <div className="overflow-x-hidden w-full">
          <Providers>
            <ErrorBoundary>
              <RouteGuard>
                <ConditionalHeader />
                <main>{children}</main>
                <ConditionalFooter />
                <ChatButton />
              </RouteGuard>
            </ErrorBoundary>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Providers>
        </div>
      </body>
    </html>
  )
}