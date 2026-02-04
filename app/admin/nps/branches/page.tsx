"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetBranches } from "@/hooks/integration/branches/queries";
import {
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from "@/hooks/integration/branches/mutations";
import { useAuth } from "@/hooks/utils/use-auth";
import { Branch } from "@/src/@backend-types/Branch";
import { Edit, Trash2, Plus, Building2 } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import notify from "@/utils/notify";

export default function BranchesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: branches = [], isLoading, error } = useGetBranches();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();

  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formAddress, setFormAddress] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const resetForm = () => {
    setFormName("");
    setFormSlug("");
    setFormAddress("");
    setEditingId(null);
    setIsCreating(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      notify("Nome é obrigatório.", "error");
      return;
    }
    try {
      await createBranch.mutateAsync({
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        address: formAddress.trim() || null,
      });
      notify("Filial criada com sucesso!", "success");
      resetForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao criar filial.";
      notify(message, "error");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null || !formName.trim()) return;
    try {
      await updateBranch.mutateAsync({
        id: editingId,
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        address: formAddress.trim() || null,
      });
      notify("Filial atualizada com sucesso!", "success");
      resetForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao atualizar filial.";
      notify(message, "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBranch.mutateAsync(deleteTarget.id);
      notify("Filial excluída.", "success");
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      notify("Erro ao excluir filial.", "error");
    }
  };

  const startEdit = (b: Branch) => {
    setEditingId(b.id);
    setFormName(b.name);
    setFormSlug(b.slug);
    setFormAddress(b.address ?? "");
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div
        className="text-gray-600 py-10"
        role="status"
        aria-label="Carregando filiais"
      >
        Carregando filiais...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="text-red-600 py-8 bg-red-50 rounded-xl border border-red-100 px-4"
        role="alert"
      >
        Erro ao carregar filiais. Tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Filiais</h1>
      <p className="text-gray-600 text-sm">
        Cadastre as unidades da sua empresa para usar em pesquisas NPS e
        comparar resultados.
      </p>

      <Card className="p-6">
        {!isCreating && editingId == null && (
          <Button
            type="button"
            variant="outline"
            className="mb-4"
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
          >
            <Plus size={18} className="mr-2" />
            Nova filial
          </Button>
        )}

        {(isCreating || editingId != null) && (
          <form
            onSubmit={editingId != null ? handleUpdate : handleCreate}
            className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3"
          >
            <h2 className="font-semibold text-gray-800">
              {editingId != null ? "Editar filial" : "Nova filial"}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Ex.: Loja Centro"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (opcional)
              </label>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="loja-centro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço (opcional)
              </label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                placeholder="Rua, número, bairro"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={createBranch.isPending || updateBranch.isPending}
              >
                {editingId != null ? "Salvar" : "Criar"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {branches.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-white text-center"
            role="status"
            aria-label="Nenhuma filial cadastrada"
          >
            <Building2 className="h-12 w-12 text-gray-400 mb-4" aria-hidden />
            <p className="text-gray-600 mb-2">
              Nenhuma filial cadastrada ainda.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Cadastre filiais para vincular respostas de NPS e comparar
              resultados por unidade.
            </p>
            <Button type="button" onClick={() => setIsCreating(true)}>
              <Plus size={18} className="mr-2" />
              Nova filial
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {branches.map((branch: Branch) => (
              <li
                key={branch.id}
                className="p-4 border border-gray-200 rounded-xl bg-white flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{branch.name}</p>
                  <p className="text-sm text-gray-500">
                    Slug: {branch.slug}{" "}
                    {branch.address && ` · ${branch.address}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(branch)}
                    className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                    aria-label={`Editar filial ${branch.name}`}
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(branch)}
                    disabled={deleteBranch.isPending}
                    className="text-red-600 font-medium hover:text-red-700 disabled:opacity-50 flex items-center gap-1"
                    aria-label={`Excluir filial ${branch.name}`}
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmModal
        open={!!deleteTarget}
        title="Excluir filial"
        description={
          deleteTarget
            ? `Tem certeza que deseja excluir a filial "${deleteTarget.name}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteBranch.isPending}
      />
    </div>
  );
}
