import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { getCookie, removeCookie, setCookie } from "@/lib/cookies";

export function useAuth() {
  const router = useRouter();

  // Kiểm tra đã đăng nhập chưa
  const isAuthenticated = useCallback(() => {
    const token = getCookie("token");
    return !!token;
  }, []);

  // Lưu token khi đăng nhập
  const login = useCallback(
    (token: string, remember: boolean) => {
      const maxAge = remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days : 1 day
      setCookie("token", token, maxAge);
      router.push("/dashboard/default");
    },
    [router],
  );

  // Xóa token khi đăng xuất
  const logout = useCallback(() => {
    removeCookie("token");
    router.push("/auth/v2/login");
  }, [router]);

  return {
    isAuthenticated,
    login,
    logout,
  };
}
