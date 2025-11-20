// app/admin/boxes/page.tsx
import Boxes from "@/app/entities/Boxes";
import Link from "next/link";

async function getBoxes() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/boxes`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function BoxesPage() {
  const boxes = await getBoxes();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Caixas</h1>
        <Link
          href="/admin/boxes/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          + Criar caixa
        </Link>
      </div>

      <div className="space-y-4">
        {boxes.length === 0 && (
          <p className="text-gray-500 text-center">
            Nenhuma caixa criada ainda.
          </p>
        )}

        {boxes.map((box: Boxes) => (
          <div
            key={box.id}
            className="p-4 border rounded-xl bg-white flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{box.name}</p>
              <p className="text-sm text-gray-500">{box.location}</p>
            </div>

            <Link
              href={`/admin/boxes/${box.id}/edit`}
              className="text-indigo-600 font-medium"
            >
              Editar →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
