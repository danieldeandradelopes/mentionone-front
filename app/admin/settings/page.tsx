"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUpdateEnterprise } from "@/hooks/integration/enterprise/mutations";
import { useGetEnterpriseSettings } from "@/hooks/integration/enterprise/queries";
import { useUploadFile } from "@/hooks/integration/upload/upload-file";
import Enterprise from "@/src/@backend-types/Enterprise";
import notify from "@/utils/notify";
import {
  maskCpfCnpj,
  onlyDigits,
  validateCpfCnpj,
} from "@/utils/cpf-cnpj";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

type EnterpriseFormData = Partial<
  Pick<
    Enterprise,
    "name" | "cover" | "address" | "description" | "email" | "timezone" | "document"
  >
> & {
  document_type?: "cpf" | "cnpj" | null;
};

export default function SettingsPage() {
  const { data: enterprise, isLoading } = useGetEnterpriseSettings();
  const updateEnterpriseMutation = useUpdateEnterprise();
  const uploadFileMutation = useUploadFile();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<EnterpriseFormData>({
    defaultValues: {
      name: "",
      cover: null,
      address: null,
      description: null,
      email: null,
      document: "",
      timezone: "America/Sao_Paulo",
    },
  });

  // Estados para upload de imagem
  const [uploadedCoverUrl, setUploadedCoverUrl] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza o formulário quando os dados carregarem
  useEffect(() => {
    if (enterprise) {
      const formData = {
        name: enterprise.name || "",
        cover: enterprise.cover || null,
        address: enterprise.address || null,
        description: enterprise.description || null,
        email: enterprise.email || null,
        document: enterprise.document || "",
        timezone: enterprise.timezone || "America/Sao_Paulo",
      };
      reset(formData);

      // Inicializar preview e URL enviada
      if (enterprise.cover) {
        // Usar setTimeout para evitar warning do linter
        setTimeout(() => {
          setCoverPreview(enterprise.cover!);
          setUploadedCoverUrl(enterprise.cover!);
        }, 0);
      }
    }
  }, [enterprise, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload automático assim que a imagem for anexada
      try {
        const uploadedFile = await uploadFileMutation.mutateAsync(file);
        setUploadedCoverUrl(uploadedFile.url);
        notify("Imagem enviada com sucesso!", "success");
      } catch (error) {
        console.error(error);
        notify("Erro ao enviar imagem", "error");
        // Limpar o preview em caso de erro
        setCoverPreview(enterprise?.cover || null);
        setUploadedCoverUrl(null);
      }
    }
  };

  const onSubmit = async (data: EnterpriseFormData) => {
    try {
      // Usar a URL já enviada ou manter a existente
      const coverUrl = uploadedCoverUrl || enterprise?.cover || undefined;
      const documentDigits = onlyDigits(data.document || "");

      if (documentDigits && !validateCpfCnpj(documentDigits)) {
        notify("CPF/CNPJ inválido.", "error");
        return;
      }

      await updateEnterpriseMutation.mutateAsync({
        ...data,
        cover: coverUrl,
        document: documentDigits || undefined,
        document_type: documentDigits
          ? documentDigits.length <= 11
            ? "cpf"
            : "cnpj"
          : undefined,
      });
      notify("Configurações da empresa atualizadas com sucesso!", "success");
    } catch (error) {
      console.error(error);
      notify("Erro ao atualizar configurações da empresa", "error");
    }
  };

  const onInvalid = () => {
    notify("Preencha os campos obrigatórios corretamente.", "error");
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
        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          noValidate
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Empresa *
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Nome da empresa é obrigatório.",
                minLength: {
                  value: 2,
                  message: "Nome da empresa deve ter ao menos 2 caracteres.",
                },
              })}
            />
            {errors.name?.message && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF/CNPJ
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              aria-invalid={!!errors.document}
              {...register("document", {
                validate: (value) => {
                  const documentDigits = onlyDigits(value || "");
                  if (!documentDigits) return true;
                  return (
                    validateCpfCnpj(documentDigits) ||
                    "CPF/CNPJ inválido."
                  );
                },
              })}
              value={watch("document") || ""}
              onChange={(event) =>
                setValue("document", maskCpfCnpj(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
            {errors.document?.message && (
              <p className="text-sm text-red-600 mt-1">
                {errors.document.message}
              </p>
            )}
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
              aria-invalid={!!errors.email}
              {...register("email", {
                validate: (value) => {
                  if (!value) return true;
                  const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  return emailRegex.test(value) || "E-mail inválido.";
                },
              })}
            />
            {errors.email?.message && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem de Capa
            </label>
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {coverPreview ? (
                <div className="space-y-4 w-full">
                  <div className="flex justify-center">
                    <Image
                      src={coverPreview}
                      alt="Preview da capa"
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
                    {uploadFileMutation.isPending
                      ? "Enviando..."
                      : "Trocar imagem"}
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
                      : "Selecionar imagem"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              updateEnterpriseMutation.isPending ||
              uploadFileMutation.isPending
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {uploadFileMutation.isPending
              ? "Enviando imagem..."
              : isSubmitting || updateEnterpriseMutation.isPending
              ? "Salvando..."
              : "Salvar Alterações"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
