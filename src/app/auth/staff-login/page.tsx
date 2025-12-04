'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { AuthService } from '@/services/authService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { User, Lock, ArrowRight, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function StaffLoginPage() {
  const router = useRouter()
  const { setUser, isAuthenticated, hasHydrated, user } = useAuthStore()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return
    
    // If already logged in as staff, redirect to staff dashboard
    if (isAuthenticated && user?.role === 'STAFF') {
      router.push('/staff')
      return
    }
    
    // If logged in as other role, redirect to home
    if (isAuthenticated && user?.role !== 'STAFF') {
      router.push('/')
      return
    }
  }, [hasHydrated, isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !password.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      setLoading(true)
      const response = await AuthService.login({ username, password })
      
      if (response.data) {
        const userData = response.data
        
        // Check if user is staff
        if (userData.roleName?.toUpperCase() !== 'STAFF' && userData.role?.toUpperCase() !== 'STAFF') {
          toast.error('Tài khoản này không phải là nhân viên')
          return
        }
        
        // Set tokens and user directly
        AuthService.setToken(userData.token || '')
        // Map user data to User type
        const roleName = userData.roleName || (typeof userData.role === 'string' ? userData.role : (typeof userData.role === 'object' && 'name' in userData.role ? (userData.role as any).name : null)) || 'STAFF'
        const normalizedRole = roleName.toUpperCase()
        let role: 'ADMIN' | 'CUSTOMER' | 'STAFF' = 'STAFF'
        if (normalizedRole === 'ADMIN') {
          role = 'ADMIN'
        } else if (normalizedRole === 'STAFF') {
          role = 'STAFF'
        }
        const user = {
          userID: userData.userID,
          username: userData.username,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          role,
          authProvider: userData.authProvider || 'LOCAL'
        }
        // Use setUser from store which will also call AuthService.setUser internally
        setUser(user as any)
        
        toast.success('Đăng nhập thành công!')
        router.push('/staff')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast.error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.')
    } finally {
      setLoading(false)
    }
  }

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập nhân viên</h1>
          <p className="text-gray-600">Chào mừng bạn quay trở lại</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập tên đăng nhập"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Đăng nhập với tư cách khách hàng
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Chỉ dành cho nhân viên cửa hàng</p>
        </div>
      </motion.div>
    </div>
  )
}

