"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useState } from "react";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div
          className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}
        >
          <AdminHeader />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
