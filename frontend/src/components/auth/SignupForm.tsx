"use client";

import { tokenManager } from "@/configs/instance";
import { authStorage } from "@/constant/authStorage";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "@/constant/validate";
import { signupApi } from "@/services/auth";
import { ValidationErrors } from "@/types/form";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Rocket,
  Sparkles,
  Star,
  User,
  Mail,
  Lock,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import MysticBackground from "../MysticBackground/MysticBackground";

type SignUpData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  agreeToTerms: boolean;
};

type FormErrors = ValidationErrors & {
  phoneNumber?: string;
  agreeToTerms?: string;
};

export default function SignUpForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<SignUpData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormTouched, setIsFormTouched] = useState(false);

  useEffect(() => {
    if (tokenManager.isAuthenticated()) {
      router.push("/");
      return;
    }
  }, [router]);

  const passwordStrength = useMemo(() => {
    const p = formData.password || "";
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(p)) s++;
    return s;
  }, [formData.password]);

  const strengthLabel = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"][
    Math.min(passwordStrength, 4)
  ];
  const strengthColor = [
    "text-red-400",
    "text-orange-400",
    "text-yellow-400",
    "text-blue-400",
    "text-emerald-400",
  ][Math.min(passwordStrength, 4)];

  const validatePhone = (phone: string): string | null => {
    if (!phone) return "Số điện thoại không được để trống";
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    if (!phoneRegex.test(phone)) return "Số điện thoại không hợp lệ";
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    const phoneError = validatePhone(formData.phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;

    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "Bạn phải đồng ý với điều khoản sử dụng";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: keyof SignUpData, value: string) => {
    let error: string | null = null;
    switch (field) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        if (formData.password !== value) error = "Mật khẩu xác nhận không khớp";
        break;
      case "phoneNumber":
        error = validatePhone(value);
        break;
    }
    setErrors((prev) => ({
      ...prev,
      [field]: error || undefined,
      general: undefined,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const fieldValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: fieldValue as any }));
    setIsFormTouched(true);
    if (isFormTouched && type !== "checkbox") {
      validateField(name as keyof SignUpData, value);
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
      const { confirmPassword, agreeToTerms, ...submitData } = formData;
      const response = await signupApi(submitData);
      if (response.status === 201) {
        toast.success(response.message || "Đăng ký thành công!");
        authStorage.setRememberedEmail(formData.email);
        router.push("https://mail.google.com");
      } else {
        throw new Error(response.message || "Đăng ký thất bại");
      }
    } catch (error: any) {
      console.error("❌ Sign up error:", error);
      const errorMessage =
        error?.response?.data?.message || error.message || "Có lỗi xảy ra";
      const errorCode = error?.response?.data?.error?.code;
      switch (errorCode) {
        case "EMAIL_ALREADY_EXISTS":
          setErrors({ email: "Email này đã được sử dụng" });
          break;
        case "WEAK_PASSWORD":
          setErrors({ password: "Mật khẩu không đủ mạnh" });
          break;
        case "INVALID_EMAIL":
          setErrors({ email: "Email không hợp lệ" });
          break;
        case "RATE_LIMIT_EXCEEDED":
          setErrors({
            general: "Quá nhiều lần đăng ký. Vui lòng thử lại sau.",
          });
          break;
        default:
          setErrors({ general: errorMessage });
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-950 via-slate-950 to-emerald-950">
      <MysticBackground />

      {/* Floating accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-sky-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-teal-400 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-sky-300 rounded-full animate-pulse opacity-50"></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="animate-spin-slow absolute inset-0 rounded-full bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 opacity-20 blur-xl"></div>
              <div className="relative flex h-20 w-20 items-center justify-center mx-auto mb-6 rounded-full bg-gradient-to-r from-sky-600/20 via-teal-600/20 to-emerald-600/20 backdrop-blur-sm border border-teal-500/30">
                <Sparkles className="h-10 w-10 text-teal-300 animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-sky-200 via-teal-200 to-emerald-200 bg-clip-text text-transparent mb-4">
              Tạo tài khoản mới
            </h1>
            <p className="text-base font-light text-teal-100/80">
              Học tiếng Anh trực tuyến thông minh – cá nhân hoá theo mục tiêu
            </p>
          </div>

          {/* Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-600/10 via-teal-600/10 to-emerald-600/10 rounded-3xl blur-xl"></div>
            <div className="relative rounded-3xl border border-teal-500/20 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500"></div>

              <div className="p-8 md:p-12">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* General Error */}
                  {errors.general && (
                    <div className="animate-shake rounded-2xl border border-red-500/30 bg-red-950/20 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <p className="text-sm text-red-200">{errors.general}</p>
                      </div>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-3">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-teal-100 flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-sky-300" />
                      Họ và tên
                    </label>
                    <div className="group relative">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border py-4 pr-4 pl-4 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-teal-500/30 ${
                          errors.name
                            ? "border-red-500/50 bg-red-950/20 text-red-200 placeholder:text-red-300/60"
                            : formData.name && !errors.name
                              ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-100 placeholder:text-emerald-200/60"
                              : "border-teal-500/30 bg-sky-950/20 text-teal-100 placeholder:text-teal-300/50 focus:border-teal-400/60 focus:bg-sky-900/30"
                        }`}
                        placeholder="Nguyễn Văn A"
                      />
                      {formData.name && !errors.name && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400 animate-pulse" />
                      )}
                    </div>
                    {errors.name && (
                      <p className="flex items-center gap-2 text-sm text-red-300 animate-slideDown">
                        <AlertCircle className="h-4 w-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-teal-100 flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4 text-sky-300" />
                      Email
                    </label>
                    <div className="group relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border py-4 pr-4 pl-4 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-teal-500/30 ${
                          errors.email
                            ? "border-red-500/50 bg-red-950/20 text-red-200 placeholder:text-red-300/60"
                            : formData.email && !errors.email
                              ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-100 placeholder:text-emerald-200/60"
                              : "border-teal-500/30 bg-sky-950/20 text-teal-100 placeholder:text-teal-300/50 focus:border-teal-400/60 focus:bg-sky-900/30"
                        }`}
                        placeholder="you@example.com"
                      />
                      {formData.email && !errors.email && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400 animate-pulse" />
                      )}
                    </div>
                    {errors.email && (
                      <p className="flex items-center gap-2 text-sm text-red-300 animate-slideDown">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-3">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-teal-100 flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4 text-sky-300" />
                      Số điện thoại
                    </label>
                    <div className="group relative">
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border py-4 pr-4 pl-4 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-teal-500/30 ${
                          errors.phoneNumber
                            ? "border-red-500/50 bg-red-950/20 text-red-200 placeholder:text-red-300/60"
                            : formData.phoneNumber && !errors.phoneNumber
                              ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-100 placeholder:text-emerald-200/60"
                              : "border-teal-500/30 bg-sky-950/20 text-teal-100 placeholder:text-teal-300/50 focus:border-teal-400/60 focus:bg-sky-900/30"
                        }`}
                        placeholder="+84901234567"
                      />
                      {formData.phoneNumber && !errors.phoneNumber && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400 animate-pulse" />
                      )}
                    </div>
                    {errors.phoneNumber && (
                      <p className="flex items-center gap-2 text-sm text-red-300 animate-slideDown">
                        <AlertCircle className="h-4 w-4" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-3">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-teal-100 flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4 text-sky-300" />
                      Mật khẩu
                    </label>
                    <div className="group relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border py-4 pr-12 pl-4 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-teal-500/30 ${
                          errors.password
                            ? "border-red-500/50 bg-red-950/20 text-red-200 placeholder:text-red-300/60"
                            : formData.password && !errors.password
                              ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-100 placeholder:text-emerald-200/60"
                              : "border-teal-500/30 bg-sky-950/20 text-teal-100 placeholder:text-teal-300/50 focus:border-teal-400/60 focus:bg-sky-900/30"
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

                    {/* Password Strength */}
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-teal-200/80">
                            Độ mạnh mật khẩu:
                          </span>
                          <span
                            className={`text-xs font-medium ${strengthColor}`}
                          >
                            {strengthLabel}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i < passwordStrength
                                  ? passwordStrength < 2
                                    ? "bg-red-400"
                                    : passwordStrength < 4
                                      ? "bg-yellow-400"
                                      : "bg-emerald-400"
                                  : "bg-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p className="flex items-center gap-2 text-sm text-red-300 animate-slideDown">
                        <AlertCircle className="h-4 w-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-3">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-teal-100 flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4 text-sky-300" />
                      Xác nhận mật khẩu
                    </label>
                    <div className="group relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full rounded-2xl border py-4 pr-12 pl-4 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-teal-500/30 ${
                          errors.confirmPassword
                            ? "border-red-500/50 bg-red-950/20 text-red-200 placeholder:text-red-300/60"
                            : formData.confirmPassword &&
                                formData.password === formData.confirmPassword
                              ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-100 placeholder:text-emerald-200/60"
                              : "border-teal-500/30 bg-sky-950/20 text-teal-100 placeholder:text-teal-300/50 focus:border-teal-400/60 focus:bg-sky-900/30"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
                      <p className="flex items-center gap-2 text-sm text-red-300 animate-slideDown">
                        <AlertCircle className="h-4 w-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="space-y-4 pt-4 border-t border-teal-500/20">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <input
                          id="agreeToTerms"
                          name="agreeToTerms"
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          className="peer h-5 w-5 rounded border-teal-500/30 bg-sky-900/50 text-teal-500 transition-all duration-300 focus:ring-2 focus:ring-teal-500/30 focus:ring-offset-0"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded border-2 border-transparent peer-checked:border-teal-400 peer-checked:bg-teal-500/10 transition-all duration-300"></div>
                      </div>
                      <label
                        htmlFor="agreeToTerms"
                        className="text-sm text-teal-100 leading-relaxed"
                      >
                        Tôi đồng ý với{" "}
                        <Link
                          href="/terms"
                          className="text-sky-300 hover:text-sky-200 underline decoration-sky-300/30 hover:decoration-sky-200/50 transition-all duration-200"
                        >
                          Điều khoản sử dụng
                        </Link>{" "}
                        và{" "}
                        <Link
                          href="/privacy"
                          className="text-sky-300 hover:text-sky-200 underline decoration-sky-300/30 hover:decoration-sky-200/50 transition-all duration-200"
                        >
                          Chính sách bảo mật
                        </Link>
                        <span className="text-red-400 ml-1">*</span>
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="flex items-center gap-2 text-sm text-red-300 animate-slideDown ml-8">
                        <AlertCircle className="h-4 w-4" />
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || !formData.agreeToTerms}
                      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 py-5 px-8 text-white font-semibold text-lg shadow-2xl transition-all duration-500 hover:shadow-sky-500/25 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {isLoading ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Đang tạo tài khoản...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-6 w-6" />
                            Tạo tài khoản
                            <Sparkles className="h-6 w-6" />
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm text-teal-100/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>{" "}
                Miễn phí
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse"></div>{" "}
                Bảo mật
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>{" "}
                Dễ dùng
              </div>
            </div>

            <p className="text-teal-100/80">
              Đã có tài khoản?{" "}
              <Link
                href="/signin"
                className="font-medium text-sky-300 hover:text-sky-200 transition-all duration-300 hover:underline decoration-sky-300/30"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
