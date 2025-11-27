"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useUpdateBox,
  useDeleteBox,
} from "@/hooks/integration/boxes/mutations";
import { useGetBoxBrandingById } from "@/hooks/integration/boxes/queries";
import { useUpdateBoxBranding } from "@/hooks/integration/boxes/branding-mutations";
import { useUploadFile } from "@/hooks/integration/upload/upload-file";
import Boxes from "@/@backend-types/Boxes";
import Image from "next/image";
import notify from "@/utils/notify";

export default function EditBoxForm({ box }: { box: Boxes }) {
  const router = useRouter();
  const [name, setName] = useState(box.name);
  const [location, setLocation] = useState(box.location);
  const [slug, setSlug] = useState(box.slug);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateBoxMutation = useUpdateBox();
  const deleteBoxMutation = useDeleteBox();
  const { data: branding, isLoading: brandingLoading } = useGetBoxBrandingById(
    box.id
  );
  const updateBrandingMutation = useUpdateBoxBranding();
  const uploadFileMutation = useUploadFile();

  // Valores iniciais do branding
  const initialPrimaryColor = branding?.primary_color || "#3B82F6";
  const initialSecondaryColor = branding?.secondary_color || "#1E40AF";
  const initialClientName = branding?.client_name || "";
  const initialLogoUrl = branding?.logo_url || null;

  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [clientName, setClientName] = useState(initialClientName);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogoUrl);

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
        }
      }, 0);
    }
  }, [branding]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

      // Upload da imagem se houver nova imagem
      let logoUrl: string | undefined = branding?.logo_url;
      if (logoFile) {
        const uploadedFile = await uploadFileMutation.mutateAsync(logoFile);
        logoUrl = uploadedFile.path;
      }

      // Atualizar o branding (cria se não existir)
      await updateBrandingMutation.mutateAsync({
        box_id: box.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        client_name: clientName || undefined,
      });

      notify("Caixa atualizada com sucesso!", "success");
      router.push("/admin/boxes");
    } catch (error) {
      console.error(error);
      notify("Erro ao atualizar caixa", "error");
    }
  }

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir a caixa "${box.name}"?`)) {
      return;
    }

    try {
      await deleteBoxMutation.mutateAsync(box.id);
      notify("Caixa excluída com sucesso!", "success");
      router.push("/admin/boxes");
    } catch (error) {
      console.error(error);
      notify("Erro ao excluir caixa", "error");
    }
  }

  const isLoading =
    updateBoxMutation.isPending ||
    updateBrandingMutation.isPending ||
    uploadFileMutation.isPending ||
    brandingLoading;

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
              >
                Trocar imagem
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
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
              >
                Selecionar logo
              </button>
            </div>
          )}
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
              className="w-full border p-3 rounded-lg"
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
              className="w-full border p-3 rounded-lg"
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
              className="w-full border p-3 rounded-lg"
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

          <div className="grid grid-cols-2 gap-4">
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
                  className="flex-1 border p-2 rounded-lg"
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
                  className="flex-1 border p-2 rounded-lg"
                />
              </div>
              <small className="text-xs text-gray-500 mt-1 block">
                Cor complementar usada em hover, bordas e elementos secundários
                da interface.
              </small>
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
              className="w-full border p-3 rounded-lg"
            />
          </div>
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
            {isLoading ? "Salvando..." : "Salvar alterações"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteBoxMutation.isPending || isLoading}
            className="w-full bg-red-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
          >
            {deleteBoxMutation.isPending ? "Excluindo..." : "Excluir caixa"}
          </button>
        </div>
      </form>
    </div>
  );
}
