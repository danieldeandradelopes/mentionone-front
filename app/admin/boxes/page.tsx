// app/admin/boxes/page.tsx
import Link from "next/link";
import { getBaseUrl } from "@/app/lib/api";
import BoxesList from "./BoxesList";

async function getBoxes() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/boxes`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function BoxesPage() {
  const boxes = await getBoxes();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Caixas</h1>
        <Link
          href="/admin/boxes/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Criar caixa
        </Link>
      </div>

      <BoxesList initialBoxes={boxes} />
    </div>
  );
}
