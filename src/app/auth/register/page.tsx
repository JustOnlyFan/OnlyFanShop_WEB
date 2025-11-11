'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { AuthService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Wind, CheckCircle, XCircle, AlertCircle, ArrowLeft, Shield, Sparkles, Star } from 'lucide-react';

type ValidationErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  address?: string;
  otp?: string;
};

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    address: ''
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const router = useRouter();

  // Password validation rules
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ cái in hoa';
    }
    if (!/[a-z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ cái thường';
    }
    if (!/[0-9]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ số';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
    }
    return null;
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone number (Vietnamese format)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
  };

  // Check password strength
  const getPasswordStrength = (password: string): { strength: number; message: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

    const messages = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'];
    return { strength, message: messages[strength - 1] || '' };
  };

  // OTP Resend Timer
  useEffect(() => {
    if (otpResendTimer > 0) {
      const timer = setTimeout(() => {
        setOtpResendTimer(otpResendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpResendTimer]);

  // Enable scrolling on auth pages
  useEffect(() => {
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
    
    return () => {
      document.documentElement.style.overflowY = '';
      document.body.style.overflowY = '';
    };
  }, []);

  // Real-time validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    setFieldErrors(prev => ({
      ...prev,
      [name]: undefined
    }));

    // Real-time validation
    if (name === 'username') {
      if (value.includes(' ')) {
        setFieldErrors(prev => ({
          ...prev,
          username: 'Tên người dùng không được chứa khoảng trắng'
        }));
      } else if (value.length > 0 && value.length < 3) {
        setFieldErrors(prev => ({
          ...prev,
          username: 'Tên người dùng phải có ít nhất 3 ký tự'
        }));
      }
    }

    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setFieldErrors(prev => ({
          ...prev,
          email: 'Email không hợp lệ'
        }));
      }
    }

    if (name === 'password') {
      const passwordError = validatePassword(value);
      if (passwordError) {
        setFieldErrors(prev => ({
          ...prev,
          password: passwordError
        }));
      }
    }

    if (name === 'confirmPassword') {
      if (value && value !== formData.password) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: 'Mật khẩu xác nhận không khớp'
        }));
      }
    }

    if (name === 'phoneNumber') {
      if (value && !validatePhone(value)) {
        setFieldErrors(prev => ({
          ...prev,
          phoneNumber: 'Số điện thoại không hợp lệ (VD: 0912345678)'
        }));
      }
    }
  };

  // Check if username/email exists
  const checkAccountAvailability = async (): Promise<boolean> => {
    try {
      setCheckingAccount(true);
      const result = await AuthService.checkAccount(formData.username, formData.email);
      
      const newErrors: ValidationErrors = {};
      
      if (!result.usernameAvailable) {
        newErrors.username = 'Tên người dùng đã tồn tại';
      }
      
      if (!result.emailAvailable) {
        newErrors.email = 'Email đã tồn tại';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        setCheckingAccount(false);
        return false;
      }
      
      setCheckingAccount(false);
      return true;
    } catch (error: any) {
      setErrors({ email: 'Không thể kiểm tra tài khoản. Vui lòng thử lại.' });
      setCheckingAccount(false);
      return false;
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên người dùng';
    } else if (formData.username.includes(' ')) {
      newErrors.username = 'Tên người dùng không được chứa khoảng trắng';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate phone
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    // Check account availability
    const isAvailable = await checkAccountAvailability();
    if (!isAvailable) {
      return;
    }

    // Send OTP
    try {
      setLoading(true);
      await AuthService.sendOtp(formData.email);
      setOtpSent(true);
      setOtpResendTimer(60);
      setStep('otp');
    } catch (error: any) {
      setErrors({ email: error.message || 'Không thể gửi OTP. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setFieldErrors({ otp: 'Vui lòng nhập mã OTP 6 số' });
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setFieldErrors({});

      console.log('Verifying OTP for email:', formData.email);
      const response = await AuthService.verifyOtp(formData.email, otp);
      console.log('OTP verification response:', response);
      
      // Check if OTP verification was successful
      if (response.statusCode === 200 && response.message && response.message.includes('Xác thực thành công')) {
        console.log('OTP verified successfully, proceeding with registration...');
        // OTP verified, proceed with registration
        try {
          await handleRegister();
        } catch (registerError: any) {
          console.error('Registration error after OTP verification:', registerError);
          const errorMessage = registerError.response?.data?.message || registerError.message || 'Đăng ký thất bại. Vui lòng thử lại.';
          setErrors({ email: errorMessage, otp: 'Xác thực OTP thành công nhưng đăng ký thất bại. Vui lòng thử lại.' });
          setFieldErrors({ otp: errorMessage });
        }
      } else {
        console.error('OTP verification failed:', response.message);
        setFieldErrors({ otp: response.message || 'Mã OTP không hợp lệ' });
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setFieldErrors({ otp: error.message || 'Mã OTP không hợp lệ' });
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async () => {
    try {
      setLoading(true);
      setErrors({});
      setFieldErrors({});

      console.log('Registering user with data:', {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        hasPassword: !!formData.password
      });

      const response = await AuthService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });

      console.log('Registration response:', response);

      if (response.statusCode === 200) {
        console.log('Registration successful, redirecting to login...');
        // Redirect to login immediately after successful registration
        router.push('/auth/login?message=' + encodeURIComponent('Đăng ký thành công! Vui lòng đăng nhập.'));
      } else {
        console.error('Registration failed with status:', response.statusCode, response.message);
        setErrors({ email: response.message || 'Đăng ký thất bại. Vui lòng thử lại.' });
        throw new Error(response.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setErrors({ email: errorMessage });
      throw error; // Re-throw to be caught by handleVerifyOtp
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpResendTimer > 0) return;

    try {
      setLoading(true);
      setErrors({});
      await AuthService.sendOtp(formData.email);
      setOtpResendTimer(60);
      setFieldErrors({ otp: undefined });
    } catch (error: any) {
      setErrors({ otp: error.message || 'Không thể gửi lại OTP. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const passwordStrength = getPasswordStrength(formData.password);

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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-700 relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative z-10 bg-white/10 backdrop-blur-xl py-12 px-8 shadow-2xl sm:rounded-3xl sm:px-12 border border-white/20 text-center max-w-md mx-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-3"
          >
            Đăng ký thành công!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-white/90 mb-6"
          >
            Tài khoản của bạn đã được tạo thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <LoadingSpinner size="sm" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

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

      <div className="relative z-10 min-h-screen flex items-start py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto py-2">
          {/* OTP Step */}
          {step === 'otp' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="bg-white/10 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-white/20 max-w-md mx-auto"
            >
              <motion.button
                onClick={() => setStep('form')}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-white/80 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Quay lại
              </motion.button>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mb-6 shadow-lg"
                >
                  <Shield className="w-10 h-10 text-white" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold text-white mb-3"
                >
                  Xác thực Email
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-white/80"
                >
                  Chúng tôi đã gửi mã OTP đến email <strong className="text-white">{formData.email}</strong>
                </motion.p>
              </motion.div>

              <AnimatePresence>
                {(errors.otp || errors.email) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-200 px-4 py-3 rounded-xl mb-6 flex items-center shadow-lg"
                  >
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{errors.otp || errors.email}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label htmlFor="otp" className="block text-sm font-medium text-white/90 mb-3">
                    Mã OTP
                  </label>
                  <motion.input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setOtp(value);
                      setFieldErrors({ otp: undefined });
                    }}
                    whileFocus={{ scale: 1.02 }}
                    className={`appearance-none block w-full px-6 py-4 border-2 rounded-xl placeholder-white/40 focus:outline-none focus:ring-4 sm:text-lg font-semibold text-center tracking-widest transition-all duration-300 bg-white/10 backdrop-blur-sm text-white ${
                      fieldErrors.otp
                        ? 'border-red-400/50 focus:ring-red-500/50 focus:border-red-400'
                        : 'border-white/30 focus:ring-blue-500/50 focus:border-blue-400'
                    }`}
                    placeholder="000000"
                  />
                  {fieldErrors.otp && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-300 flex items-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {fieldErrors.otp}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden"
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
                      {loading ? <LoadingSpinner size="sm" /> : 'Xác thực OTP'}
                    </span>
                  </motion.button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center"
                >
                  <motion.button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpResendTimer > 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm text-white/80 hover:text-white disabled:text-white/40 disabled:cursor-not-allowed transition-colors"
                  >
                    {otpResendTimer > 0
                      ? `Gửi lại OTP sau ${otpResendTimer}s`
                      : 'Gửi lại mã OTP'}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Registration Form Step */}
          {step === 'form' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12"
            >
              {/* Left Column - Header + Welcome Content */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col justify-start lg:sticky lg:top-8 lg:h-fit"
              >
                <div className="text-center lg:text-left mb-6">
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
                    className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-3"
                  >
                    Đăng ký tài khoản
                  </motion.h2>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-2 text-base lg:text-lg text-white/80"
                  >
                    Tạo tài khoản mới tại OnlyFan Shop
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 lg:p-8 border border-white/20 shadow-2xl hidden lg:block"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                      Chào mừng đến với OnlyFan Shop
                    </h3>
                    
                    <p className="text-white/80 leading-relaxed text-sm lg:text-base">
                      Tham gia cộng đồng của chúng tôi và khám phá thế giới quạt với đa dạng sản phẩm chất lượng cao.
                    </p>

                    <div className="space-y-3 mt-6">
                      {[
                        { icon: CheckCircle, title: 'Sản phẩm đa dạng', desc: 'Hàng ngàn sản phẩm quạt chất lượng từ các thương hiệu uy tín', color: 'from-blue-500 to-cyan-500' },
                        { icon: CheckCircle, title: 'Giao hàng nhanh chóng', desc: 'Dịch vụ giao hàng tận nơi, đảm bảo chất lượng', color: 'from-cyan-500 to-blue-500' },
                        { icon: CheckCircle, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn', color: 'from-blue-600 to-cyan-600' },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          whileHover={{ x: 5, scale: 1.02 }}
                          className="flex items-start space-x-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                        >
                          <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                            <p className="text-xs text-white/70">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Right Column - Registration Form */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="bg-white/10 backdrop-blur-xl py-6 px-5 shadow-2xl sm:rounded-3xl sm:px-6 lg:px-8 border border-white/20"
                >
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <AnimatePresence>
                      {errors.email && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="bg-red-500/20 backdrop-blur-sm border border-red-400/50 text-red-200 px-4 py-3 rounded-xl flex items-center shadow-lg"
                        >
                          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                          {errors.email}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Form Fields */}
                    {[
                      { name: 'username', label: 'Tên người dùng', icon: User, type: 'text', placeholder: 'Nhập tên người dùng' },
                      { name: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'Nhập email của bạn' },
                      { name: 'phoneNumber', label: 'Số điện thoại', icon: Phone, type: 'tel', placeholder: 'VD: 0912345678' },
                    ].map((field, index) => (
                      <motion.div
                        key={field.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <label htmlFor={field.name} className="block text-sm font-medium text-white/90 mb-2">
                          {field.label} <span className="text-red-400">*</span>
                        </label>
                        <motion.div
                          className="relative"
                          whileFocus={{ scale: 1.01 }}
                        >
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <field.icon className={`h-5 w-5 transition-colors ${
                              focusedField === field.name ? 'text-blue-400' : 'text-white/50'
                            }`} />
                          </div>
                          <motion.input
                            id={field.name}
                            name={field.name}
                            type={field.type}
                            required
                            onFocus={() => setFocusedField(field.name)}
                            onBlur={() => setFocusedField(null)}
                            whileFocus={{ scale: 1.01 }}
                            className={`appearance-none block w-full pl-12 pr-4 py-3 border-2 rounded-xl placeholder-white/40 focus:outline-none focus:ring-4 sm:text-sm transition-all duration-300 bg-white/10 backdrop-blur-sm text-white ${
                              fieldErrors[field.name as keyof ValidationErrors]
                                ? 'border-red-400/50 focus:ring-red-500/50 focus:border-red-400'
                                : focusedField === field.name
                                ? 'border-blue-400/50 focus:ring-blue-500/50 focus:border-blue-400'
                                : 'border-white/20 focus:ring-blue-500/50 focus:border-blue-400'
                            }`}
                            placeholder={field.placeholder}
                            value={formData[field.name as keyof typeof formData]}
                            onChange={handleInputChange}
                          />
                        </motion.div>
                        {fieldErrors[field.name as keyof ValidationErrors] && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-300 flex items-center"
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {fieldErrors[field.name as keyof ValidationErrors]}
                          </motion.p>
                        )}
                      </motion.div>
                    ))}

                    {/* Password Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.1 }}
                    >
                      <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                        Mật khẩu <span className="text-red-400">*</span>
                      </label>
                      <motion.div
                        className="relative"
                        whileFocus={{ scale: 1.01 }}
                      >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className={`h-5 w-5 transition-colors ${
                            focusedField === 'password' ? 'text-blue-400' : 'text-white/50'
                          }`} />
                        </div>
                        <motion.input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          whileFocus={{ scale: 1.01 }}
                          className={`appearance-none block w-full pl-12 pr-12 py-3 border-2 rounded-xl placeholder-white/40 focus:outline-none focus:ring-4 sm:text-sm transition-all duration-300 bg-white/10 backdrop-blur-sm text-white ${
                            fieldErrors.password
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
                          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-white/5 rounded-r-xl transition-colors duration-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-white/60" />
                          ) : (
                            <Eye className="h-5 w-5 text-white/60" />
                          )}
                        </motion.button>
                      </motion.div>
                      {fieldErrors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-300 flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {fieldErrors.password}
                        </motion.p>
                      )}
                      {formData.password && !fieldErrors.password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-white/70">Độ mạnh:</span>
                            <span className={`text-xs font-semibold ${
                              passwordStrength.strength >= 4 ? 'text-green-400' :
                              passwordStrength.strength >= 3 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {passwordStrength.message}
                            </span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden mb-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                              className={`h-1.5 rounded-full ${
                                passwordStrength.strength >= 4 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                                passwordStrength.strength >= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                'bg-gradient-to-r from-red-400 to-red-500'
                              }`}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-xs text-white/70">
                            {[
                              { test: formData.password.length >= 8, text: '8+ ký tự' },
                              { test: /[A-Z]/.test(formData.password), text: 'Chữ hoa' },
                              { test: /[a-z]/.test(formData.password), text: 'Chữ thường' },
                              { test: /[0-9]/.test(formData.password), text: 'Số' },
                              { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password), text: 'Ký tự đặc biệt', colSpan: true },
                            ].map((item, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`flex items-center ${item.colSpan ? 'col-span-2' : ''} ${item.test ? 'text-green-400' : ''}`}
                              >
                                {item.test ? (
                                  <CheckCircle className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                )}
                                <span className="text-xs">{item.text}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Confirm Password Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                    >
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
                        Xác nhận mật khẩu <span className="text-red-400">*</span>
                      </label>
                      <motion.div
                        className="relative"
                        whileFocus={{ scale: 1.01 }}
                      >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className={`h-5 w-5 transition-colors ${
                            focusedField === 'confirmPassword' ? 'text-blue-400' : 'text-white/50'
                          }`} />
                        </div>
                        <motion.input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          onFocus={() => setFocusedField('confirmPassword')}
                          onBlur={() => setFocusedField(null)}
                          whileFocus={{ scale: 1.01 }}
                          className={`appearance-none block w-full pl-12 pr-12 py-3 border-2 rounded-xl placeholder-white/40 focus:outline-none focus:ring-4 sm:text-sm transition-all duration-300 bg-white/10 backdrop-blur-sm text-white ${
                            fieldErrors.confirmPassword
                              ? 'border-red-400/50 focus:ring-red-500/50 focus:border-red-400'
                              : focusedField === 'confirmPassword'
                              ? 'border-blue-400/50 focus:ring-blue-500/50 focus:border-blue-400'
                              : 'border-white/20 focus:ring-blue-500/50 focus:border-blue-400'
                          }`}
                          placeholder="Nhập lại mật khẩu"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                        />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-white/5 rounded-r-xl transition-colors duration-200"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-white/60" />
                          ) : (
                            <Eye className="h-5 w-5 text-white/60" />
                          )}
                        </motion.button>
                      </motion.div>
                      {fieldErrors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 text-sm text-red-300 flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {fieldErrors.confirmPassword}
                        </motion.p>
                      )}
                      {formData.confirmPassword && !fieldErrors.confirmPassword && formData.password === formData.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-2 text-sm text-green-400 flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mật khẩu khớp
                        </motion.p>
                      )}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.3 }}
                      className="pt-2"
                    >
                      <motion.button
                        type="submit"
                        disabled={loading || checkingAccount}
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
                          {loading || checkingAccount ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <Wind className="w-5 h-5 mr-2" />
                              {checkingAccount ? 'Đang kiểm tra...' : 'Tiếp tục với OTP'}
                            </>
                          )}
                        </span>
                      </motion.button>
                    </motion.div>
                  </form>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="mt-5 text-center"
                  >
                    <p className="text-sm text-white/70">
                      Đã có tài khoản?{' '}
                      <Link href="/auth/login" className="font-semibold text-white hover:text-blue-300 transition-colors duration-200 underline decoration-2 underline-offset-2">
                        Đăng nhập ngay
                      </Link>
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
