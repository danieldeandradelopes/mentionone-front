// app/admin/boxes/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBoxPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await fetch("/api/boxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location }),
    });

    router.push("/admin/boxes");
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Criar nova caixa</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nome da caixa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          placeholder="Localização"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="w-full border p-3 rounded-lg"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-3 rounded-lg"
        >
          Criar
        </button>
      </form>
    </div>
  );
}
