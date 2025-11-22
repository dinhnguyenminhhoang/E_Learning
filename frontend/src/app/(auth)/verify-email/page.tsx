// frontend/src/app/(auth)/verify-email/page.tsx
"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { authService } from "@/services/auth.service";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  Rocket,
  Shield,
  Sparkles,
  Star,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const PLATFORM_NAME = "GuruEnglish";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "waiting"
  >("loading");
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [verificationProgress, setVerificationProgress] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const token = searchParams.get("token");

    if (emailParam) setEmail(emailParam);

    if (token) {
      verifyEmail(token);
    } else if (emailParam) {
      setStatus("waiting");
    } else {
      router.push("/signup");
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (status === "loading") {
      const interval = setInterval(() => {
        setVerificationProgress((prev) =>
          prev >= 90 ? prev : prev + Math.random() * 15
        );
      }, 200);
      return () => clearInterval(interval);
    }
  }, [status]);

  const verifyEmail = async (token: string) => {
    try {
      setStatus("loading");
      setVerificationProgress(0);

      const progressInterval = setInterval(() => {
        setVerificationProgress((prev) => Math.min(prev + 20, 90));
      }, 300);

      await authService.verifyEmail(token);

      clearInterval(progressInterval);
      setVerificationProgress(100);

      setTimeout(() => {
        setStatus("success");
        toast.success("Email đã được xác thực thành công!");
        setTimeout(() => {
          router.push("/signin");
        }, 4000);
      }, 500);
    } catch (error: any) {
      console.error("❌ Email verification error:", error);
      setStatus("error");
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        "Xác thực email thất bại"
      );
    }
  };

  const handleResendVerification = async () => {
    if (!email || countdown > 0) return;
    try {
      setIsResending(true);
      // TODO: Backend does not have resendVerification endpoint yet
      // await authService.resendVerification(email);
      toast.error("Tính năng gửi lại email chưa được hỗ trợ. Vui lòng liên hệ quản trị viên.");
      return;

      // Uncomment when backend implements /v1/api/user/resend-verification
      // toast.success("Email xác thực đã được gửi lại!");
      // setCountdown(60);
      // const timer = setInterval(() => {
      //   setCountdown((prev) => {
      //     if (prev <= 1) {
      //       clearInterval(timer);
      //       return 0;
      //     }
      //     return prev - 1;
      //   });
      // }, 1000);
    } catch (error: any) {
      console.error("❌ Resend verification error:", error);
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        "Gửi lại email thất bại"
      );
    } finally {
      setIsResending(false);
    }
  };

  const QuickMailButtons = () => (
    <div className="flex items-center justify-center gap-3">
      <Link
        href="https://mail.google.com"
        target="_blank"
        className="rounded-xl px-4 py-2 text-sm font-medium bg-sky-900/40 border border-sky-500/30 text-sky-100 hover:bg-sky-900/60 transition"
      >
        Mở Gmail
      </Link>
      <Link
        href="https://outlook.live.com/mail/0/inbox"
        target="_blank"
        className="rounded-xl px-4 py-2 text-sm font-medium bg-teal-900/40 border border-teal-500/30 text-teal-100 hover:bg-teal-900/60 transition"
      >
        Mở Outlook
      </Link>
    </div>
  );

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center space-y-8">
            <div className="relative mx-auto">
              <div className="animate-spin-slow absolute inset-0 rounded-full bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 opacity-20 blur-xl"></div>
              <div className="relative flex h-24 w-24 items-center justify-center mx-auto rounded-full bg-gradient-to-r from-sky-600/20 via-teal-600/20 to-emerald-600/20 backdrop-blur-sm border border-teal-500/30">
                <div className="relative">
                  <Loader2 className="h-12 w-12 text-sky-300 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-teal-200 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-sky-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                Đang xác thực email...
              </h2>
              <p className="text-teal-100/80 text-lg max-w-md mx-auto">
                Vui lòng chờ trong khi chúng tôi xác thực địa chỉ email của bạn
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-full rounded-full h-2 overflow-hidden bg-slate-800/60">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${verificationProgress}%` }}
                />
              </div>
              <p className="text-sm text-sky-200/80">
                {verificationProgress < 30
                  ? "Đang kết nối..."
                  : verificationProgress < 60
                    ? "Đang xác thực..."
                    : verificationProgress < 90
                      ? "Gần hoàn thành..."
                      : "Hoàn tất!"}
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-8">
            <div className="relative mx-auto">
              <div className="animate-pulse absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 opacity-20 blur-xl"></div>
              <div className="relative flex h-24 w-24 items-center justify-center mx-auto rounded-full bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-green-600/20 backdrop-blur-sm border border-emerald-500/30">
                <CheckCircle className="h-12 w-12 text-emerald-400 animate-bounce" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-300 bg-clip-text text-transparent">
                Xác thực thành công! 🎉
              </h2>
              <p className="text-teal-100/85 text-lg max-w-md mx-auto">
                Tuyệt vời! Email của bạn đã được xác thực. Chào mừng đến với{" "}
                {PLATFORM_NAME}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-sky-900/30 border border-sky-500/30">
                <Shield className="h-6 w-6 text-sky-300" />
                <span className="text-sm text-sky-100/90">
                  Tài khoản an toàn
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-teal-900/30 border border-teal-500/30">
                <Star className="h-6 w-6 text-teal-300" />
                <span className="text-sm text-teal-100/90">
                  Truy cập đầy đủ
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-emerald-900/30 border border-emerald-500/30">
                <GraduationCap className="h-6 w-6 text-emerald-300" />
                <span className="text-sm text-emerald-100/90">
                  Sẵn sàng học tập
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sky-200/80">
                Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát...
              </p>

              <Link
                href="/signin"
                className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-sky-500/25 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Đăng nhập ngay
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"></div>
              </Link>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center space-y-8">
            <div className="relative mx-auto">
              <div className="animate-pulse absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 opacity-20 blur-xl"></div>
              <div className="relative flex h-24 w-24 items-center justify-center mx-auto rounded-full bg-gradient-to-r from-red-600/20 via-orange-600/20 to-pink-600/20 backdrop-blur-sm border border-red-500/30">
                <AlertCircle className="h-12 w-12 text-red-400 animate-bounce" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                Xác thực thất bại
              </h2>
              <p className="text-teal-100/85 text-lg max-w-md mx-auto">
                Link xác thực không hợp lệ hoặc đã hết hạn. Đừng lo, bạn có thể
                yêu cầu gửi lại.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-sky-900/30 border border-sky-500/30">
                  <Clock className="h-6 w-6 text-sky-300" />
                  <span className="text-sm text-sky-100/90">
                    Link có thể đã hết hạn
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-teal-900/30 border border-teal-500/30">
                  <Mail className="h-6 w-6 text-teal-300" />
                  <span className="text-sm text-teal-100/90">
                    Kiểm tra lại hộp thư
                  </span>
                </div>
              </div>

              {email && (
                <div className="space-y-4">
                  <button
                    onClick={handleResendVerification}
                    disabled={isResending || countdown > 0}
                    className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-sky-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isResending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Đang gửi...
                        </>
                      ) : countdown > 0 ? (
                        <>
                          <RefreshCw className="h-5 w-5" />
                          Gửi lại sau {countdown}s
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-5 w-5" />
                          Gửi lại email xác thực
                        </>
                      )}
                    </span>
                    {!isResending && countdown === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"></div>
                    )}
                  </button>
                  <QuickMailButtons />
                </div>
              )}

              <div className="space-y-2">
                <Link
                  href="/signup"
                  className="text-sky-300 hover:text-sky-200 transition-colors underline decoration-sky-300/30 hover:decoration-sky-200/50"
                >
                  Quay lại đăng ký
                </Link>
                <span className="mx-2 text-slate-500">•</span>
                <Link
                  href="/signin"
                  className="text-teal-300 hover:text-teal-200 transition-colors underline decoration-teal-300/30 hover:decoration-teal-200/50"
                >
                  Đi đến đăng nhập
                </Link>
              </div>
            </div>
          </div>
        );

      case "waiting":
        return (
          <div className="text-center space-y-8">
            <div className="relative mx-auto">
              <div className="animate-spin-slow absolute inset-0 rounded-full bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 opacity-20 blur-xl"></div>
              <div className="relative flex h-24 w-24 items-center justify-center mx-auto rounded-full bg-gradient-to-r from-sky-600/20 via-teal-600/20 to-emerald-600/20 backdrop-blur-sm border border-teal-500/30">
                <Mail className="h-12 w-12 text-sky-300 animate-bounce" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-sky-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                Kiểm tra email của bạn
              </h2>
              <p className="text-teal-100/85 text-lg">
                Chúng tôi đã gửi link xác thực từ {PLATFORM_NAME} tới:
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-900/30 border border-sky-500/30">
                <Mail className="h-5 w-5 text-sky-300" />
                <span className="text-sky-200 font-semibold">{email}</span>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <div className="rounded-2xl border border-teal-500/20 bg-slate-900/40 p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-300" />
                  Hướng dẫn xác thực
                </h3>
                <div className="space-y-4 text-sm text-sky-100/90">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-600/20 flex items-center justify-center border border-sky-500/30">
                      <span className="text-sky-300 font-semibold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Kiểm tra hộp thư</p>
                      <p className="text-teal-200/80">
                        Tìm email từ {PLATFORM_NAME} trong Inbox và cả thư mục
                        Spam
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600/20 flex items-center justify-center border border-teal-500/30">
                      <span className="text-teal-300 font-semibold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        Nhấp vào liên kết
                      </p>
                      <p className="text-teal-200/80">
                        Bấm "Xác thực email" để hoàn tất
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
                      <span className="text-emerald-300 font-semibold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">Hoàn tất</p>
                      <p className="text-teal-200/80">
                        Link có hiệu lực trong 24 giờ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <QuickMailButtons />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <button
                onClick={handleResendVerification}
                disabled={isResending || countdown > 0}
                className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 px-8 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-sky-500/25 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isResending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang gửi...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      Gửi lại sau {countdown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      Gửi lại email
                    </>
                  )}
                </span>
                {!isResending && countdown === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-teal-500 to-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-2xl"></div>
                )}
              </button>

              <div className="text-sm space-x-4">
                <Link
                  href="/signin"
                  className="text-sky-300 hover:text-sky-200 transition-colors underline decoration-sky-300/30 hover:decoration-sky-200/50"
                >
                  Đã xác thực? Đăng nhập ngay
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout>
      <AuthCard>{renderContent()}</AuthCard>
      <div className="text-center mt-8">
        <p className="text-xs text-teal-200/70 max-w-md mx-auto">
          Bảo mật và riêng tư là ưu tiên hàng đầu của chúng tôi.
        </p>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </AuthLayout>
  );
}
