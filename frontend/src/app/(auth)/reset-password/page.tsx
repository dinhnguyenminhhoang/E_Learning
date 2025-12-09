"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { ErrorAlert } from "@/components/auth/ErrorAlert";
import { SuccessAlert } from "@/components/auth/SuccessAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import { Suspense } from "react";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordRequirements = {
    minLength: formData.newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.newPassword),
    hasLowerCase: /[a-z]/.test(formData.newPassword),
    hasNumber: /\d/.test(formData.newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch =
    formData.newPassword === formData.confirmPassword &&
    formData.confirmPassword !== "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token không hợp lệ");
      return;
    }

    if (!isPasswordValid) {
      setError("Mật khẩu chưa đủ mạnh");
      return;
    }

    if (!passwordsMatch) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      );
      setSuccess(true);
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Đặt lại mật khẩu thất bại"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-500/20 border border-red-500/30">
                <Lock className="h-12 w-12 text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Link không hợp lệ</h2>
            <p className="text-slate-300">
              Vui lòng yêu cầu link đặt lại mật khẩu mới.
            </p>
            <Link href="/forgot-password">
              <Button className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-500 hover:via-teal-500 hover:to-emerald-500">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại quên mật khẩu
              </Button>
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Đặt lại mật khẩu thành công!
            </h2>
            <p className="text-slate-300">
              Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.
            </p>
            <Link href="/signin">
              <Button className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-500 hover:via-teal-500 hover:to-emerald-500 text-white px-8">
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
              Đặt lại mật khẩu
            </h2>
            <p className="mt-2 text-slate-400">Nhập mật khẩu mới của bạn</p>
          </div>

          {error && <ErrorAlert message={error} />}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {formData.newPassword && (
                <div className="mt-3 space-y-2 text-xs">
                  <PasswordRequirement met={passwordRequirements.minLength}>
                    Ít nhất 8 ký tự
                  </PasswordRequirement>
                  <PasswordRequirement met={passwordRequirements.hasUpperCase}>
                    Có chữ hoa
                  </PasswordRequirement>
                  <PasswordRequirement met={passwordRequirements.hasLowerCase}>
                    Có chữ thường
                  </PasswordRequirement>
                  <PasswordRequirement met={passwordRequirements.hasNumber}>
                    Có số
                  </PasswordRequirement>
                  <PasswordRequirement met={passwordRequirements.hasSpecial}>
                    Có ký tự đặc biệt
                  </PasswordRequirement>
                </div>
              )}
            </div>

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
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
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

            <Button
              type="submit"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
              className="w-full bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-500 hover:via-teal-500 hover:to-emerald-500 text-white font-semibold py-6 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm text-sky-300 hover:text-sky-200 inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function PasswordRequirement({
  met,
  children,
}: {
  met: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-slate-600" />
      )}
      <span className={met ? "text-emerald-400" : "text-slate-400"}>
        {children}
      </span>
    </div>
  );
}
