"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Loader2, LogOut, Settings, User } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Target } from "lucide-react";

const Header = () => {
  const dailyGoal = "Moderate";
  const router = useRouter();
  const { user, signOut, isLoading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const initials = useMemo(() => {
    if (!user?.name) return "👤";
    const parts = user.name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }, [user?.name]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.push("/signin");
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
            <Target className="w-5 h-5 text-red-500" />
            <span className="text-sm">Mục tiêu hàng ngày:</span>
            <span className="text-sm font-semibold text-yellow-600">
              {dailyGoal}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 bg-gray-50 hover:bg-gray-100 transition cursor-pointer",
                  (isLoading || signingOut) && "opacity-70 cursor-not-allowed"
                )}
                disabled={isLoading || signingOut}
                aria-label="Tài khoản"
              >
                <span className="text-sm font-semibold text-gray-700">
                  {initials}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user?.name || "Tài khoản"}
                {user?.email && (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="w-4 h-4 cursor-pointer" />
                Hồ sơ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="w-4 h-4 cursor-pointer" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={signingOut}
                className="text-red-600 focus:text-red-700"
              >
                {signingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 cursor-pointer" />
                )}
                {signingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
