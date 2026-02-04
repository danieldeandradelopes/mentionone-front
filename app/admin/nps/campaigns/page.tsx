"use client";

import Link from "next/link";
import { useGetNPSCampaigns } from "@/hooks/integration/nps-campaigns/queries";
import { Plus, ClipboardList, Edit, Trash2, Link2 } from "lucide-react";
import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useDeleteNPSCampaign } from "@/hooks/integration/nps-campaigns/mutations";
import notify from "@/utils/notify";
import type { NPSCampaign } from "@/src/@backend-types/NPSCampaign";

function getPublicNpsUrl(slug: string): string {
  if (typeof window !== "undefined") return `${window.location.origin}/nps/${slug}`;
  if (process.env.NEXT_PUBLIC_APP_URL) return `${process.env.NEXT_PUBLIC_APP_URL}/nps/${slug}`;
  return `http://localhost:3000/nps/${slug}`;
}

export default function NPSCampaignsPage() {
  const { data: campaigns = [], isLoading, error } = useGetNPSCampaigns();
  const deleteMutation = useDeleteNPSCampaign();
  const [deleteTarget, setDeleteTarget] = useState<NPSCampaign | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      notify("Campanha excluída.", "success");
    } catch (e) {
      console.error(e);
      notify("Erro ao excluir campanha.", "error");
    }
  };

  const handleCopyLink = (slug: string) => {
    const url = getPublicNpsUrl(slug);
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    notify("Link copiado!", "success");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="text-gray-600 py-10" role="status">
        Carregando campanhas...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-red-600 py-8 bg-red-50 rounded-xl border border-red-100 px-4">
        Erro ao carregar campanhas. Tente novamente.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Campanhas NPS</h1>
          <p className="text-sm text-gray-500 mt-1">
            Crie campanhas de pesquisa de satisfação (NPS) e múltipla escolha.
          </p>
        </div>
        <Link
          href="/admin/nps/campaigns/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          Nova campanha
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-white text-center">
          <ClipboardList className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Nenhuma campanha NPS
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Crie sua primeira campanha para enviar o link da pesquisa aos
            clientes.
          </p>
          <Link
            href="/admin/nps/campaigns/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus size={18} />
            Criar campanha
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="p-4 border border-gray-200 rounded-xl bg-white flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.active ? "Ativa" : "Inativa"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">/{c.slug}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(c.slug)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Copiar link da pesquisa"
                >
                  <Link2 size={14} />
                  {copiedSlug === c.slug ? "Copiado!" : "Copiar link"}
                </button>
                <Link
                  href={`/admin/nps/campaigns/${c.id}/edit`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <Edit size={14} />
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(c)}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir campanha"
        description={
          deleteTarget
            ? `Excluir a campanha "${deleteTarget.name}"? Todas as perguntas e respostas vinculadas serão removidas.`
            : ""
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
