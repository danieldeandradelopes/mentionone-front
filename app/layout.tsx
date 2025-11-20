import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Meu App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-zinc-100">
        <Sidebar />
        <main className="pl-64 min-h-screen p-8">{children}</main>
      </body>
    </html>
  );
}
