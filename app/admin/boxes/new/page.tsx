"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateBox } from "@/hooks/integration/boxes/mutations";
import { useCreateBoxBranding } from "@/hooks/integration/boxes/branding-mutations";
import { useUploadFile } from "@/hooks/integration/upload/upload-file";
import Image from "next/image";
import notify from "@/utils/notify";
import { BoxesStoreData } from "@/@backend-types/Boxes";

export default function NewBoxPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [slug, setSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#1E40AF");
  const [clientName, setClientName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBoxMutation = useCreateBox();
  const createBrandingMutation = useCreateBoxBranding();
  const uploadFileMutation = useUploadFile();

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
      // Criar a box primeiro
      // O enterprise_id é obtido automaticamente pelo backend via middleware
      const box = await createBoxMutation.mutateAsync({
        name,
        location,
        slug,
        enterprise_id: 0, // Será ignorado pelo backend, que usa o middleware
      } as BoxesStoreData);

      // Upload da imagem se houver
      let logoUrl: string | undefined;
      if (logoFile) {
        const uploadedFile = await uploadFileMutation.mutateAsync(logoFile);
        logoUrl = uploadedFile.path;
      }

      // Criar o branding
      await createBrandingMutation.mutateAsync({
        box_id: box.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        logo_url: logoUrl,
        client_name: clientName || undefined,
      });

      notify("Caixa criada com sucesso!", "success");

      // Redireciona para a lista após criar tudo
      router.push("/admin/boxes");
    } catch (error) {
      console.error(error);
      notify("Erro ao criar caixa", "error");
    }
  }

  const isLoading =
    createBoxMutation.isPending ||
    createBrandingMutation.isPending ||
    uploadFileMutation.isPending;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Preview do Logo no topo */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Criar nova caixa</h1>
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

        {/* Botão submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
        >
          {isLoading ? "Criando..." : "Criar Caixa"}
        </button>
      </form>
    </div>
  );
}
