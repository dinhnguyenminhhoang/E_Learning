"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import MysticBackground from "@/components/MysticBackground/MysticBackground";
import PasswordRequirement from "@/components/auth/PasswordRequirement";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fix hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword !== "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!isPasswordValid) {
      setError(
        "Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!formData.agreeTerms) {
      setError("Vui lòng đồng ý với Điều khoản dịch vụ");
      return;
    }

    try {
      await signUp(formData.name, formData.email, formData.password);
      setSuccess(true);
      // Redirect is handled in AuthContext
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Đăng ký thất bại. Vui lòng thử lại."
      );
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-950 via-slate-950 to-emerald-950 flex items-center justify-center px-4">
        <MysticBackground />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Đăng ký thành công!
          </h2>
          <p className="text-slate-300 mb-6">
            Vui lòng kiểm tra email để xác thực tài khoản của bạn.
          </p>
          <Button
            onClick={() => router.push("/signin")}
            className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-500 hover:via-teal-500 hover:to-emerald-500 text-white px-8"
          >
            Đến trang đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-950 via-slate-950 to-emerald-950">
      <MysticBackground />

      {/* Only render particles after mount to avoid hydration error */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-sky-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent mb-2">
              GuruEnglish
            </h1>
            <p className="text-slate-400">Bắt đầu hành trình học tập của bạn</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-600/10 via-teal-600/10 to-emerald-600/10 rounded-3xl blur-xl"></div>
            <div className="relative rounded-3xl border border-teal-500/20 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500"></div>

              <div className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Đăng ký</h2>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-sky-500/20"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-sky-500/20"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-sky-500/20"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Requirements */}
                    {formData.password && (
                      <div className="mt-3 space-y-2 text-xs">
                        <PasswordRequirement
                          met={passwordRequirements.minLength}
                        >
                          Ít nhất 8 ký tự
                        </PasswordRequirement>
                        <PasswordRequirement
                          met={passwordRequirements.hasUpperCase}
                        >
                          Có chữ hoa
                        </PasswordRequirement>
                        <PasswordRequirement
                          met={passwordRequirements.hasLowerCase}
                        >
                          Có chữ thường
                        </PasswordRequirement>
                        <PasswordRequirement
                          met={passwordRequirements.hasNumber}
                        >
                          Có số
                        </PasswordRequirement>
                        <PasswordRequirement
                          met={passwordRequirements.hasSpecial}
                        >
                          Có ký tự đặc biệt
                        </PasswordRequirement>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-sky-500/20"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <div className="mt-2">
                        <PasswordRequirement met={passwordsMatch}>
                          Mật khẩu khớp
                        </PasswordRequirement>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeTerms"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          agreeTerms: checked as boolean,
                        }))
                      }
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="agreeTerms"
                      className="text-sm text-slate-300 cursor-pointer"
                    >
                      Tôi đồng ý với{" "}
                      <Link
                        href="/terms"
                        className="text-sky-300 hover:text-sky-200"
                      >
                        Điều khoản dịch vụ
                      </Link>{" "}
                      và{" "}
                      <Link
                        href="/privacy"
                        className="text-sky-300 hover:text-sky-200"
                      >
                        Chính sách bảo mật
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !isPasswordValid ||
                      !passwordsMatch ||
                      !formData.agreeTerms
                    }
                    className="w-full bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-500 hover:via-teal-500 hover:to-emerald-500 text-white font-semibold py-6 text-base shadow-xl shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Đang đăng ký...
                      </>
                    ) : (
                      "Đăng ký"
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700/50"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-900/50 text-slate-400">
                      hoặc đăng ký với
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-700/50 bg-slate-800/50 hover:bg-slate-800 text-white"
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Đăng ký với Google
                </Button>

                {/* Sign In Link */}
                <p className="mt-6 text-center text-sm text-slate-400">
                  Đã có tài khoản?{" "}
                  <Link
                    href="/signin"
                    className="text-sky-300 hover:text-sky-200 font-medium transition-colors"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
