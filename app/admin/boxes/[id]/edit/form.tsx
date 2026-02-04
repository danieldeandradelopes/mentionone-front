"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useUpdateBox,
  useDeleteBox,
} from "@/hooks/integration/boxes/mutations";
import { useGetBoxBrandingById } from "@/hooks/integration/boxes/queries";
import { useUpdateBoxBranding } from "@/hooks/integration/boxes/branding-mutations";
import { useUploadFile } from "@/hooks/integration/upload/upload-file";
import {
  useGetFeedbackOptionsByBox,
  FeedbackOption,
} from "@/hooks/integration/feedback-options/queries";
import {
  useCreateFeedbackOption,
  useUpdateFeedbackOption,
  useDeleteFeedbackOption,
} from "@/hooks/integration/feedback-options/mutations";
import Boxes from "@/@backend-types/Boxes";
import Image from "next/image";
import notify from "@/utils/notify";
import { Trash2, Plus, Edit } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function EditBoxForm({ box }: { box: Boxes }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToOnboarding = searchParams.get("from") === "onboarding";
  const [name, setName] = useState(box.name);
  const [location, setLocation] = useState(box.location);
  const [slug, setSlug] = useState(box.slug);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateBoxMutation = useUpdateBox();
  const deleteBoxMutation = useDeleteBox();
  const { data: branding, isLoading: brandingLoading } = useGetBoxBrandingById(
    box.id,
  );
  const updateBrandingMutation = useUpdateBoxBranding();
  const uploadFileMutation = useUploadFile();

  // Opções de feedback
  const { data: existingOptions = [], isLoading: optionsLoading } =
    useGetFeedbackOptionsByBox(box.id);
  const createFeedbackOptionMutation = useCreateFeedbackOption();
  const updateFeedbackOptionMutation = useUpdateFeedbackOption();
  const deleteFeedbackOptionMutation = useDeleteFeedbackOption();

  // Estados para nova opção
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionType, setNewOptionType] = useState<
    "criticism" | "suggestion" | "praise"
  >("suggestion");
  const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
  const [editingOptionName, setEditingOptionName] = useState("");
  const [editingOptionType, setEditingOptionType] = useState<
    "criticism" | "suggestion" | "praise"
  >("suggestion");
  const [deleteOptionId, setDeleteOptionId] = useState<number | null>(null);
  const [deleteBoxConfirm, setDeleteBoxConfirm] = useState(false);

  // Valores iniciais do branding
  const initialPrimaryColor = branding?.primary_color || "#3B82F6";
  const initialSecondaryColor = branding?.secondary_color || "#1E40AF";
  const initialClientName = branding?.client_name || "";
  const initialLogoUrl = branding?.logo_url || null;

  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [clientName, setClientName] = useState(initialClientName);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl);

  const inputBase =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  // Atualizar estados quando branding carregar
  useEffect(() => {
    if (branding) {
      // Usar setTimeout para evitar warning do linter
      setTimeout(() => {
        setPrimaryColor(branding.primary_color);
        setSecondaryColor(branding.secondary_color);
        setClientName(branding.client_name || "");
        if (branding.logo_url) {
          setLogoPreview(branding.logo_url);
          setUploadedLogoUrl(branding.logo_url);
        }
      }, 0);
    }
  }, [branding]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload automático assim que a imagem for anexada
      try {
        const uploadedFile = await uploadFileMutation.mutateAsync(file);
        setUploadedLogoUrl(uploadedFile.url);
        notify("Imagem enviada com sucesso!", "success");
      } catch (error) {
        console.error(error);
        notify("Erro ao enviar imagem", "error");
        // Limpar o preview em caso de erro
        setLogoPreview(initialLogoUrl);
        setUploadedLogoUrl(null);
      }
    }
  };

  const handleAddOption = async () => {
    if (!newOptionName.trim()) {
      notify("Nome da opção é obrigatório", "error");
      return;
    }

    // Verifica se já existe uma opção com o mesmo nome
    const existingOption = existingOptions.find(
      (opt) =>
        opt.name.toLowerCase().trim() === newOptionName.toLowerCase().trim(),
    );

    if (existingOption) {
      notify("Já existe uma opção com este nome", "error");
      return;
    }

    try {
      await createFeedbackOptionMutation.mutateAsync({
        name: newOptionName.trim(),
        type: newOptionType,
        box_id: box.id,
      });
      setNewOptionName("");
      setNewOptionType("suggestion");
      notify("Opção adicionada com sucesso!", "success");
    } catch {
      notify("Erro ao adicionar opção", "error");
    }
  };

  const handleStartEdit = (option: FeedbackOption) => {
    setEditingOptionId(option.id);
    setEditingOptionName(option.name);
    setEditingOptionType(option.type);
  };

  const handleSaveEdit = async () => {
    if (!editingOptionId || !editingOptionName.trim()) {
      notify("Nome da opção é obrigatório", "error");
      return;
    }

    try {
      await updateFeedbackOptionMutation.mutateAsync({
        id: editingOptionId,
        data: {
          name: editingOptionName.trim(),
          type: editingOptionType,
        },
      });
      setEditingOptionId(null);
      setEditingOptionName("");
      setEditingOptionType("suggestion");
      notify("Opção atualizada com sucesso!", "success");
    } catch {
      notify("Erro ao atualizar opção", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditingOptionId(null);
    setEditingOptionName("");
    setEditingOptionType("suggestion");
  };

  const handleConfirmDeleteOption = async () => {
    if (deleteOptionId == null) return;
    try {
      await deleteFeedbackOptionMutation.mutateAsync(deleteOptionId);
      notify("Opção excluída com sucesso!", "success");
      setDeleteOptionId(null);
    } catch {
      notify("Erro ao excluir opção", "error");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      // Atualizar a box
      await updateBoxMutation.mutateAsync({
        id: box.id,
        name,
        location,
        slug,
      });

      // Usar a URL já enviada ou manter a existente
      const logoUrl: string | undefined = uploadedLogoUrl
        ? uploadedLogoUrl
        : branding?.logo_url
          ? branding.logo_url
          : undefined;

      // Atualizar o branding (cria se não existir)
      await updateBrandingMutation.mutateAsync({
        box_id: box.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        client_name: clientName || undefined,
      });

      notify("Caixa atualizada com sucesso!", "success");
      router.push(
        returnToOnboarding ? "/admin/onboarding?step=3" : "/admin/boxes",
      );
    } catch (error) {
      console.error(error);
      notify("Erro ao atualizar caixa", "error");
    }
  }

  async function handleConfirmDeleteBox() {
    try {
      await deleteBoxMutation.mutateAsync(box.id);
      notify("Caixa excluída com sucesso!", "success");
      setDeleteBoxConfirm(false);
      router.push(
        returnToOnboarding ? "/admin/onboarding?step=3" : "/admin/boxes",
      );
    } catch (error) {
      console.error(error);
      notify("Erro ao excluir caixa", "error");
    }
  }

  const isLoading =
    updateBoxMutation.isPending ||
    updateBrandingMutation.isPending ||
    uploadFileMutation.isPending ||
    brandingLoading ||
    optionsLoading;

  const getSubmitButtonText = () => {
    if (uploadFileMutation.isPending) return "Enviando imagem...";
    if (isLoading) return "Salvando...";
    return "Salvar alterações";
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Preview do Logo no topo */}
      <div className="mb-6">
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {logoPreview ? (
            <div className="space-y-4 w-full">
              <div className="flex justify-center">
                <Image
                  src={logoPreview}
                  alt="Preview do logo"
                  width={300}
                  height={300}
                  className="max-w-full h-48 object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadFileMutation.isPending}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadFileMutation.isPending ? "Enviando..." : "Trocar imagem"}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="text-gray-400 text-sm">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadFileMutation.isPending}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadFileMutation.isPending
                  ? "Enviando..."
                  : "Selecionar logo"}
              </button>
            </div>
          )}
          <p className="mt-3 text-xs text-gray-500">
            Envie um logo em PNG, JPG ou WEBP. Recomendado 512x512.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações básicas */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Informações Básicas
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da caixa *
            </label>
            <input
              type="text"
              placeholder="Nome da caixa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`w-full ${inputBase}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localização *
            </label>
            <input
              type="text"
              placeholder="Localização"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className={`w-full ${inputBase}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL amigável (slug) - opcional
            </label>
            <input
              type="text"
              placeholder="URL amigável (slug)"
              value={slug}
              onChange={(e) => {
                const limpa = e.target.value.replace(/[^a-zA-Z0-9_-]/g, "");
                setSlug(limpa);
              }}
              className={`w-full ${inputBase}`}
            />
            <small className="text-xs text-gray-500">
              Pode usar apenas letras, números, hífen (-) e underline (_). Deixe
              em branco para gerar automaticamente.
            </small>
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-800">Branding</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor Primária *
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3B82F6"
                  className={`flex-1 ${inputBase}`}
                />
              </div>
              <small className="text-xs text-gray-500 mt-1 block">
                Cor principal usada em botões, links e elementos de destaque da
                interface.
              </small>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor Secundária *
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-16 h-10 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#1E40AF"
                  className={`flex-1 ${inputBase}`}
                />
              </div>
              <small className="text-xs text-gray-500 mt-1 block">
                Cor complementar usada em hover, bordas e elementos secundários
                da interface.
              </small>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Sugestões de paleta: Primária #2563EB, Secundária #1E40AF.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Cliente (opcional)
            </label>
            <input
              type="text"
              placeholder="Nome do cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={`w-full ${inputBase}`}
            />
          </div>
        </div>

        {/* Opções de Feedback */}
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Opções de Feedback
          </h2>

          {/* Adicionar nova opção */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Nome da opção (ex: Atendimento, Produto, etc.)"
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
                className={`flex-1 ${inputBase}`}
              />
              <select
                value={newOptionType}
                onChange={(e) =>
                  setNewOptionType(
                    e.target.value as "criticism" | "suggestion" | "praise",
                  )
                }
                className={`${inputBase} sm:min-w-[150px] w-full sm:w-auto`}
              >
                <option value="criticism">Crítica</option>
                <option value="suggestion">Sugestão</option>
                <option value="praise">Elogio</option>
              </select>
              <button
                type="button"
                onClick={handleAddOption}
                disabled={createFeedbackOptionMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap w-full sm:w-auto"
              >
                <Plus size={18} />
                Adicionar
              </button>
            </div>
            <small className="text-xs text-gray-500">
              O slug será gerado automaticamente a partir do nome. Não é
              possível ter duas opções com o mesmo nome.
            </small>
          </div>

          {/* Lista de opções existentes */}
          {existingOptions.length > 0 && (
            <div className="space-y-2">
              {existingOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  {editingOptionId === option.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editingOptionName}
                        onChange={(e) => setEditingOptionName(e.target.value)}
                        className={`flex-1 ${inputBase}`}
                      />
                      <select
                        value={editingOptionType}
                        onChange={(e) =>
                          setEditingOptionType(
                            e.target.value as
                              | "criticism"
                              | "suggestion"
                              | "praise",
                          )
                        }
                        className={inputBase}
                      >
                        <option value="criticism">Crítica</option>
                        <option value="suggestion">Sugestão</option>
                        <option value="praise">Elogio</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={updateFeedbackOptionMutation.isPending}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">
                          {option.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          (
                          {option.type === "criticism"
                            ? "Crítica"
                            : option.type === "suggestion"
                              ? "Sugestão"
                              : "Elogio"}
                          )
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(option)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Editar opção"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteOptionId(option.id)}
                          disabled={deleteFeedbackOptionMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                          title="Excluir opção"
                          aria-label="Excluir opção de feedback"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {existingOptions.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhuma opção adicionada. Adicione opções de feedback que os
              usuários poderão selecionar.
            </p>
          )}
        </div>

        {/* Erros */}
        {(updateBoxMutation.error ||
          updateBrandingMutation.error ||
          uploadFileMutation.error) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {updateBoxMutation.error?.message ||
              updateBrandingMutation.error?.message ||
              uploadFileMutation.error?.message ||
              "Erro ao atualizar caixa"}
          </div>
        )}

        {/* Botões */}
        <div className="space-y-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
          >
            {getSubmitButtonText()}
          </button>

          <button
            type="button"
            onClick={() => setDeleteBoxConfirm(true)}
            disabled={deleteBoxMutation.isPending || isLoading}
            className="w-full bg-red-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            aria-label="Excluir caixa"
          >
            {deleteBoxMutation.isPending ? "Excluindo..." : "Excluir caixa"}
          </button>
        </div>
      </form>

      <ConfirmModal
        open={!!deleteOptionId}
        title="Excluir opção"
        description="Tem certeza que deseja excluir esta opção de feedback? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDeleteOption}
        onCancel={() => setDeleteOptionId(null)}
        isLoading={deleteFeedbackOptionMutation.isPending}
      />
      <ConfirmModal
        open={deleteBoxConfirm}
        title="Excluir caixa"
        description={`Tem certeza que deseja excluir a caixa "${box.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDeleteBox}
        onCancel={() => setDeleteBoxConfirm(false)}
        isLoading={deleteBoxMutation.isPending}
      />
    </div>
  );
}
