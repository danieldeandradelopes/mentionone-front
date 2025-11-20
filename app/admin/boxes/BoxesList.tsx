"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Edit } from "lucide-react";

interface Box {
  id: string;
  name: string;
  location: string;
}

interface BoxesListProps {
  initialBoxes: Box[];
}

export default function BoxesList({ initialBoxes }: BoxesListProps) {
  const router = useRouter();
  const [boxes, setBoxes] = useState<Box[]>(initialBoxes);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir a caixa "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/boxes/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Erro ao excluir: ${error.error || "Erro desconhecido"}`);
        setDeletingId(null);
        return;
      }

      // Remove da lista localmente
      setBoxes((prev) => prev.filter((box) => box.id !== id));

      // Recarrega a página para garantir sincronização
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Erro ao excluir box:", error);
      alert("Erro ao excluir caixa. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {boxes.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          Nenhuma caixa criada ainda.
        </p>
      )}

      {boxes.map((box) => (
        <div
          key={box.id}
          className="p-4 border border-gray-200 rounded-xl bg-white flex justify-between items-center hover:shadow-md transition-shadow"
        >
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{box.name}</p>
            <p className="text-sm text-gray-500">{box.location}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/boxes/${box.id}/edit`}
              className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
            >
              <Edit size={16} />
              Editar
            </Link>
            <button
              onClick={() => handleDelete(box.id, box.name)}
              disabled={deletingId === box.id || isPending}
              className="text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Trash2 size={16} />
              {deletingId === box.id ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
