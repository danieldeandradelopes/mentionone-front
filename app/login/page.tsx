"use server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { isAuthenticated } from "@/app/lib/auth-actions";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  // Se já estiver autenticado, redireciona para o admin
  const authenticated = await isAuthenticated();
  if (authenticated) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full items-stretch">
        <div className="grid w-full overflow-hidden bg-white shadow-lg md:grid-cols-2 md:rounded-none">
          <div className="relative min-h-[260px] md:min-h-screen">
            <Image
              src="/woman.png"
              alt="Equipe MentionOne"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-white/80">
                MentionOne
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Centralize acessos e mencoes em um so lugar.
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Entre para acompanhar sua marca com mais clareza.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 py-10 sm:px-10 md:px-16">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
