'use client'

import { tokenManager } from '@/configs/instance'
import { authStorage } from '@/constant/authStorage'
import { validateEmail, validatePassword } from '@/constant/validate'
import { signinApi } from '@/services/auth'
import { SignInFormData, ValidationErrors } from '@/types/form'
import {
  AlertCircle,
  CheckCircle,
  Chrome,
  Eye,
  EyeOff,
  Github,
  Loader2,
  Lock,
  Mail,
  GraduationCap,
  BookOpen,
  Headphones,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import MysticBackground from '../MysticBackground/MysticBackground'

const PLATFORM_NAME = 'E_LEANING'

export default function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isFormTouched, setIsFormTouched] = useState(false)

  useEffect(() => {
    if (tokenManager.isAuthenticated()) {
      const returnUrl = searchParams.get('returnUrl') || '/'
      router.push(returnUrl)
      return
    }

    const savedEmail = authStorage.getRememberedEmail()
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail, rememberMe: true }))
    }

    const message = searchParams.get('message')
    if (message === 'login_required') {
      toast.error('Bạn cần đăng nhập để truy cập trang này')
    }
  }, [router, searchParams])

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateField = (field: keyof SignInFormData, value: string) => {
    let error: string | null = null

    switch (field) {
      case 'email':
        error = validateEmail(value)
        break
      case 'password':
        error = validatePassword(value)
        break
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
      general: undefined,
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const fieldValue = type === 'checkbox' ? checked : value

    setFormData((prev) => ({ ...prev, [name]: fieldValue }))
    setIsFormTouched(true)

    if (isFormTouched && type !== 'checkbox') {
      validateField(name as keyof SignInFormData, value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await signinApi({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      })
      if (response.status === 200) {
        tokenManager.setTokens(response.metadata!.tokens)
        tokenManager.setUser(response.metadata!.user)

        if (formData.rememberMe) {
          authStorage.setRememberedEmail(formData.email)
        } else {
          authStorage.removeRememberedEmail()
        }

        authStorage.addRecentActivity({
          type: 'login',
          timestamp: Date.now(),
          ip: 'unknown',
        })

        toast.success(response!.message || 'Đăng nhập thành công!')

        const returnUrl = searchParams.get('returnUrl') || '/'
        router.push(returnUrl)
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại')
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error)

      const errorMessage =
        error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      const errorCode = error.response?.data?.error?.code

      switch (errorCode) {
        case 'INVALID_CREDENTIALS':
          setErrors({ general: 'Email hoặc mật khẩu không đúng' })
          break
        case 'EMAIL_NOT_VERIFIED':
          setErrors({
            general: 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.',
          })
          break
        case 'ACCOUNT_BANNED':
          setErrors({
            general:
              'Tài khoản đã bị khóa. Liên hệ hỗ trợ để biết thêm chi tiết.',
          })
          break
        case 'RATE_LIMIT_EXCEEDED':
          setErrors({
            general: 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau.',
          })
          break
        default:
          setErrors({ general: errorMessage })
          toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true)

      const returnUrl = searchParams.get('returnUrl') || '/'
      const oauthUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/api/auth/${provider}?returnUrl=${encodeURIComponent(returnUrl)}`

      window.location.href = oauthUrl
    } catch (error) {
      console.error(`❌ ${provider} login error:`, error)
      toast.error('Không thể đăng nhập với ' + provider)
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-950 via-slate-950 to-emerald-950">
      <MysticBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border border-teal-400/20 bg-gradient-to-br from-sky-500 via-teal-600 to-emerald-600 shadow-2xl shadow-sky-500/30 backdrop-blur-sm">
              <GraduationCap className="animate-mystic-bounce h-12 w-12 text-teal-50" />
              <div className="animate-mystic-pulse absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/20 to-teal-600/20"></div>
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 bg-clip-text text-4xl font-bold text-transparent">
              Đăng nhập vào {PLATFORM_NAME}
            </h1>
            <p className="text-base font-light text-teal-100/80">
              Học tiếng Anh trực tuyến thông minh – cá nhân hoá theo mục tiêu của bạn
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <BookOpen className="animate-mystic-spin h-4 w-4 text-sky-300" />
              <Headphones className="animate-mystic-pulse h-3 w-3 text-teal-300" />
              <Sparkles className="animate-mystic-spin-reverse h-4 w-4 text-emerald-300" />
            </div>
          </div>

          {/* Card */}
          <div className="relative rounded-3xl border border-teal-500/20 bg-gradient-to-br from-slate-900/70 via-sky-950/40 to-black/50 p-8 shadow-2xl shadow-emerald-900/20 backdrop-blur-xl">
            <div className="animate-mystic-glow absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-sky-500/10 via-teal-500/10 to-emerald-500/10 blur-sm" />

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="animate-mystic-fade-in flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 backdrop-blur-sm">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-red-300">
                      Đăng nhập thất bại
                    </p>
                    <p className="mt-1 text-sm text-red-200">
                      {errors.general}
                    </p>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-teal-100"
                >
                  Email <span className="text-teal-300">*</span>
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-teal-300/70 transition-all duration-500 group-focus-within:text-teal-200" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full rounded-2xl border py-4 pr-4 pl-12 backdrop-blur-sm transition-all duration-500 focus:shadow-lg ${
                      errors.email
                        ? 'border-red-500/50 bg-red-950/20 text-red-200 shadow-red-500/20 placeholder:text-red-300/60'
                        : formData.email && !errors.email
                          ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-100 shadow-emerald-500/20 placeholder:text-emerald-200/60'
                          : 'border-teal-500/30 bg-sky-950/20 text-teal-100 placeholder:text-teal-300/50 focus:border-teal-400/60 focus:bg-sky-900/30 focus:shadow-sky-500/20'
                    }`}
                    placeholder="you@example.com"
                  />
                  {formData.email && !errors.email && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <CheckCircle className="animate-mystic-pulse h-5 w-5 text-emerald-400" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="animate-mystic-fade-in flex items-center gap-2 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-teal-100"
                >
                  Mật khẩu <span className="text-teal-300">*</span>
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-teal-300/70 transition-all duration-500 group-focus-within:text-teal-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full rounded-2xl border py-4 pr-12 pl-12 backdrop-blur-sm transition-all duration-500 focus:shadow-lg ${
                      errors.password
                        ? 'border-red-500/50 bg-red-950/20 text-red-200 shadow-red-500/20 placeholder:text-red-300/60'
                        : formData.password && !errors.password
                          ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-100 shadow-emerald-500/20 placeholder:text-emerald-200/60'
                          : 'border-teal-500/30 bg-sky-950/20 text-teal-100 placeholder:text-teal-300/50 focus:border-teal-400/60 focus:bg-sky-900/30 focus:shadow-sky-500/20'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-teal-300/70 transition-all duration-300 hover:text-teal-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="animate-mystic-fade-in flex items-center gap-2 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-teal-500/30 bg-sky-900/50 text-teal-500 transition-all duration-300 focus:ring-teal-500/30 focus:ring-offset-0"
                  />
                  <span className="ml-3 text-sm text-teal-100/80">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-sky-300 transition-all duration-300 hover:text-sky-200"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 p-[1px] transition-all duration-700 hover:shadow-2xl hover:shadow-sky-500/30 focus:shadow-2xl focus:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="relative rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-8 py-4 transition-all duration-500 group-hover:from-sky-500 group-hover:via-teal-500 group-hover:to-emerald-500">
                  <div className="flex items-center justify-center gap-3 text-lg font-semibold text-white">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Đang đăng nhập...
                      </>
                    ) : (
                      <>
                        <GraduationCap className="group-hover:animate-mystic-bounce h-6 w-6 transition-all duration-300" />
                        Đăng nhập
                      </>
                    )}
                  </div>
                  <div className="group-hover:animate-mystic-shimmer absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400/0 via-sky-400/20 to-sky-400/0"></div>
                </div>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-transparent px-6 text-teal-200/70">
                    Hoặc đăng nhập với
                  </span>
                </div>
              </div>

              {/* Social */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="group flex items-center justify-center gap-3 rounded-2xl border border-teal-500/20 bg-sky-950/30 px-6 py-4 text-sm font-medium text-teal-100 backdrop-blur-sm transition-all duration-500 hover:border-teal-400/40 hover:bg-sky-900/40 hover:text-teal-50 focus:bg-sky-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Chrome className="h-5 w-5 transition-all duration-300 group-hover:opacity-90" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  className="group flex items-center justify-center gap-3 rounded-2xl border border-teal-500/20 bg-sky-950/30 px-6 py-4 text-sm font-medium text-teal-100 backdrop-blur-sm transition-all duration-500 hover:border-teal-400/40 hover:bg-sky-900/40 hover:text-teal-50 focus:bg-sky-900/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Github className="h-5 w-5 transition-all duration-300 group-hover:opacity-90" />
                  GitHub
                </button>
              </div>
            </form>

            {/* Footer inside card */}
            <div className="mt-8 text-center">
              <p className="text-teal-100/80">
                Chưa có tài khoản?{' '}
                <Link
                  href="/signup"
                  className="font-medium text-sky-300 transition-all duration-300 hover:text-sky-200"
                >
                  Đăng ký học miễn phí
                </Link>
              </p>
            </div>
          </div>

          {/* Extra links */}
          <div className="mt-6 space-y-2 text-center">
            <p className="text-sm text-teal-200/70">
              Bằng việc đăng nhập, bạn đồng ý với{' '}
              <Link
                href="/terms"
                className="text-sky-300 transition-all duration-300 hover:text-sky-200 hover:underline"
              >
                Điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link
                href="/privacy"
                className="text-sky-300 transition-all duration-300 hover:text-sky-200 hover:underline"
              >
                Chính sách bảo mật
              </Link>
            </p>
            <p className="text-xs text-teal-200/60">
              Mẹo: Bạn có thể đăng nhập rồi truy cập{' '}
              <Link
                href="/courses"
                className="underline decoration-dotted underline-offset-4"
              >
                Khóa học
              </Link>{' '}
              để làm bài kiểm tra trình độ đầu vào.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes mystic-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes mystic-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes mystic-pulse-delayed {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes mystic-float {
          0%, 100% { transform: translateX(-50%) translateY(-50%) translateZ(0); }
          33% { transform: translateX(-50%) translateY(-60%) translateZ(0); }
          66% { transform: translateX(-50%) translateY(-40%) translateZ(0); }
        }
        @keyframes mystic-drift {
          0% { transform: translateX(0px) translateY(0px); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateX(80px) translateY(-80px); opacity: 0; }
        }
        @keyframes mystic-flow {
          0% { opacity: 0; transform: translateX(-50px) scaleX(0); }
          10% { opacity: 0.8; transform: translateX(-25px) scaleX(1); }
          90% { opacity: 0.8; transform: translateX(25px) scaleX(1); }
          100% { opacity: 0; transform: translateX(50px) scaleX(0); }
        }
        @keyframes mystic-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes mystic-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes mystic-spin-reverse { 0% { transform: rotate(360deg); } 100% { transform: rotate(0deg); } }
        @keyframes mystic-glow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes mystic-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes mystic-fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }

        .animate-mystic-twinkle { animation: mystic-twinkle 6s ease-in-out infinite; }
        .animate-mystic-pulse { animation: mystic-pulse 4s ease-in-out infinite; }
        .animate-mystic-pulse-delayed { animation: mystic-pulse-delayed 5s ease-in-out infinite; }
        .animate-mystic-float { animation: mystic-float 10s ease-in-out infinite; }
        .animate-mystic-drift { animation: mystic-drift 20s linear infinite; }
        .animate-mystic-flow { animation: mystic-flow 3s ease-out infinite; }
        .animate-mystic-bounce { animation: mystic-bounce 2s ease-in-out infinite; }
        .animate-mystic-spin { animation: mystic-spin 8s linear infinite; }
        .animate-mystic-spin-reverse { animation: mystic-spin-reverse 6s linear infinite; }
        .animate-mystic-glow { animation: mystic-glow 3s ease-in-out infinite; }
        .animate-mystic-shimmer { animation: mystic-shimmer 2s ease-in-out; }
        .animate-mystic-fade-in { animation: mystic-fade-in 0.5s ease-out; }
        .bg-gradient-radial { background: radial-gradient(circle, var(--tw-gradient-stops)); }
      `}</style>
    </div>
  )
}
