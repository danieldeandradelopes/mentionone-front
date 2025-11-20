import "@/app/globals.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-6">
        <h1 className="text-xl font-bold">Painel Administrativo</h1>
      </header>

      <main>{children}</main>
    </div>
  );
}
