"use client";

import { useDeleteBox } from "@/hooks/integration/boxes/mutations";
import { useGetBoxes } from "@/hooks/integration/boxes/queries";
import Boxes from "@/@backend-types/Boxes";
import { Edit, Trash2, QrCode } from "lucide-react";
import Link from "next/link";
export default function BoxesList() {
  const { data: boxes = [], isLoading, error } = useGetBoxes();
  const deleteBoxMutation = useDeleteBox();

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Tem certeza que deseja excluir a caixa "${name}"?`)) {
      return;
    }

    try {
      await deleteBoxMutation.mutateAsync(id);
    } catch (error) {
      console.error(error);
    }
  }

  if (isLoading) {
    return (
      <div className="text-gray-500 text-center py-8">Carregando caixas...</div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        Erro ao carregar caixas. Tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {boxes.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          Nenhuma caixa criada ainda.
        </p>
      )}

      {boxes.map((box: Boxes) => (
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
              href={`/admin/boxes/${box.id}/qrcode`}
              className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
            >
              <QrCode size={16} />
              Ver QR Code
            </Link>
            <Link
              href={`/admin/boxes/${box.id}/edit`}
              className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
            >
              <Edit size={16} />
              Editar
            </Link>
            <button
              onClick={() => handleDelete(box.id, box.name)}
              disabled={deleteBoxMutation.isPending}
              className="text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Trash2 size={16} />
              {deleteBoxMutation.isPending ? "Excluindo..." : "Excluir"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
