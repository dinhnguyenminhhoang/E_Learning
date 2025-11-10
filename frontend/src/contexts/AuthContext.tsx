"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthContextType, AuthState, User, UserRole } from "@/types/auth.types";
import {
  getRedirectPath,
  saveAuthData,
  clearAuthData,
  getStoredAuthData,
  isAdmin as checkIsAdmin,
} from "@/utils/auth.utils";
import { authService } from "@/services/auth.service";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    session: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authState.isLoading) {
      protectRoutes();
    }
  }, [pathname, authState.isLoading, authState.isAdmin]);

  const checkAuth = useCallback(async () => {
    try {
      const { accessToken, user } = getStoredAuthData();

      if (accessToken && user) {
        const isAdminUser = checkIsAdmin(user.roles);

        setAuthState({
          user,
          tokens: {
            accessToken,
            tokenType: "Bearer",
            expiresIn: 3600,
          },
          session: null,
          isAuthenticated: true,
          isAdmin: isAdminUser,
          isLoading: false,
        });
      } else {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      clearAuthData();
      setAuthState({
        user: null,
        tokens: null,
        session: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });
    }
  }, []);

  const protectRoutes = useCallback(() => {
    const isAdminRoute = pathname?.startsWith("/admin");
    const isAuthRoute =
      pathname === "/forgot-password" ||
      pathname === "/signup" ||
      pathname === "/signin" ||
      pathname.includes("/reset-passsword") ||
      pathname === "/verify-email";

    if (isAdminRoute && !authState.isAdmin) {
      console.warn("⚠️ Access denied: Admin only route");
      router.replace("/");
      return;
    }
    if (!authState.isAuthenticated && !isAuthRoute && pathname !== "/") {
      router.replace("/signin");
      return;
    }

    if (authState.isAuthenticated && isAuthRoute) {
      const redirectPath = getRedirectPath(authState.user?.roles || []);
      router.replace(redirectPath);
    }
  }, [pathname, authState.isAuthenticated, authState.isAdmin, router]);

  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await authService.signIn({
        email,
        password,
        rememberMe,
      });

      const { user, tokens, session } = response;
      const isAdminUser = checkIsAdmin(user.roles);

      saveAuthData(tokens.accessToken, user);

      setAuthState({
        user,
        tokens,
        session,
        isAuthenticated: true,
        isAdmin: isAdminUser,
        isLoading: false,
      });

      const redirectPath = getRedirectPath(user.roles);
      router.push(redirectPath);

      console.log(`✅ Login successful. Redirecting to: ${redirectPath}`);
    } catch (error: any) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      await authService.signUp({ name, email, password });

      router.push(
        "/signin?message=Please check your email to verify your account"
      );

      setAuthState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signOut = async (allDevices: boolean = false) => {
    try {
      await authService.signOut(allDevices);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      setAuthState({
        user: null,
        tokens: null,
        session: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
      });

      router.push("/login");
    }
  };

  const googleLogin = async (idToken: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await authService.googleLogin(idToken);
      const { user, tokens, session } = response;
      const isAdminUser = checkIsAdmin(user.roles);

      saveAuthData(tokens.accessToken, user);

      setAuthState({
        user,
        tokens,
        session,
        isAuthenticated: true,
        isAdmin: isAdminUser,
        isLoading: false,
      });

      const redirectPath = getRedirectPath(user.roles);
      router.push(redirectPath);
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signOut,
        googleLogin,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
