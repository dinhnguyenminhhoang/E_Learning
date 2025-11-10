import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin={false}>
      <div className="min-h-screen bg-white">
        <header className="border-b">
          <nav className="container mx-auto px-4 py-4"></nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
