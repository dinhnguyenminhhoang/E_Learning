import Header from "@/components/layout/client/Header";
import Sidebar from "@/components/layout/client/Sidebar";
import { FloatingChatWidget } from "@/components/ai-assistant/FloatingChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
