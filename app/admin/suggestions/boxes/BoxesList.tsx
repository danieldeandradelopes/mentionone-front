"use client";

import { useState } from "react";
import { useDeleteBox } from "@/hooks/integration/boxes/mutations";
import { useGetBoxes } from "@/hooks/integration/boxes/queries";
import Boxes from "@/@backend-types/Boxes";
import { Edit, Trash2, QrCode, Box } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/ui/ConfirmModal";

const basePath = "/admin/suggestions/boxes";

export default function BoxesList() {
  const { data: boxes = [], isLoading, error } = useGetBoxes();
  const deleteBoxMutation = useDeleteBox();
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteBoxMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
    }
  }

  if (isLoading) {
    return (
      <div
        className="text-gray-600 text-center py-10"
        role="status"
        aria-label="Carregando caixas"
      >
        Carregando caixas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-8 bg-red-50 rounded-xl border border-red-100 px-4">
        Erro ao carregar caixas. Tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {boxes.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-white text-center"
          role="status"
          aria-label="Nenhuma caixa criada"
        >
          <Box className="h-12 w-12 text-gray-400 mb-4" aria-hidden />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Nenhuma caixa criada ainda
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Crie sua primeira caixa para começar a receber feedbacks por QR
            Code.
          </p>
          <Link
            href={`${basePath}/new`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <Box className="h-4 w-4" />
            Criar primeira caixa
          </Link>
        </div>
      )}

      {boxes.map((box: Boxes) => (
        <div
          key={box.id}
          className="p-4 border border-gray-200 rounded-xl bg-white flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:shadow-md transition-shadow"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{box.name}</p>
            <p className="text-sm text-gray-500 truncate">
              {box.location || "—"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:flex-nowrap shrink-0">
            <Link
              href={`${basePath}/${box.id}/qrcode`}
              className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded"
              aria-label={`Ver QR Code da caixa ${box.name}`}
            >
              <QrCode size={16} aria-hidden />
              Ver QR Code
            </Link>
            <Link
              href={`${basePath}/${box.id}/edit`}
              className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded"
              aria-label={`Editar caixa ${box.name}`}
            >
              <Edit size={16} aria-hidden />
              Editar
            </Link>
            <button
              type="button"
              onClick={() => setDeleteTarget({ id: box.id, name: box.name })}
              disabled={deleteBoxMutation.isPending}
              className="text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 rounded"
              aria-label={`Excluir caixa ${box.name}`}
            >
              <Trash2 size={16} aria-hidden />
              Excluir
            </button>
          </div>
        </div>
      ))}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir caixa"
        description={
          deleteTarget
            ? `Tem certeza que deseja excluir a caixa "${deleteTarget.name}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteBoxMutation.isPending}
      />
    </div>
  );
}
