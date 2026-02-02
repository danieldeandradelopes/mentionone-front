"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCompleteOnboarding } from "@/hooks/integration/auth/mutations";
import { useGetEnterpriseSettings } from "@/hooks/integration/enterprise/queries";
import { useUpdateEnterprise } from "@/hooks/integration/enterprise/mutations";
import { useGetBoxes } from "@/hooks/integration/boxes/queries";
import { useGetBox } from "@/hooks/integration/boxes/queries";
import { useCreateBox } from "@/hooks/integration/boxes/mutations";
import { useCreateBoxBranding } from "@/hooks/integration/boxes/branding-mutations";
import { useCreateFeedbackOption } from "@/hooks/integration/feedback-options/mutations";
import { useDeleteBox } from "@/hooks/integration/boxes/mutations";
import notify from "@/utils/notify";
import { ChevronLeft, Edit, Trash2, Plus, QrCode } from "lucide-react";
import QRCode from "qrcode-generator";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_KEYS } from "@/hooks/integration/auth/keys";
import type { BoxesStoreData } from "@/@backend-types/Boxes";
import type Boxes from "@/@backend-types/Boxes";

const STEPS = [
  { id: 1, title: "Boas-vindas" },
  { id: 2, title: "Configurar empresa" },
  { id: 3, title: "Sua caixa de feedback" },
  { id: 4, title: "Concluído" },
];

function getPublicUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [createdBoxId, setCreatedBoxId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const completeOnboarding = useCompleteOnboarding();
  const { data: enterprise, isLoading: loadingEnterprise } =
    useGetEnterpriseSettings();
  const updateEnterprise = useUpdateEnterprise();
  const { data: boxes = [], isLoading: loadingBoxes } = useGetBoxes();
  const createBox = useCreateBox({ redirectOnSuccess: false });
  const createBranding = useCreateBoxBranding();
  const createFeedbackOption = useCreateFeedbackOption();
  const deleteBoxMutation = useDeleteBox();

  const existingBox = boxes.length > 0 ? boxes[0] : null;
  const boxIdForQr = createdBoxId ?? existingBox?.id ?? null;
  const { data: boxForQr } = useGetBox(boxIdForQr ?? 0);

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

  // Ao voltar da edição da caixa (ou com ?step= na URL), abrir no passo correto
  useEffect(() => {
    const stepFromUrl = searchParams.get("step");
    if (stepFromUrl) {
      const n = parseInt(stepFromUrl, 10);
      if (n >= 1 && n <= 4) setStep(n);
    }
  }, [searchParams]);

  useEffect(() => {
    if (enterprise) {
      setEnterpriseName(enterprise.name || "");
      setEnterpriseAddress(enterprise.address || "");
      setEnterpriseDescription(enterprise.description || "");
      setEnterpriseEmail(enterprise.email || "");
      setEnterpriseTimezone(enterprise.timezone || "America/Sao_Paulo");
    }
  }, [enterprise]);

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

  const handleStep3Create = async (e: React.FormEvent) => {
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
      setShowCreateForm(false);
      notify("Caixa criada!", "success");
      setStep(4);
    } catch (err) {
      console.error(err);
      notify("Erro ao criar caixa.", "error");
    }
  };

  const handleDeleteBox = async (box: Boxes) => {
    if (!confirm(`Excluir a caixa "${box.name}"? Você poderá criar outra.`))
      return;
    try {
      await deleteBoxMutation.mutateAsync(box.id);
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
      notify("Caixa excluída.", "success");
      setShowCreateForm(true);
    } catch (err) {
      console.error(err);
      notify("Erro ao excluir.", "error");
    }
  };

  const handleStep3Continue = () => {
    setStep(4);
  };

  const handleFinish = async () => {
    try {
      await completeOnboarding.mutateAsync();
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.userSession() });
      notify("Onboarding concluído!", "success");
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      notify("Erro ao concluir.", "error");
    }
  };

  const boxUrl = boxForQr?.slug ? `${getPublicUrl()}/qr/${boxForQr.slug}` : "";
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
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">
          Configuração inicial
        </h1>
        <nav className="flex flex-wrap gap-2 mt-2" aria-label="Passos">
          {STEPS.map((s) => (
            <span
              key={s.id}
              className={`text-sm font-medium ${
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
        </nav>
      </header>

      {step === 1 && (
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-800">
            Bem-vindo ao MentionOne
          </h2>
          <p className="text-gray-600">
            Em poucos passos você configura sua empresa e a caixa de feedback.
            Muitas contas já vêm com uma caixa padrão: você pode editá-la,
            excluí-la ou criar outra.
          </p>
          <Button type="button" onClick={() => setStep(2)} className="w-full">
            Começar
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6">
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
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-800">
            Sua caixa de feedback
          </h2>
          <p className="text-sm text-gray-600">
            Use a caixa que já vem criada por padrão ou exclua e crie uma nova.
          </p>

          {loadingBoxes ? (
            <p className="text-gray-500">Carregando caixas...</p>
          ) : existingBox && !showCreateForm ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <p className="font-semibold text-gray-800">
                  {existingBox.name}
                </p>
                <p className="text-sm text-gray-500">
                  {existingBox.location || "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/boxes/${existingBox.id}/edit?from=onboarding`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  <Edit size={16} />
                  Editar
                </Link>
                <Link
                  href={`/admin/boxes/${existingBox.id}/qrcode`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  <QrCode size={16} />
                  Ver QR Code
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteBox(existingBox)}
                  disabled={deleteBoxMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium text-sm disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {deleteBoxMutation.isPending ? "Excluindo..." : "Excluir"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-sm"
                >
                  <Plus size={16} />
                  Criar nova caixa
                </button>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <Button type="button" onClick={handleStep3Continue}>
                  Continuar para o resumo
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleStep3Create} className="space-y-4">
              <p className="text-sm text-gray-600">
                Preencha os dados da nova caixa.
              </p>
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
                {existingBox && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    <ChevronLeft size={18} /> Voltar
                  </Button>
                )}
                {!existingBox && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    <ChevronLeft size={18} /> Voltar
                  </Button>
                )}
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
        </Card>
      )}

      {step === 4 && (
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Tudo pronto!</h2>
          <p className="text-gray-600">
            Escaneie o QR Code abaixo para acessar o formulário de feedback da
            sua caixa.
          </p>
          {boxUrl && qrSvg && (
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
              <div
                className="bg-white p-4 rounded-lg border"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <p className="text-sm text-gray-500 mt-2 break-all text-center">
                {boxUrl}
              </p>
            </div>
          )}
          <Button type="button" onClick={handleFinish} className="w-full">
            Ir para o dashboard
          </Button>
        </Card>
      )}
    </div>
  );
}

function OnboardingFallback() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-2/3" />
      <div className="h-12 bg-gray-200 rounded w-full" />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingContent />
    </Suspense>
  );
}
