"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Boxes from "@/app/entities/Boxes";

export default function EditBoxForm({ box }: { box: Boxes }) {
  const router = useRouter();
  const [name, setName] = useState(box.name);
  const [location, setLocation] = useState(box.location);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await fetch(`/api/boxes/${box.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location }),
    });

    router.push("/admin/boxes");
  }

  async function handleDelete() {
    await fetch(`/api/boxes/${box.id}`, { method: "DELETE" });
    router.push("/admin/boxes");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        type="text"
        className="w-full border p-3 rounded-lg"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="text"
        className="w-full border p-3 rounded-lg"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white p-3 rounded-lg"
      >
        Salvar alterações
      </button>

      <button
        type="button"
        onClick={handleDelete}
        className="w-full bg-red-600 text-white p-3 rounded-lg mt-2"
      >
        Excluir caixa
      </button>
    </form>
  );
}
