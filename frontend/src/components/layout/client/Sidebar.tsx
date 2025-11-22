"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

type Item = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
};
const items: Item[] = [
  { id: "home", label: "Home", href: "/learn", icon: Home },
  { id: "learning", label: "Learning", href: "/topic-list", icon: GraduationCap },
  { id: "wordlist", label: "Word list", href: "/my-wordlist", icon: BookOpen },
  { id: "leaderboard", label: "Leaderboard", href: "/leaderboard", icon: Trophy },
];
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 relative",
        collapsed ? "w-[5rem]" : "w-64"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-gray-100",
          collapsed && "justify-center"
        )}
      >
        {!collapsed && (
          <h1 className="text-2xl font-bold text-blue-500 tracking-tight">
            GuruLango
          </h1>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-5 z-10 rounded-full border bg-white shadow-sm p-1 hover:bg-gray-50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      <TooltipProvider delayDuration={150}>
        <nav className="flex-1 px-3 py-4 space-y-6">
          <div>
            {!collapsed && (
              <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">
                Learning
              </div>
            )}

            <div className="space-y-1">
              {items.map(({ id, label, href, icon: Icon }) => {
                const active =
                  pathname === href ||
                  (href !== "/" && pathname?.startsWith(href));
                const base =
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors";
                const cls = active
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50";

                return collapsed ? (
                  // Collapsed: đặt key lên Tooltip (phần tử bọc ngoài cùng)
                  <Tooltip key={id}>
                    <TooltipTrigger asChild>
                      <Link
                        href={href}
                        className={cn(base, cls)}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="w-5 h-5 shrink-0 mx-auto" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="ml-2">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  // Expanded: đặt key lên Link
                  <Link
                    key={id}
                    href={href}
                    className={cn(base, cls)}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            {!collapsed && (
              <div className="text-xs font-semibold text-gray-400 uppercase mb-2 px-3">
                Account
              </div>
            )}
            <Link
              href="/profile"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50",
                pathname?.startsWith("/profile") &&
                "bg-blue-50 text-blue-600 font-medium"
              )}
            >
              <User className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Profile</span>}
            </Link>
          </div>
        </nav>
      </TooltipProvider>

      {/* Footer user */}
      <Link href="/profile" className="block p-4 border-t border-gray-200 hover:bg-gray-50 transition-colors">
        {collapsed ? (
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold mx-auto">
            MH
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              MH
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">Minh Hoàng</div>
              <div className="text-xs text-gray-500 truncate">
                dinh*****@gmail.com
              </div>
            </div>
          </div>
        )}
      </Link>
    </aside>
  );
}
