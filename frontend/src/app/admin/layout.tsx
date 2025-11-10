import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r">
          <nav className="p-4">
            <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
          </nav>
        </aside>
        <main className="ml-64 p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
