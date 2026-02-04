"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateBox } from "@/hooks/integration/boxes/mutations";
import { useGetBoxes } from "@/hooks/integration/boxes/queries";
import { usePlanFeatures } from "@/hooks/utils/use-plan-features";
import { useCreateBoxBranding } from "@/hooks/integration/boxes/branding-mutations";
import { useUploadFile } from "@/hooks/integration/upload/upload-file";
import {
  useCreateFeedbackOption,
  FeedbackOptionData,
} from "@/hooks/integration/feedback-options/mutations";
import Image from "next/image";
import notify from "@/utils/notify";
import { BoxesStoreData } from "@/@backend-types/Boxes";
import { Trash2, Plus } from "lucide-react";

const basePath = "/admin/suggestions/boxes";

export default function NewBoxPage() {
  const router = useRouter();
  const { data: boxes = [] } = useGetBoxes();
  const { hasBoxLimit, getMaxBoxes } = usePlanFeatures();

  const maxBoxes = getMaxBoxes();
  const currentBoxes = boxes.length;
  const canCreateMore = !hasBoxLimit() || (maxBoxes !== null && currentBoxes < maxBoxes);

  useEffect(() => {
    if (!canCreateMore) {
      router.push(basePath);
    }
  }, [canCreateMore, router]);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#1E40AF");
  const [clientName, setClientName] = useState("");
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputBase =
    "rounded-lg border border-gray-300 px-3 py-2 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const [feedbackOptions, setFeedbackOptions] = useState<
    Array<FeedbackOptionData & { tempId?: string }>
  >([]);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionType, setNewOptionType] = useState<
    "criticism" | "suggestion" | "praise"
  >("suggestion");

  const createBoxMutation = useCreateBox();
  const createBrandingMutation = useCreateBoxBranding();
  const uploadFileMutation = useUploadFile();
  const createFeedbackOptionMutation = useCreateFeedbackOption();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      try {
        const uploadedFile = await uploadFileMutation.mutateAsync(file);
        setUploadedLogoUrl(uploadedFile.url);
        notify("Imagem enviada com sucesso!", "success");
      } catch (error) {
        console.error(error);
        notify("Erro ao enviar imagem", "error");
        setLogoPreview(null);
        setUploadedLogoUrl(null);
      }
    }
  };

  const handleAddOption = () => {
    if (!newOptionName.trim()) {
      notify("Nome da opção é obrigatório", "error");
      return;
    }
    const existingOption = feedbackOptions.find(
      (opt) =>
        opt.name.toLowerCase().trim() === newOptionName.toLowerCase().trim()
    );
    if (existingOption) {
      notify("Já existe uma opção com este nome", "error");
      return;
    }
    setFeedbackOptions([
      ...feedbackOptions,
      {
        name: newOptionName.trim(),
        type: newOptionType,
        tempId: Date.now().toString(),
      },
    ]);
    setNewOptionName("");
    setNewOptionType("suggestion");
  };

  const handleRemoveOption = (tempId?: string, index?: number) => {
    if (tempId) {
      setFeedbackOptions(
        feedbackOptions.filter((opt) => opt.tempId !== tempId)
      );
    } else if (index !== undefined) {
      setFeedbackOptions(feedbackOptions.filter((_, i) => i !== index));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const box = await createBoxMutation.mutateAsync({
        name,
        location,
        slug,
        enterprise_id: 0,
      } as BoxesStoreData);
      const logoUrl: string | undefined = uploadedLogoUrl
        ? uploadedLogoUrl
        : undefined;
      await createBrandingMutation.mutateAsync({
        box_id: box.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        client_name: clientName || undefined,
      });
      for (const option of feedbackOptions) {
        await createFeedbackOptionMutation.mutateAsync({
          name: option.name,
          type: option.type,
          box_id: box.id,
        });
      }
      notify("Caixa criada com sucesso!", "success");
      router.push(basePath);
    } catch (error) {
      console.error(error);
      notify("Erro ao criar caixa", "error");
    }
  }

  const isLoading =
    createBoxMutation.isPending ||
    createBrandingMutation.isPending ||
    uploadFileMutation.isPending ||
    createFeedbackOptionMutation.isPending;

  const getSubmitButtonText = () => {
    if (uploadFileMutation.isPending) return "Enviando imagem...";
    if (isLoading) return "Criando...";
    return "Criar Caixa";
  };

  if (!canCreateMore) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Criar nova caixa</h1>
        {hasBoxLimit() && maxBoxes !== null && (
          <p className="text-sm text-gray-500 mb-4">
            {currentBoxes} de {maxBoxes} caixas utilizadas
          </p>
        )}
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
              Pode usar apenas letras, números, hífen (-) e underline (_).
              Deixe em branco para gerar automaticamente.
            </small>
          </div>
        </div>

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
            </div>
          </div>
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

        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Opções de Feedback
          </h2>
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
                  e.target.value as "criticism" | "suggestion" | "praise"
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
            >
              <Plus size={18} />
              Adicionar
            </button>
          </div>
          {feedbackOptions.length > 0 && (
            <div className="space-y-2">
              {feedbackOptions.map((option, index) => (
                <div
                  key={option.tempId || index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
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
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(option.tempId, index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remover opção"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {feedbackOptions.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhuma opção adicionada. Adicione opções de feedback que os
              usuários poderão selecionar.
            </p>
          )}
        </div>

        {(createBoxMutation.error ||
          createBrandingMutation.error ||
          uploadFileMutation.error) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {createBoxMutation.error?.message ||
              createBrandingMutation.error?.message ||
              uploadFileMutation.error?.message ||
              "Erro ao criar caixa"}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
        >
          {getSubmitButtonText()}
        </button>
      </form>
    </div>
  );
}
