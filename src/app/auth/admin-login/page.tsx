'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { AuthService } from '@/services/authService'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, Shield, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const { setUser, isAuthenticated, hasHydrated, user } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!hasHydrated) return

    // If already logged in as admin, redirect to admin dashboard
    if (isAuthenticated && user?.role === 'ADMIN') {
      router.push('/admin')
      return
    }
  }, [hasHydrated, isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      setLoading(true)
      console.log('=== ADMIN LOGIN START ===')
      console.log('Email:', email.trim().toLowerCase())
      
      const response = await AuthService.login({
        email: email.trim().toLowerCase(),
        password,
      })

      console.log('Login response:', response)

      if (response.data) {
        const userData = response.data
        console.log('User data:', userData)

        // Get role name
        const roleName =
          userData.roleName ||
          (typeof userData.role === 'string'
            ? userData.role
            : typeof userData.role === 'object' && 'name' in userData.role
              ? (userData.role as any).name
              : null) ||
          ''
        const normalizedRole = roleName.toUpperCase()
        console.log('Role name:', roleName, '-> Normalized:', normalizedRole)

        // Only allow ADMIN to login here
        if (normalizedRole !== 'ADMIN') {
          AuthService.clearAuth()
          toast.error('Tài khoản không có quyền truy cập trang Admin.')
          return
        }

        // Set tokens and user directly
        AuthService.setToken(userData.token || '')
        const user = {
          userID: userData.userID,
          username: userData.username,
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          role: 'ADMIN' as const,
          authProvider: userData.authProvider || 'LOCAL',
        }
        console.log('Setting user:', user)
        setUser(user as any)

        toast.success('Đăng nhập thành công!')
        console.log('Redirecting to /admin...')
        router.push('/admin')
      } else {
        console.log('No data in response')
        toast.error('Đăng nhập thất bại. Không có dữ liệu trả về.')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      console.error('Error message:', error.message)
      toast.error(error.message || 'Email hoặc mật khẩu không chính xác.')
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-purple-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-purple-200">Đăng nhập quản trị viên</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/50" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  placeholder="Nhập email admin"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/50" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white"
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
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
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-purple-200">
          <p>Chỉ dành cho quản trị viên hệ thống</p>
        </div>
      </motion.div>
    </div>
  )
}
