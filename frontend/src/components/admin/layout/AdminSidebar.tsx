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
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "content",
    label: "Content Management",
    icon: BookOpen,
    children: [
      {
        id: "learning-paths",
        label: "Learning Paths",
        href: "/admin/learning-paths",
        icon: GraduationCap,
      },
      {
        id: "targets",
        label: "Targets",
        href: "/admin/targets",
        icon: Target,
      },
      {
        id: "lessons",
        label: "Lessons",
        href: "/admin/lessons",
        icon: FileText,
      },
      {
        id: "quizzes",
        label: "Quizzes",
        href: "/admin/quizzes",
        icon: HelpCircle,
      },
      {
        id: "exams",
        label: "Exams",
        href: "/admin/exams",
        icon: ClipboardList,
      },
    ],
  },
  {
    id: "library",
    label: "Library",
    icon: BookOpen,
    children: [
      {
        id: "categories",
        label: "Categories",
        href: "/admin/categories",
        icon: FolderKanban,
      },
      {
        id: "words",
        label: "Words",
        href: "/admin/words",
        icon: FileText,
      },
      {
        id: "flashcards",
        label: "Flashcards",
        href: "/admin/flashcards",
        icon: Layers,
      },
    ],
  },
  {
    id: "users",
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "content",
    "library",
  ]);

  const toggleExpand = (id: string) => {
    if (!isOpen) {
      onToggle();
      setExpandedItems([id]);
      return;
    }
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
              "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors",
              level === 0
                ? "text-gray-700 hover:bg-gray-100"
                : "text-gray-600 hover:bg-gray-50",
              isExpanded && "bg-gray-50",
              !isOpen && "justify-center px-2"
            )}
            title={!isOpen ? item.label : undefined}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </div>
            {isOpen && (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            )}
          </button>
        ) : (
          <Link
            href={item.href!}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
              level > 0 && isOpen && "pl-12",
              isActive
                ? "bg-sky-50 text-sky-600 font-medium"
                : "text-gray-700 hover:bg-gray-100",
              !isOpen && "justify-center px-2"
            )}
            title={!isOpen ? item.label : undefined}
          >
            <item.icon className="w-5 h-5" />
            {isOpen && <span>{item.label}</span>}
          </Link>
        )}

        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 z-50",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-r from-sky-600 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">E_LEANING</h1>
              <p className="text-xs text-gray-500 truncate">Admin Panel</p>
            </div>
          )}
        </Link>
        <button onClick={onToggle} className="p-1 hover:bg-gray-100 rounded-lg lg:hidden">
          <ChevronRight className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")} />
        </button>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>
    </aside>
  );
}
