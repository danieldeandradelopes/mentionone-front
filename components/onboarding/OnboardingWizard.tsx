"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCompleteOnboarding } from "@/hooks/integration/auth/mutations";
import { useGetEnterpriseSettings } from "@/hooks/integration/enterprise/queries";
import { useUpdateEnterprise } from "@/hooks/integration/enterprise/mutations";
import { useCreateBox } from "@/hooks/integration/boxes/mutations";
import { useCreateBoxBranding } from "@/hooks/integration/boxes/branding-mutations";
import { useCreateFeedbackOption } from "@/hooks/integration/feedback-options/mutations";
import { useGetBox } from "@/hooks/integration/boxes/queries";
import notify from "@/utils/notify";
import { X, ChevronLeft } from "lucide-react";
import QRCode from "qrcode-generator";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_KEYS } from "@/hooks/integration/auth/keys";
import type { BoxesStoreData } from "@/@backend-types/Boxes";

const STEPS = [
  { id: 1, title: "Boas-vindas" },
  { id: 2, title: "Configurar empresa" },
  { id: 3, title: "Criar primeira box" },
  { id: 4, title: "Concluído" },
];

function getPublicUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

interface OnboardingWizardProps {
  onClose: () => void;
}

export default function OnboardingWizard({ onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [createdBoxId, setCreatedBoxId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const completeOnboarding = useCompleteOnboarding();
  const { data: enterprise, isLoading: loadingEnterprise } =
    useGetEnterpriseSettings();
  const updateEnterprise = useUpdateEnterprise();
  const createBox = useCreateBox({ redirectOnSuccess: false });
  const createBranding = useCreateBoxBranding();
  const createFeedbackOption = useCreateFeedbackOption();
  const { data: box } = useGetBox(createdBoxId ?? 0);

  const [enterpriseName, setEnterpriseName] = useState("");
  const [enterpriseAddress, setEnterpriseAddress] = useState("");
  const [enterpriseDescription, setEnterpriseDescription] = useState("");
  const [enterpriseEmail, setEnterpriseEmail] = useState("");
  const [enterpriseTimezone, setEnterpriseTimezone] =
    useState("America/Sao_Paulo");

  const [boxName, setBoxName] = useState("");
  const [boxLocation, setBoxLocation] = useState("");
  const [boxSlug, setBoxSlug] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [secondaryColor, setSecondaryColor] = useState("#1E40AF");
  const [feedbackOptionName, setFeedbackOptionName] =
    useState("Feedback geral");

  useEffect(() => {
    if (enterprise) {
      setEnterpriseName(enterprise.name || "");
      setEnterpriseAddress(enterprise.address || "");
      setEnterpriseDescription(enterprise.description || "");
      setEnterpriseEmail(enterprise.email || "");
      setEnterpriseTimezone(enterprise.timezone || "America/Sao_Paulo");
    }
  }, [enterprise]);

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEnterprise.mutateAsync({
        name: enterpriseName,
        address: enterpriseAddress || undefined,
        description: enterpriseDescription || undefined,
        email: enterpriseEmail || undefined,
        timezone: enterpriseTimezone,
      });
      notify("Empresa atualizada!", "success");
      setStep(3);
    } catch (err) {
      console.error(err);
      notify("Erro ao salvar empresa.", "error");
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBox = await createBox.mutateAsync({
        name: boxName,
        location: boxLocation,
        slug: boxSlug || undefined,
        enterprise_id: 0,
      } as BoxesStoreData);
      await createBranding.mutateAsync({
        box_id: newBox.id,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });
      await createFeedbackOption.mutateAsync({
        name: feedbackOptionName,
        type: "suggestion",
        box_id: newBox.id,
      });
      setCreatedBoxId(newBox.id);
      notify("Caixa criada!", "success");
      setStep(4);
    } catch (err) {
      console.error(err);
      notify("Erro ao criar caixa.", "error");
    }
  };

  const handleFinish = async () => {
    try {
      await completeOnboarding.mutateAsync();
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.userSession() });
      notify("Onboarding concluído!", "success");
      onClose();
    } catch (err) {
      console.error(err);
      notify("Erro ao concluir.", "error");
    }
  };

  const boxUrl = box?.slug ? `${getPublicUrl()}/qr/${box.slug}` : "";
  const qrSvg = useMemo(() => {
    if (!boxUrl) return "";
    const qr = QRCode(0, "L");
    qr.addData(boxUrl);
    qr.make();
    return qr.createSvgTag({ cellSize: 6, margin: 4 });
  }, [boxUrl]);

  const isStep2Submitting = updateEnterprise.isPending;
  const isStep3Submitting =
    createBox.isPending ||
    createBranding.isPending ||
    createFeedbackOption.isPending;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Configuração inicial"
    >
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 p-4 border-b border-gray-200 bg-white rounded-t-xl">
          <div className="flex items-center gap-2">
            {STEPS.map((s) => (
              <span
                key={s.id}
                className={`text-xs font-medium ${
                  step === s.id
                    ? "text-indigo-600"
                    : step > s.id
                      ? "text-gray-500"
                      : "text-gray-400"
                }`}
              >
                {s.id}. {s.title}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">
                Bem-vindo ao MentionOne
              </h2>
              <p className="text-gray-600">
                Em poucos passos você configura sua empresa e a primeira caixa
                de feedback. Depois é só compartilhar o QR Code e começar a
                receber menções.
              </p>
              <Button
                type="button"
                onClick={() => setStep(2)}
                className="w-full"
              >
                Começar
              </Button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">
                Configurar empresa
              </h2>
              {loadingEnterprise ? (
                <p className="text-gray-500">Carregando...</p>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da empresa *
                    </label>
                    <input
                      type="text"
                      required
                      value={enterpriseName}
                      onChange={(e) => setEnterpriseName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={enterpriseAddress}
                      onChange={(e) => setEnterpriseAddress(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      rows={3}
                      value={enterpriseDescription}
                      onChange={(e) => setEnterpriseDescription(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={enterpriseEmail}
                      onChange={(e) => setEnterpriseEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fuso horário
                    </label>
                    <select
                      value={enterpriseTimezone}
                      onChange={(e) => setEnterpriseTimezone(e.target.value)}
                      className={inputClass}
                    >
                      <option value="America/Sao_Paulo">São Paulo</option>
                      <option value="America/Fortaleza">Fortaleza</option>
                      <option value="America/Manaus">Manaus</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                    >
                      <ChevronLeft size={18} /> Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isStep2Submitting}
                      className="flex-1"
                    >
                      {isStep2Submitting ? "Salvando..." : "Continuar"}
                    </Button>
                  </div>
                </>
              )}
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">
                Criar primeira box
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da caixa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atendimento"
                  value={boxName}
                  onChange={(e) => setBoxName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Balcão principal"
                  value={boxLocation}
                  onChange={(e) => setBoxLocation(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL amigável (slug) – opcional
                </label>
                <input
                  type="text"
                  placeholder="Ex: atendimento"
                  value={boxSlug}
                  onChange={(e) =>
                    setBoxSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
                  }
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor primária
                  </label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full h-10 rounded border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor secundária
                  </label>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full h-10 rounded border"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da opção de feedback
                </label>
                <input
                  type="text"
                  value={feedbackOptionName}
                  onChange={(e) => setFeedbackOptionName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                >
                  <ChevronLeft size={18} /> Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={isStep3Submitting}
                  className="flex-1"
                >
                  {isStep3Submitting ? "Criando..." : "Criar e continuar"}
                </Button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Tudo pronto!</h2>
              <p className="text-gray-600">
                Sua primeira caixa foi criada. Escaneie o QR Code abaixo para
                acessar o formulário de feedback.
              </p>
              {boxUrl && qrSvg && (
                <Card className="p-4 flex flex-col items-center">
                  <div
                    className="bg-white p-4 rounded-lg border"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                  <p className="text-sm text-gray-500 mt-2 break-all text-center">
                    {boxUrl}
                  </p>
                </Card>
              )}
              <Button type="button" onClick={handleFinish} className="w-full">
                Ir para o dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
