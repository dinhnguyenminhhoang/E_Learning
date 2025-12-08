"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FolderKanban,
  Users,
  Settings,
  FileText,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronRight,
  Target,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Bảng điều khiển",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "content",
    label: "Quản lý Nội dung",
    icon: BookOpen,
    children: [
      {
        id: "learning-paths",
        label: "Lộ trình học",
        href: "/admin/learning-paths",
        icon: GraduationCap,
      },
      {
        id: "targets",
        label: "Mục tiêu",
        href: "/admin/targets",
        icon: Target,
      },
      {
        id: "lessons",
        label: "Bài học",
        href: "/admin/lessons",
        icon: FileText,
      },
      {
        id: "quizzes",
        label: "Bài tập",
        href: "/admin/quizzes",
        icon: HelpCircle,
      },
      {
        id: "exams",
        label: "Kỳ thi",
        href: "/admin/exams",
        icon: ClipboardList,
      },
    ],
  },
  {
    id: "library",
    label: "Thư viện",
    icon: BookOpen,
    children: [
      {
        id: "categories",
        label: "Danh mục",
        href: "/admin/categories",
        icon: FolderKanban,
      },
      {
        id: "words",
        label: "Từ vựng",
        href: "/admin/words",
        icon: FileText,
      },
      {
        id: "flashcards",
        label: "Thẻ ghi nhớ",
        href: "/admin/flashcards",
        icon: Layers,
      },
    ],
  },
  {
    id: "users",
    label: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    id: "settings",
    label: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "content",
    "library",
  ]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpand(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors cursor-pointer",
              level === 0
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-600 hover:bg-gray-50",
              isExpanded && "bg-gray-50"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <Link
            href={item.href!}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer",
              level > 0 && "pl-12",
              isActive
                ? "bg-sky-50 text-sky-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-sky-600 to-teal-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">E_LEANING</h1>
            <p className="text-xs text-gray-500">Bảng quản trị</p>
          </div>
        </Link>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
    </aside>
  );
}
