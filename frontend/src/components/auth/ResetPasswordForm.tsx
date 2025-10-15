"use client";

import { validatePassword } from "@/constant/validate";
import { ValidationErrors } from "@/types/form";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Sparkles,
  BookOpen,
  Headphones,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import MysticBackground from "../MysticBackground/MysticBackground";

const PLATFORM_NAME = "E_LEANING";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>("");

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormTouched, setIsFormTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error("Liên kết đặt lại mật khẩu không hợp lệ");
      router.push("/forgot-password");
    }
  }, [searchParams, router]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: keyof ResetPasswordFormData, value: string) => {
    let error: string | null = null;

    switch (field) {
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        if (value && value !== formData.password) {
          error = "Mật khẩu xác nhận không khớp";
        }
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error || undefined,
      general: undefined,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsFormTouched(true);

    if (isFormTouched) {
      validateField(name as keyof ResetPasswordFormData, value);
    }

    // Also validate confirm password when password changes
    if (name === "password" && formData.confirmPassword) {
      validateField("confirmPassword", formData.confirmPassword);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // TODO: Implement API call for reset password
      // const response = await resetPasswordApi({ 
      //   token, 
      //   password: formData.password.trim() 
      // });
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Đặt lại mật khẩu thành công!");
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("❌ Reset password error:", error);

      const errorMessage =
        error.response?.data?.message || error.message || "Có lỗi xảy ra";
      const errorCode = error.response?.data?.error?.code;

      switch (errorCode) {
        case "INVALID_TOKEN":
          setErrors({ general: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" });
          break;
        case "TOKEN_EXPIRED":
          setErrors({
            general: "Liên kết đã hết hạn. Vui lòng yêu cầu liên kết mới.",
          });
          break;
        case "WEAK_PASSWORD":
          setErrors({
            general: "Mật khẩu không đủ mạnh. Vui lòng chọn mật khẩu khác.",
          });
          break;
        default:
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-950 via-slate-950 to-emerald-950">
        <MysticBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md">
            {/* Success Header */}
            <div className="mb-8 text-center">
              <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/20 bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-600 shadow-2xl shadow-emerald-500/30 backdrop-blur-sm">
                <CheckCircle className="animate-mystic-bounce h-12 w-12 text-emerald-50" />
                <div className="animate-mystic-pulse absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-600/20"></div>
              </div>
              <h1 className="mb-2 bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-200 bg-clip-text text-4xl font-bold text-transparent">
                Đặt lại thành công!
              </h1>
              <p className="text-base font-light text-teal-100/80">
                Mật khẩu của bạn đã được cập nhật thành công
              </p>
            </div>

            {/* Success Card */}
            <div className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900/70 via-emerald-950/40 to-black/50 p-8 shadow-2xl shadow-emerald-900/20 backdrop-blur-xl">
              <div className="animate-mystic-glow absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 blur-sm" />

              <div className="space-y-6 text-center">
                <div className="animate-mystic-fade-in flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 backdrop-blur-sm">
                  <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-emerald-300">
                      Mật khẩu đã được cập nhật
                    </p>
                    <p className="mt-1 text-sm text-emerald-200">
                      Bạn có thể đăng nhập với mật khẩu mới
                    </p>
                  </div>
                </div>

                <Link
                  href="/signin"
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 p-[1px] transition-all duration-700 hover:shadow-2xl hover:shadow-sky-500/30"
                >
                  <div className="relative rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-8 py-4 transition-all duration-500 group-hover:from-sky-500 group-hover:via-teal-500 group-hover:to-emerald-500">
                    <div className="flex items-center justify-center gap-3 text-lg font-semibold text-white">
                      <GraduationCap className="group-hover:animate-mystic-bounce h-6 w-6 transition-all duration-300" />
                      Đăng nhập ngay
                    </div>
                    <div className="group-hover:animate-mystic-shimmer absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400/0 via-sky-400/20 to-sky-400/0"></div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-950 via-slate-950 to-emerald-950">
      <MysticBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border border-teal-400/20 bg-gradient-to-br from-sky-500 via-teal-600 to-emerald-600 shadow-2xl shadow-sky-500/30 backdrop-blur-sm">
              <Lock className="animate-mystic-bounce h-12 w-12 text-teal-50" />
              <div className="animate-mystic-pulse absolute inset-0 rounded-full bg-gradient-to-br from-sky-400/20 to-teal-600/20"></div>
            </div>
            <h1 className="mb-2 bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 bg-clip-text text-4xl font-bold text-transparent">
              Đặt lại mật khẩu
            </h1>
            <p className="text-base font-light text-teal-100/80">
              Nhập mật khẩu mới cho tài khoản của bạn
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
                      Không thể đặt lại mật khẩu
                    </p>
                    <p className="mt-1 text-sm text-red-200">
                      {errors.general}
                    </p>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-teal-100"
                >
                  Mật khẩu mới <span className="text-teal-300">*</span>
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-teal-300/70 transition-all duration-500 group-focus-within:text-teal-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full rounded-2xl border py-4 pr-12 pl-12 backdrop-blur-sm transition-all duration-500 focus:shadow-lg ${
                      errors.password
                        ? "border-red-500/50 bg-red-950/20 text-red-200 shadow-red-500/20 placeholder:text-red-300/60"
                        : formData.password && !errors.password
                          ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-100 shadow-emerald-500/20 placeholder:text-emerald-200/60"
                          : "border-teal-500/30 bg-sky-950/20 text-teal-100 placeholder:text-teal-300/50 focus:border-teal-400/60 focus:bg-sky-900/30 focus:shadow-sky-500/20"
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

              {/* Confirm Password */}
              <div className="space-y-3">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-teal-100"
                >
                  Xác nhận mật khẩu <span className="text-teal-300">*</span>
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-teal-300/70 transition-all duration-500 group-focus-within:text-teal-200" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full rounded-2xl border py-4 pr-12 pl-12 backdrop-blur-sm transition-all duration-500 focus:shadow-lg ${
                      errors.confirmPassword
                        ? "border-red-500/50 bg-red-950/20 text-red-200 shadow-red-500/20 placeholder:text-red-300/60"
                        : formData.confirmPassword && !errors.confirmPassword
                          ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-100 shadow-emerald-500/20 placeholder:text-emerald-200/60"
                          : "border-teal-500/30 bg-sky-950/20 text-teal-100 placeholder:text-teal-300/50 focus:border-teal-400/60 focus:bg-sky-900/30 focus:shadow-sky-500/20"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-teal-300/70 transition-all duration-300 hover:text-teal-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="animate-mystic-fade-in flex items-center gap-2 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="rounded-2xl border border-teal-500/20 bg-sky-950/20 p-4 backdrop-blur-sm">
                <p className="mb-2 text-sm font-medium text-teal-100">Yêu cầu mật khẩu:</p>
                <ul className="space-y-1 text-xs text-teal-200/80">
                  <li>• Ít nhất 8 ký tự</li>
                  <li>• Có ít nhất 1 chữ hoa</li>
                  <li>• Có ít nhất 1 chữ thường</li>
                  <li>• Có ít nhất 1 số</li>
                  <li>• Có ít nhất 1 ký tự đặc biệt</li>
                </ul>
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
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <Lock className="group-hover:animate-mystic-bounce h-6 w-6 transition-all duration-300" />
                        Đặt lại mật khẩu
                      </>
                    )}
                  </div>
                  <div className="group-hover:animate-mystic-shimmer absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400/0 via-sky-400/20 to-sky-400/0"></div>
                </div>
              </button>
            </form>

            {/* Footer inside card */}
            <div className="mt-8 text-center">
              <p className="text-teal-100/80">
                Nhớ lại mật khẩu?{" "}
                <Link
                  href="/signin"
                  className="font-medium text-sky-300 transition-all duration-300 hover:text-sky-200"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>

          {/* Extra links */}
          <div className="mt-6 space-y-2 text-center">
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 transition-all duration-300 hover:text-sky-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
            <p className="text-xs text-teal-200/60">
              Cần hỗ trợ? Liên hệ{" "}
              <Link
                href="/support"
                className="underline decoration-dotted underline-offset-4"
              >
                đội ngũ hỗ trợ
              </Link>{" "}
              của chúng tôi.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mystic-twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
        @keyframes mystic-pulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        @keyframes mystic-pulse-delayed {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        @keyframes mystic-float {
          0%,
          100% {
            transform: translateX(-50%) translateY(-50%) translateZ(0);
          }
          33% {
            transform: translateX(-50%) translateY(-60%) translateZ(0);
          }
          66% {
            transform: translateX(-50%) translateY(-40%) translateZ(0);
          }
        }
        @keyframes mystic-drift {
          0% {
            transform: translateX(0px) translateY(0px);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(80px) translateY(-80px);
            opacity: 0;
          }
        }
        @keyframes mystic-flow {
          0% {
            opacity: 0;
            transform: translateX(-50px) scaleX(0);
          }
          10% {
            opacity: 0.8;
            transform: translateX(-25px) scaleX(1);
          }
          90% {
            opacity: 0.8;
            transform: translateX(25px) scaleX(1);
          }
          100% {
            opacity: 0;
            transform: translateX(50px) scaleX(0);
          }
        }
        @keyframes mystic-bounce {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes mystic-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes mystic-spin-reverse {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        @keyframes mystic-glow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes mystic-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes mystic-fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-mystic-twinkle {
          animation: mystic-twinkle 6s ease-in-out infinite;
        }
        .animate-mystic-pulse {
          animation: mystic-pulse 4s ease-in-out infinite;
        }
        .animate-mystic-pulse-delayed {
          animation: mystic-pulse-delayed 5s ease-in-out infinite;
        }
        .animate-mystic-float {
          animation: mystic-float 10s ease-in-out infinite;
        }
        .animate-mystic-drift {
          animation: mystic-drift 20s linear infinite;
        }
        .animate-mystic-flow {
          animation: mystic-flow 3s ease-out infinite;
        }
        .animate-mystic-bounce {
          animation: mystic-bounce 2s ease-in-out infinite;
        }
        .animate-mystic-spin {
          animation: mystic-spin 8s linear infinite;
        }
        .animate-mystic-spin-reverse {
          animation: mystic-spin-reverse 6s linear infinite;
        }
        .animate-mystic-glow {
          animation: mystic-glow 3s ease-in-out infinite;
        }
        .animate-mystic-shimmer {
          animation: mystic-shimmer 2s ease-in-out;
        }
        .animate-mystic-fade-in {
          animation: mystic-fade-in 0.5s ease-out;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
