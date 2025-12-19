'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Lock, Mail, Wind, CheckCircle, AlertCircle, UserPlus, LogIn, KeyRound } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/services/authService';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type AuthMode = 'login' | 'register';
type RegisterStep = 'form' | 'otp';

export function AuthContainer() {
  const pathname = usePathname();
  const initialMode = pathname?.includes('register') ? 'register' : 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  
  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register state
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState<RegisterStep>('form');
  const [otp, setOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  
  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
      router.replace('/auth/login', { scroll: false });
      const timer = setTimeout(() => setSuccessMessage(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // Auto clear success message after 1.5s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto clear error message after 3s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const switchMode = (newMode: AuthMode) => {
    if (mode === newMode || isAnimating) return;
    setIsAnimating(true);
    setError('');
    setSuccessMessage('');
    setRegisterStep('form');
    setOtp('');
    
    // Set slide direction - login->register: right, register->login: left
    setSlideDirection(newMode === 'register' ? 'right' : 'left');
    
    // Update URL without full page reload
    const newUrl = newMode === 'login' ? '/auth/login' : '/auth/register';
    window.history.pushState({}, '', newUrl);
    
    setTimeout(() => {
      setMode(newMode);
      setIsAnimating(false);
    }, 300);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!loginData.email.trim()) {
      setError('Vui lòng nhập email');
      setLoading(false);
      return;
    }
    if (!loginData.password) {
      setError('Vui lòng nhập mật khẩu');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Check if email exists and get role
      const emailCheck = await AuthService.checkEmailRole(loginData.email.trim().toLowerCase());
      
      if (!emailCheck.exists) {
        setError('Email hoặc mật khẩu không chính xác. Vui lòng nhập lại.');
        setLoading(false);
        return;
      }

      // Step 2: Check if role is correct for this portal (customer portal)
      const role = emailCheck.role?.toLowerCase();
      if (role === 'admin') {
        setError('Bạn đang dùng sai trang web. Vui lòng sử dụng trang Admin để đăng nhập.');
        setLoading(false);
        return;
      }
      if (role === 'staff') {
        setError('Bạn đang dùng sai trang web. Vui lòng sử dụng trang Staff để đăng nhập.');
        setLoading(false);
        return;
      }

      // Step 3: Try to login
      const response = await AuthService.login({
        email: loginData.email.trim().toLowerCase(),
        password: loginData.password
      });

      if (response.data) {
        let roleName = 'CUSTOMER';
        if (response.data.roleName) {
          roleName = response.data.roleName;
        } else if (response.data.role) {
          if (typeof response.data.role === 'string') {
            roleName = response.data.role;
          } else if (typeof response.data.role === 'object' && 'name' in response.data.role) {
            roleName = (response.data.role as any).name;
          }
        }
        const normalizedRole = roleName.toUpperCase();
        
        if (normalizedRole === 'ADMIN' || normalizedRole === 'STAFF') {
          AuthService.clearAuth();
          setError('Tài khoản không có quyền truy cập trang này.');
          setLoading(false);
          return;
        }
        
        const userData = {
          userID: response.data.userID,
          username: response.data.username,
          fullName: response.data.fullName || response.data.username,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          role: 'CUSTOMER' as const,
          authProvider: response.data.authProvider || 'LOCAL',
          token: response.data.token
        };
        setUser(userData);
        router.push('/');
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error: any) {
      // If we reach here, email exists but password is wrong
      setError('Mật khẩu không chính xác. Vui lòng nhập lại.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Validate form and send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!registerData.fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      setLoading(false);
      return;
    }
    if (!registerData.email.trim()) {
      setError('Vui lòng nhập email');
      setLoading(false);
      return;
    }
    if (!registerData.password) {
      setError('Vui lòng nhập mật khẩu');
      setLoading(false);
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      // Check if email already exists
      const checkResult = await AuthService.checkAccount('', registerData.email.trim().toLowerCase());
      if (!checkResult.emailAvailable) {
        setError('Email đã được sử dụng');
        setLoading(false);
        return;
      }

      // Send OTP
      await AuthService.sendOtp(registerData.email.trim().toLowerCase());
      setRegisterStep('otp');
      setOtpCountdown(120); // 2 minutes countdown
      setSuccessMessage('Mã OTP đã được gửi đến email của bạn');
    } catch (error: any) {
      setError(error.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setLoading(true);
    setError('');

    try {
      await AuthService.sendOtp(registerData.email.trim().toLowerCase());
      setOtpCountdown(120);
      setSuccessMessage('Mã OTP mới đã được gửi');
    } catch (error: any) {
      setError(error.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and register
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp.trim() || otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 số');
      setLoading(false);
      return;
    }

    try {
      // Verify OTP
      await AuthService.verifyOtp(registerData.email.trim().toLowerCase(), otp);

      // OTP verified, now register
      const response = await AuthService.register({
        username: registerData.fullName.trim(),
        email: registerData.email.trim().toLowerCase(),
        password: registerData.password,
        confirmPassword: registerData.confirmPassword
      });

      if (response.statusCode === 200) {
        setSuccessMessage('Đăng ký thành công! Vui lòng đăng nhập.');
        setMode('login');
        setRegisterStep('form');
        setOtp('');
        setLoginData({ email: registerData.email.trim().toLowerCase(), password: '' });
        setRegisterData({ fullName: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(response.message || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      setError(error.message || 'Xác thực OTP thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-600 p-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ x: [0, 100, 0], y: [0, 100, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{ x: [0, -100, 0], y: [0, -100, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20"
      >
        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Left Panel - Info (Login) / Form (Register) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode === 'login' ? 'info-left' : 'form-left'}
              initial={{ x: slideDirection === 'right' ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: slideDirection === 'right' ? 100 : -100, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full md:w-1/2 p-8 flex flex-col justify-center"
            >
              {mode === 'login' ? (
                <InfoPanel
                  title="Đăng nhập"
                  subtitle="Chào mừng bạn quay trở lại"
                  description="OnlyFan Shop - Cửa hàng quạt điện cao cấp với đa dạng sản phẩm từ các thương hiệu uy tín."
                  buttonText="Chưa có tài khoản? Đăng ký"
                  onButtonClick={() => switchMode('register')}
                  icon={<LogIn className="w-12 h-12" />}
                />
              ) : registerStep === 'form' ? (
                <FormPanel
                  mode="register"
                  data={registerData}
                  setData={setRegisterData}
                  onSubmit={handleSendOtp}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                  showPassword={showRegisterPassword}
                  setShowPassword={setShowRegisterPassword}
                  showConfirmPassword={showConfirmPassword}
                  setShowConfirmPassword={setShowConfirmPassword}
                />
              ) : (
                <OtpPanel
                  email={registerData.email}
                  otp={otp}
                  setOtp={setOtp}
                  onSubmit={handleVerifyAndRegister}
                  onResend={handleResendOtp}
                  onBack={() => { setRegisterStep('form'); setOtp(''); setError(''); }}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                  countdown={otpCountdown}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Right Panel - Form (Login) / Info (Register) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode === 'login' ? 'form-right' : 'info-right'}
              initial={{ x: slideDirection === 'right' ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: slideDirection === 'right' ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-white/5"
            >
              {mode === 'login' ? (
                <FormPanel
                  mode="login"
                  data={loginData}
                  setData={setLoginData}
                  onSubmit={handleLogin}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                  showPassword={showLoginPassword}
                  setShowPassword={setShowLoginPassword}
                />
              ) : (
                <InfoPanel
                  title={registerStep === 'form' ? "Đăng ký" : "Xác thực OTP"}
                  subtitle={registerStep === 'form' ? "Tạo tài khoản mới" : "Kiểm tra email của bạn"}
                  description={registerStep === 'form' 
                    ? "Đăng ký để trải nghiệm mua sắm tuyệt vời với nhiều ưu đãi hấp dẫn."
                    : "Chúng tôi đã gửi mã xác thực 6 số đến email của bạn. Vui lòng nhập mã để hoàn tất đăng ký."}
                  buttonText="Đã có tài khoản? Đăng nhập"
                  onButtonClick={() => switchMode('login')}
                  icon={registerStep === 'form' ? <UserPlus className="w-12 h-12" /> : <KeyRound className="w-12 h-12" />}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Info Panel Component
function InfoPanel({ title, subtitle, description, buttonText, onButtonClick, icon }: {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center text-white">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="inline-flex w-20 h-20 bg-primary-500 rounded-2xl items-center justify-center mb-6 shadow-xl"
      >
        {icon}
      </motion.div>
      
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-xl text-blue-200 mb-4">{subtitle}</p>
      <p className="text-white/70 mb-8 leading-relaxed">{description}</p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 text-white/80">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span>Sản phẩm chính hãng 100%</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-white/80">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span>Giao hàng nhanh toàn quốc</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-white/80">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span>Bảo hành chính hãng</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onButtonClick}
        className="mt-8 px-8 py-3 border-2 border-white/30 rounded-xl text-white font-semibold hover:bg-white/10 transition-all"
      >
        {buttonText}
      </motion.button>
    </div>
  );
}

// OTP Panel Component
function OtpPanel({ email, otp, setOtp, onSubmit, onResend, onBack, loading, error, successMessage, countdown }: {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
  loading: boolean;
  error: string;
  successMessage: string;
  countdown: number;
}) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <KeyRound className="w-10 h-10 text-white mx-auto mb-2" />
        <h3 className="text-xl font-bold text-white">Nhập mã OTP</h3>
        <p className="text-white/70 text-sm mt-2">
          Mã xác thực đã được gửi đến<br />
          <span className="text-blue-300 font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-500/20 border border-green-400/50 text-green-200 px-4 py-3 rounded-xl overflow-hidden relative"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">{successMessage}</span>
              </div>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 1.5, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-green-400/50"
              />
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-xl overflow-hidden relative"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-red-400/50"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* OTP Input */}
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Nhập mã OTP 6 số"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
            }}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-2xl tracking-widest"
            disabled={loading}
            maxLength={6}
            autoFocus
          />
        </div>

        {/* Countdown & Resend */}
        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-white/60 text-sm">
              Gửi lại mã sau <span className="text-blue-300 font-medium">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={loading}
              className="text-blue-300 hover:text-blue-200 text-sm font-medium"
            >
              Gửi lại mã OTP
            </button>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || otp.length !== 6}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Xác nhận & Đăng ký'}
        </motion.button>

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full py-2 text-white/70 hover:text-white text-sm"
        >
          ← Quay lại chỉnh sửa thông tin
        </button>
      </form>
    </div>
  );
}

// Form Panel Component
function FormPanel({ mode, data, setData, onSubmit, loading, error, successMessage, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword }: {
  mode: 'login' | 'register';
  data: any;
  setData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  successMessage: string;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword?: boolean;
  setShowConfirmPassword?: (show: boolean) => void;
}) {
  const isLogin = mode === 'login';

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-6">
        <Wind className="w-10 h-10 text-white mx-auto mb-2" />
        <h3 className="text-xl font-bold text-white">
          {isLogin ? 'Nhập thông tin đăng nhập' : 'Điền thông tin đăng ký'}
        </h3>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-500/20 border border-green-400/50 text-green-200 px-4 py-3 rounded-xl overflow-hidden relative"
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">{successMessage}</span>
              </div>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 1.5, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-green-400/50"
              />
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-xl overflow-hidden relative"
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-1 bg-red-400/50"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Name (Register only) */}
        {!isLogin && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Họ và tên"
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
          </div>
        )}

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Mật khẩu"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Confirm Password (Register only) */}
        {!isLogin && (
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Xác nhận mật khẩu"
              value={data.confirmPassword}
              onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
              className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword?.(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        )}



        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            isLogin ? 'Đăng nhập' : 'Đăng ký'
          )}
        </motion.button>
      </form>
    </div>
  );
}
