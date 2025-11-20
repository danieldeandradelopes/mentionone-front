"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    startTransition(() => {
      router.replace("/login");
    });
  }

  return (
    <button onClick={logout} className="text-red-500" disabled={pending}>
      {pending ? "Saindo..." : "Sair"}
    </button>
  );
}
