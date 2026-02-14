"use client";

import Link from "next/link";
import { useGetNPSCampaigns } from "@/hooks/integration/nps-campaigns/queries";
import { useGetBranches } from "@/hooks/integration/branches/queries";
import {
  Plus,
  ClipboardList,
  Edit,
  Trash2,
  Link2,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";
import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useDeleteNPSCampaign } from "@/hooks/integration/nps-campaigns/mutations";
import notify from "@/utils/notify";
import type { NPSCampaign } from "@/src/@backend-types/NPSCampaign";

function getPublicNpsUrl(slug: string, branchSlug?: string | null): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const path = `${base}/nps/${slug}`;
  if (branchSlug) return `${path}?branch=${encodeURIComponent(branchSlug)}`;
  return path;
}

export default function NPSCampaignsPage() {
  const { data: campaigns = [], isLoading, error } = useGetNPSCampaigns();
  const { data: branches = [] } = useGetBranches();
  const deleteMutation = useDeleteNPSCampaign();
  const [deleteTarget, setDeleteTarget] = useState<NPSCampaign | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

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

  const handleCopyBranchLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    notify("Link copiado!", "success");
    setTimeout(() => setCopiedUrl(null), 2000);
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
          {campaigns.map((c) => {
            const isExpanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                className="border border-gray-200 rounded-xl bg-white overflow-hidden"
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">{c.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          c.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
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
                      onClick={() => setExpandedId(isExpanded ? null : c.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      title="Ver links por filial"
                    >
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                      Links por filial
                    </button>
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
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500 mb-3">
                      Use o link de cada filial naquela unidade para associar as
                      respostas às métricas.
                    </p>
                    {branches.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Cadastre filiais em <strong>NPS → Filiais</strong> para
                        gerar links por unidade.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {branches.map((branch) => {
                          const url = getPublicNpsUrl(c.slug, branch.slug);
                          const isCopied = copiedUrl === url;
                          return (
                            <li
                              key={branch.id}
                              className="flex items-center justify-between gap-2 rounded border border-gray-100 bg-white px-3 py-2 text-sm"
                            >
                              <span className="font-medium text-gray-800 truncate flex-1">
                                {branch.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyBranchLink(url)}
                                className="inline-flex items-center gap-1.5 shrink-0 px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                title="Copiar link"
                              >
                                <Copy size={14} />
                                {isCopied ? "Copiado!" : "Copiar"}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
