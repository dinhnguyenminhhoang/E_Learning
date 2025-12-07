"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    Users,
    GraduationCap,
    ClipboardList,
    Settings,
    LogOut,
} from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Exams",
        href: "/admin/exams",
        icon: ClipboardList,
    },
    {
        title: "Quizzes",
        href: "/admin/quizzes",
        icon: FileText,
    },
    {
        title: "Lessons",
        href: "/admin/lessons",
        icon: BookOpen,
    },
    {
        title: "Learning Paths",
        href: "/admin/learning-paths",
        icon: GraduationCap,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white w-64">
            <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold">E-Learning Admin</h2>
                <p className="text-sm text-gray-400 mt-1">Management Panel</p>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                isActive
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={() => window.location.href = "/"}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Back to Site</span>
                </button>
            </div>
        </div>
    );
}
