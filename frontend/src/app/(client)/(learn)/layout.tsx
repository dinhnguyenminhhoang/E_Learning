"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/client/Header";
import Sidebar from "@/components/layout/client/Sidebar";
import { FloatingChatWidget } from "@/components/ai-assistant/FloatingChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Ẩn sidebar và header cho exam page
  const isExamPage = pathname?.startsWith("/exams/") && pathname !== "/exams";
  
  if (isExamPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        {children}
      </main>
      <FloatingChatWidget />
    </div>
  );
}
