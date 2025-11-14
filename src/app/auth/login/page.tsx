'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Eye, EyeOff, User, Lock, Wind, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  // Check for success message from query params
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
      // Clear message from URL
      router.replace('/auth/login', { scroll: false });
      // Auto-hide message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // Enable scrolling on auth pages
  useEffect(() => {
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
    
    return () => {
      document.documentElement.style.overflowY = '';
      document.body.style.overflowY = '';
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // Validate input
    if (!formData.username || !formData.username.trim()) {
      setError('Vui lòng nhập tên người dùng');
      setLoading(false);
      return;
    }
    
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.login({
        username: formData.username.trim(),
        password: formData.password
      });

      if (response.data) {
        // Map UserDTO to User type
        // Backend returns roleName as string, not role object
        const roleName = response.data.roleName || response.data.role?.name || 'CUSTOMER';
        const normalizedRole = roleName.toUpperCase();
        let role: 'ADMIN' | 'CUSTOMER' | 'STAFF' = 'CUSTOMER';
        
        if (normalizedRole === 'ADMIN') {
          role = 'ADMIN';
        } else if (normalizedRole === 'STAFF') {
          role = 'STAFF';
        } else {
          role = 'CUSTOMER';
        }
        
        const userData = {
          userID: response.data.userID,
          username: response.data.username,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          address: response.data.address,
          role: role,
          authProvider: response.data.authProvider || 'LOCAL',
          token: response.data.token
        };
        setUser(userData);
        
        // Redirect based on role
        if (role === 'ADMIN') {
          router.push('/admin');
        } else if (role === 'STAFF') {
          router.push('/staff');
        } else {
          router.push('/');
        }
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Implement Google OAuth
      console.log('Google login clicked');
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-700 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-35"
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating Icons */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          >
            <Wind className="w-12 h-12" />
          </motion.div>
        ))}

        {/* Sparkles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-start justify-center pt-8 sm:pt-12 lg:pt-16 px-4 sm:py-6 sm:px-6 lg:px-8 pb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white/10 backdrop-blur-xl py-6 px-6 shadow-2xl sm:rounded-3xl sm:px-8 border border-white/20"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="inline-flex w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-400 rounded-2xl items-center justify-center mb-4 shadow-2xl"
              >
                <Wind className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-2"
              >
                Đăng nhập
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm lg:text-base text-white/80"
              >
                Chào mừng bạn quay trở lại OnlyFan Shop
              </motion.p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-green-500/20 backdrop-blur-sm border border-green-400/50 text-green-200 px-4 py-3 rounded-xl flex items-center shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-200 px-4 py-3 rounded-xl flex items-center shadow-lg"
                  >
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-1.5">
                  Tên người dùng
                </label>
                <motion.div
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-4 w-4 transition-colors ${
                      focusedField === 'username' ? 'text-blue-400' : 'text-white/50'
                    }`} />
                  </div>
                  <motion.input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    whileFocus={{ scale: 1.01 }}
                    className={`appearance-none block w-full pl-10 pr-3 py-2.5 border-2 rounded-xl placeholder-white/40 focus:outline-none focus:ring-4 text-sm transition-all duration-300 bg-white/10 backdrop-blur-sm text-white ${
                      error && error.includes('tên người dùng')
                        ? 'border-red-400/50 focus:ring-red-500/50 focus:border-red-400'
                        : focusedField === 'username'
                        ? 'border-blue-400/50 focus:ring-blue-500/50 focus:border-blue-400'
                        : 'border-white/20 focus:ring-blue-500/50 focus:border-blue-400'
                    }`}
                    placeholder="Nhập tên người dùng"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </motion.div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1.5">
                  Mật khẩu
                </label>
                <motion.div
                  className="relative"
                  whileFocus={{ scale: 1.01 }}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-4 w-4 transition-colors ${
                      focusedField === 'password' ? 'text-blue-400' : 'text-white/50'
                    }`} />
                  </div>
                  <motion.input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    whileFocus={{ scale: 1.01 }}
                    className={`appearance-none block w-full pl-10 pr-10 py-2.5 border-2 rounded-xl placeholder-white/40 focus:outline-none focus:ring-4 text-sm transition-all duration-300 bg-white/10 backdrop-blur-sm text-white ${
                      error && error.includes('mật khẩu')
                        ? 'border-red-400/50 focus:ring-red-500/50 focus:border-red-400'
                        : focusedField === 'password'
                        ? 'border-blue-400/50 focus:ring-blue-500/50 focus:border-blue-400'
                        : 'border-white/20 focus:ring-blue-500/50 focus:border-blue-400'
                    }`}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-white/5 rounded-r-xl transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-white/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/60" />
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10 backdrop-blur-sm"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-white/90">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-blue-300 hover:text-blue-200 transition-colors duration-200">
                    Quên mật khẩu?
                  </Link>
                </div>
              </motion.div>

              {/* Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex justify-center py-3.5 px-6 border border-transparent rounded-xl shadow-2xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                  <span className="relative z-10 flex items-center">
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Wind className="w-5 h-5 mr-2" />
                        Đăng nhập
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-6"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/70">Hoặc tiếp tục với</span>
                </div>
              </div>

              {/* Google Login Button */}
              <div className="mt-6">
                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex justify-center py-3 px-4 border-2 border-white/20 rounded-xl shadow-lg bg-white/10 backdrop-blur-sm text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50 transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Đăng nhập với Google
                </motion.button>
              </div>
            </motion.div>

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-white/70">
                Chưa có tài khoản?{' '}
                <Link href="/auth/register" className="font-semibold text-white hover:text-blue-300 transition-colors duration-200 underline decoration-2 underline-offset-2">
                  Đăng ký ngay
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}