"use server";
import { redirect } from "next/navigation";
import { createSession } from "@/app/lib/auth";

// Função de autenticação como Server Action
export async function authenticate(formData: FormData): Promise<void> {
  const user = formData.get("user")?.toString();
  const pass = formData.get("pass")?.toString();

  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    await createSession();
    redirect("/admin");
  }
  throw new Error("Usuário ou senha inválidos");
}

export default async function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        action={authenticate}
        className="bg-white w-full max-w-sm p-6 rounded-xl shadow"
      >
        <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center">
          Login Admin
        </h1>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Usuário
          </label>
          <input
            name="user"
            type="text"
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Senha
          </label>
          <input
            name="pass"
            type="password"
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
