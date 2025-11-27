"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUpdateEnterprise } from "@/hooks/integration/enterprise/mutations";
import { useGetEnterpriseSettings } from "@/hooks/integration/enterprise/queries";
import Enterprise from "@/src/@backend-types/Enterprise";
import notify from "@/utils/notify";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type EnterpriseFormData = Partial<
  Pick<
    Enterprise,
    "name" | "cover" | "address" | "description" | "email" | "timezone"
  >
>;

export default function SettingsPage() {
  const { data: enterprise, isLoading } = useGetEnterpriseSettings();
  const updateEnterpriseMutation = useUpdateEnterprise();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EnterpriseFormData>({
    defaultValues: {
      name: "",
      cover: null,
      address: null,
      description: null,
      email: null,
      timezone: "America/Sao_Paulo",
    },
  });

  // Estado local apenas para preview da imagem quando o usuário digita
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Valor inicial do preview baseado no enterprise
  const initialCoverPreview = useMemo(
    () => enterprise?.cover || null,
    [enterprise?.cover]
  );

  // Atualiza o formulário quando os dados carregarem
  useEffect(() => {
    if (enterprise) {
      const formData = {
        name: enterprise.name || "",
        cover: enterprise.cover || null,
        address: enterprise.address || null,
        description: enterprise.description || null,
        email: enterprise.email || null,
        timezone: enterprise.timezone || "America/Sao_Paulo",
      };
      reset(formData);
    }
  }, [enterprise, reset]);

  // Preview da imagem: usa o valor digitado ou o valor inicial
  const displayCover = coverPreview || initialCoverPreview;

  const onSubmit = async (data: EnterpriseFormData) => {
    try {
      await updateEnterpriseMutation.mutateAsync(data);
      notify("Configurações da empresa atualizadas com sucesso!", "success");
    } catch (error) {
      console.error(error);
      notify("Erro ao atualizar configurações da empresa", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Informações da Empresa
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa *
            </label>
            <input
              type="text"
              required
              className="w-full border p-2 rounded"
              {...register("name", { required: true })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              {...register("address")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              className="w-full border p-2 rounded"
              rows={4}
              {...register("description")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              className="w-full border p-2 rounded"
              {...register("email")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da Imagem de Capa
            </label>
            <input
              type="url"
              className="w-full border p-2 rounded"
              {...register("cover", {
                onChange: (e) => {
                  setCoverPreview(e.target.value || null);
                },
              })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {displayCover && (
              <div className="mt-2">
                <Image
                  src={displayCover}
                  alt="Preview da capa"
                  width={100}
                  height={100}
                  className="max-w-md h-48 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || updateEnterpriseMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting || updateEnterpriseMutation.isPending
              ? "Salvando..."
              : "Salvar Alterações"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
