"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/utils/use-auth";
import { useGetPlans } from "@/hooks/integration/plans/queries";
import { useGetPayments } from "@/hooks/integration/payments/queries";
import { useCreateCheckout } from "@/hooks/integration/payments/mutations";
import { useGetSubscription } from "@/hooks/integration/subscription/queries";
import { useCancelSubscription } from "@/hooks/integration/subscription/mutations";
import {
  maskCep,
  maskCpfCnpj,
  maskPhone,
  onlyDigits,
  validateCpfCnpj,
} from "@/utils/cpf-cnpj";
import payment from "payment";

type FormState = {
  planPriceId: number | "";
  cardHolderName: string;
  cardNumber: string;
  cardExpiryMonth: string;
  cardExpiryYear: string;
  cardCvv: string;
  holderName: string;
  holderEmail: string;
  holderCpfCnpj: string;
  holderPhone: string;
  holderPostalCode: string;
  holderAddress: string;
  holderAddressNumber: string;
  holderComplement: string;
  holderProvince: string;
};

export default function PaymentsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: plans = [], isLoading: loadingPlans } = useGetPlans();
  const { data: payments = [], isLoading: loadingPayments } = useGetPayments();
  const { data: subscription } = useGetSubscription();
  const checkoutMutation = useCreateCheckout();
  const cancelMutation = useCancelSubscription();
  const [cepLoading, setCepLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [renewalNotice, setRenewalNotice] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    planPriceId: "",
    cardHolderName: "",
    cardNumber: "",
    cardExpiryMonth: "",
    cardExpiryYear: "",
    cardCvv: "",
    holderName: "",
    holderEmail: "",
    holderCpfCnpj: "",
    holderPhone: "",
    holderPostalCode: "",
    holderAddress: "",
    holderAddressNumber: "",
    holderComplement: "",
    holderProvince: "",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        !subscription?.expires_at ||
        subscription.billing_cycle !== "yearly"
      ) {
        setRenewalNotice(null);
        return;
      }

      const expiresAt = new Date(subscription.expires_at);
      if (Number.isNaN(expiresAt.getTime())) {
        setRenewalNotice(null);
        return;
      }

      const diffDays = Math.ceil(
        (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays > 30) {
        setRenewalNotice(null);
        return;
      }

      setRenewalNotice(
        `Seu plano anual renova em ${expiresAt.toLocaleDateString(
          "pt-BR",
        )}. Faltam ${Math.max(diffDays, 0)} dias.`,
      );
    }, 0);

    return () => clearTimeout(timer);
  }, [subscription]);

  const planOptions = useMemo(() => {
    return plans.flatMap((plan) =>
      plan.plan_price.map((price) => ({
        id: price.id,
        planName: plan.name,
        description: plan.description,
        billingCycle: price.billing_cycle,
        price: price.price,
      })),
    );
  }, [plans]);

  const selectedPlan = useMemo(
    () => planOptions.find((plan) => plan.id === form.planPriceId),
    [planOptions, form.planPriceId],
  );

  const handleChange = (field: keyof FormState) => {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };
  };

  const handleCpfCnpjChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      holderCpfCnpj: maskCpfCnpj(event.target.value),
    }));
    setFieldErrors((prev) => ({ ...prev, holderCpfCnpj: "" }));
  };

  const handleCardNumberChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const formatted = payment.fns.formatCardNumber(event.target.value);
    const brand = payment.fns.cardType(formatted);
    setForm((prev) => ({ ...prev, cardNumber: formatted }));
    setCardBrand(brand ? brand.toUpperCase() : null);
    setFieldErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  const getCardBrandStyle = (brand?: string | null) => {
    switch (brand) {
      case "VISA":
        return "bg-blue-100 text-blue-700";
      case "MASTERCARD":
        return "bg-red-100 text-red-700";
      case "AMEX":
        return "bg-emerald-100 text-emerald-700";
      case "ELO":
        return "bg-yellow-100 text-yellow-700";
      case "HIPERCARD":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const renderCardBrandIcon = (brand?: string | null) => {
    switch (brand) {
      case "VISA":
        return (
          <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden>
            <rect width="24" height="16" rx="3" fill="#1A1F71" />
            <path
              d="M9.2 11.8 10.4 4.2h1.8l-1.2 7.6H9.2zM6.7 4.2 5 9.4 4.8 8.5 4.1 6c-.1-.4-.3-.6-.7-.8H1.3l.1-.1h2.3c.3 0 .6.2.7.6l.8 3.2 1-3.8h1.5zm10.6 7.6h-1.6l-.2-.9h-2.2l-.3.9h-1.7l2.4-7.6h2l1.6 7.6zm-3.3-2.3h1.4l-.6-2.7-.8 2.7zm8.4-.6c0-2-2.8-2.1-2.8-3 0-.3.3-.6 1-.7.3 0 .9-.1 1.7.3l.3-1.4c-.4-.1-1-.3-1.8-.3-1.9 0-3.2 1-3.2 2.5 0 1.1 1 1.7 1.7 2.1.7.3 1 .5 1 .8 0 .4-.5.6-1 .6-.8 0-1.3-.2-1.8-.5l-.3 1.5c.4.2 1.1.4 1.9.4 1.9 0 3.2-1 3.3-2.3z"
              fill="#fff"
            />
          </svg>
        );
      case "MASTERCARD":
        return (
          <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden>
            <rect width="24" height="16" rx="3" fill="#1F2937" />
            <circle cx="10" cy="8" r="5" fill="#EB001B" />
            <circle cx="14" cy="8" r="5" fill="#F79E1B" />
            <path d="M12 3.5a5 5 0 0 1 0 9 5 5 0 0 1 0-9z" fill="#FF5F00" />
          </svg>
        );
      case "AMEX":
        return (
          <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden>
            <rect width="24" height="16" rx="3" fill="#2E77BC" />
            <path
              d="M4 5h4v1H6v1h2v1H6v1h2v1H4V5zm6 0h3.5l.5 1h-2v1h1.8v1h-1.8v2H10V5zm5 0h2l1.2 3L19.4 5H21l-2 6h-1.3l-2-6z"
              fill="#fff"
            />
          </svg>
        );
      case "ELO":
        return (
          <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden>
            <rect width="24" height="16" rx="3" fill="#111827" />
            <circle cx="8" cy="8" r="4.5" fill="#FCD34D" />
            <circle cx="16" cy="8" r="4.5" fill="#60A5FA" />
          </svg>
        );
      case "HIPERCARD":
        return (
          <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden>
            <rect width="24" height="16" rx="3" fill="#7C3AED" />
            <path d="M5 10V6h1.6v1.4h2.3V6H10v4H8.9V8.6H6.6V10H5zm6.5 0V6H13v1.4h2.1V6H16v4h-1.1V8.6H13V10h-1.5z" fill="#fff" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleCepChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      holderPostalCode: maskCep(event.target.value),
    }));
  };

  useEffect(() => {
    const cep = onlyDigits(form.holderPostalCode);
    if (cep.length !== 8) return;

    let isActive = true;
    const timer = setTimeout(() => {
      if (!isActive) return;
      setCepLoading(true);

      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((response) => response.json())
        .then((data) => {
          if (!isActive || data?.erro) return;
          const bairroUf = data.bairro
            ? `${data.bairro}/${data.uf}`
            : data.uf || "";

          setForm((prev) => ({
            ...prev,
            holderAddress: data.logradouro || prev.holderAddress,
            holderProvince: bairroUf || prev.holderProvince,
          }));
        })
        .catch(() => {
          if (isActive) {
            setMessage({
              type: "error",
              text: "Não foi possível buscar o endereço pelo CEP.",
            });
          }
        })
        .finally(() => {
          if (isActive) {
            setCepLoading(false);
          }
        });
    }, 0);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [form.holderPostalCode]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const mapPaymentStatus = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      case "refunded":
        return "Estornado";
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "past_due":
        return "bg-amber-100 text-amber-700";
      case "canceled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPaymentBadgeClass = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "refunded":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync();
      setMessage({
        type: "success",
        text: "Plano cancelado com sucesso.",
      });
      setShowCancelModal(false);
    } catch (error) {
      const messageText =
        error instanceof Error
          ? error.message
          : "Erro ao cancelar o plano";
      setMessage({ type: "error", text: messageText });
    }
  };

  const handleSubmit = async () => {
    setMessage(null);
    setFieldErrors({});

    if (!form.planPriceId) {
      setMessage({ type: "error", text: "Selecione um plano." });
      return;
    }

    const cardNumberDigits = onlyDigits(form.cardNumber);
    const isLocalhost =
      typeof window !== "undefined" && window.location.hostname === "localhost";
    const expiryYearShort =
      form.cardExpiryYear.length === 2
        ? form.cardExpiryYear
        : form.cardExpiryYear.slice(-2);

    if (
      !payment.fns.validateCardNumber(cardNumberDigits) &&
      !(isLocalhost && cardNumberDigits === "4444444444444444")
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        cardNumber: "Número do cartão inválido.",
      }));
      return;
    }

    if (
      !payment.fns.validateCardExpiry(
        form.cardExpiryMonth,
        expiryYearShort,
      )
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        cardExpiry: "Validade inválida.",
      }));
      return;
    }

    if (
      !payment.fns.validateCardCVC(
        form.cardCvv,
        cardBrand ? cardBrand.toLowerCase() : undefined,
      )
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        cardCvv: "CVV inválido.",
      }));
      return;
    }

    if (!validateCpfCnpj(form.holderCpfCnpj)) {
      setFieldErrors({
        holderCpfCnpj: "CPF/CNPJ inválido.",
      });
      return;
    }

    try {
      await checkoutMutation.mutateAsync({
        plan_price_id: Number(form.planPriceId),
        card: {
          holderName: form.cardHolderName,
          number: cardNumberDigits,
          expiryMonth: form.cardExpiryMonth,
          expiryYear: form.cardExpiryYear,
          ccv: form.cardCvv,
        },
        holder: {
          name: form.holderName,
          email: form.holderEmail,
          cpfCnpj: onlyDigits(form.holderCpfCnpj),
          phone: onlyDigits(form.holderPhone),
          postalCode: onlyDigits(form.holderPostalCode),
          address: form.holderAddress,
          addressNumber: form.holderAddressNumber,
          complement: form.holderComplement || undefined,
          province: form.holderProvince || undefined,
        },
      });

      setMessage({
        type: "success",
        text: "Pagamento iniciado. Aguarde a confirmação.",
      });
      setForm({
        planPriceId: "",
        cardHolderName: "",
        cardNumber: "",
        cardExpiryMonth: "",
        cardExpiryYear: "",
        cardCvv: "",
        holderName: "",
        holderEmail: "",
        holderCpfCnpj: "",
        holderPhone: "",
        holderPostalCode: "",
        holderAddress: "",
        holderAddressNumber: "",
        holderComplement: "",
        holderProvince: "",
      });
      setCardBrand(null);
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Erro ao iniciar pagamento";
      setMessage({ type: "error", text: messageText });
    }
  };

  const isLoading = loadingPlans || loadingPayments;
  const hasActiveSubscription = subscription?.status === "active";
  const isFreePlan =
    !hasActiveSubscription || subscription?.plan_name === "Free";
  const nextDueDate = subscription?.expires_at
    ? new Date(subscription.expires_at)
    : null;
  const nextDueDateLabel = nextDueDate
    ? nextDueDate.toLocaleDateString("pt-BR")
    : "Sem data";
  const planPriceNumber = subscription?.plan_price
    ? Number(String(subscription.plan_price).replace(",", "."))
    : null;
  const planPriceLabel =
    planPriceNumber && !Number.isNaN(planPriceNumber)
      ? formatCurrency(planPriceNumber)
      : "Gratuito";

  const featureItems = subscription?.features
    ? [
        subscription.features.max_boxes
          ? `Até ${subscription.features.max_boxes} caixas`
          : null,
        subscription.features.max_responses_per_month
          ? `Até ${subscription.features.max_responses_per_month} respostas/mês`
          : null,
        subscription.features.can_access_reports ? "Relatórios" : null,
        subscription.features.can_access_advanced_charts
          ? "Gráficos avançados"
          : null,
        subscription.features.can_filter_feedbacks ? "Filtros avançados" : null,
        subscription.features.can_export_csv ? "Exportação CSV" : null,
        subscription.features.show_mentionone_branding
          ? "Branding MentionOne"
          : "Sem branding MentionOne",
      ].filter(Boolean)
    : [];

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold">Pagamentos</h1>
        <p className="text-sm text-gray-500">
          Gerencie sua assinatura, pagamentos e dados de cobrança.
        </p>
      </div>

      {renewalNotice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {renewalNotice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden
              className="text-gray-300"
            >
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2" />
              <path
                d="M8 12l2.5 2.5L16 9"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="mt-2 text-xs text-gray-400">Plano atual</div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(
                subscription?.status,
              )}`}
            >
              {subscription?.status === "active"
                ? "Ativo"
                : subscription?.status === "past_due"
                ? "Vencido"
                : subscription?.status === "canceled"
                ? "Cancelado"
                : "Sem plano"}
            </span>
          <div className="mt-2 text-sm text-gray-700">
            {subscription?.plan_name || "Plano gratuito"}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {planPriceLabel}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Cobrança</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden
              className="text-gray-300"
            >
              <rect x="3" y="5" width="18" height="14" rx="3" fill="currentColor" opacity="0.2" />
              <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-2 text-sm text-gray-700">
            {subscription?.billing_cycle === "monthly"
              ? "Mensal recorrente"
              : subscription?.billing_cycle === "yearly"
              ? "Anual à vista"
              : "Sem cobrança ativa"}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Próxima cobrança: {nextDueDateLabel}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Ações</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden
              className="text-gray-300"
            >
              <path
                d="M12 3v6l4 2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
            </svg>
          </div>
          <div className="mt-2 flex items-center gap-3">
            {hasActiveSubscription && subscription?.billing_cycle === "monthly" ? (
              <button
                className="rounded-lg border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                onClick={() => setShowCancelModal(true)}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Cancelando..." : "Cancelar plano"}
              </button>
            ) : (
              <span className="text-sm text-gray-500">
                Sem assinatura recorrente ativa
              </span>
            )}
          </div>
        </div>
      </div>

      {isFreePlan && (
        <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-4 text-white shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide">
                Plano gratuito ativo
              </p>
              <p className="text-sm opacity-90">
                Assine um plano para liberar recursos e funcionalidades extras.
              </p>
            </div>
            <button
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
              type="button"
            >
              Ver planos
            </button>
          </div>
        </div>
      )}

      {hasActiveSubscription && (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Plano atual</p>
              <h2 className="text-lg font-semibold text-gray-800">
                {subscription?.plan_name}
              </h2>
              <p className="text-sm text-gray-500">{planPriceLabel}</p>
            </div>
            <div className="hidden md:block">
              <svg
                width="64"
                height="48"
                viewBox="0 0 64 48"
                aria-hidden
                className="text-indigo-200"
              >
                <rect width="64" height="48" rx="10" fill="currentColor" opacity="0.25" />
                <path
                  d="M16 26h32"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="22" cy="18" r="4" fill="currentColor" />
              </svg>
            </div>
          </div>
          {featureItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {featureItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800">
              Cancelar plano recorrente
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Ao cancelar, sua assinatura recorrente será encerrada e você
              perderá acesso aos recursos premium ao final do período atual.
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
              Você poderá reativar a assinatura a qualquer momento.
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelMutation.isPending}
              >
                Voltar
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending
                  ? "Cancelando..."
                  : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section
        className={`grid grid-cols-1 gap-6 ${
          hasActiveSubscription ? "lg:grid-cols-1" : "lg:grid-cols-2"
        }`}
      >
        {!hasActiveSubscription && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Checkout transparente</h2>

            {isLoading ? (
              <p className="text-sm text-gray-500">Carregando...</p>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm">
                  <span className="text-gray-600">Plano</span>
                  <select
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={form.planPriceId}
                    onChange={handleChange("planPriceId")}
                  >
                    <option value="">Selecione um plano</option>
                    {planOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.planName} -{" "}
                        {option.billingCycle === "monthly"
                          ? "Mensal"
                          : "Anual à vista"}{" "}
                        ({formatCurrency(option.price)})
                      </option>
                    ))}
                  </select>
                </label>

                {selectedPlan && (
                  <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                    {selectedPlan.billingCycle === "yearly"
                      ? "Cobrança anual à vista com aviso de renovação."
                      : "Cobrança mensal recorrente com cartão de crédito."}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-gray-600">Nome no cartão</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={form.cardHolderName}
                      onChange={handleChange("cardHolderName")}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Número do cartão</span>
                    <input
                      className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                        fieldErrors.cardNumber
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                      value={form.cardNumber}
                      onChange={handleCardNumberChange}
                    />
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {cardBrand && (
                          <span className="inline-flex items-center gap-2">
                            {renderCardBrandIcon(cardBrand)}
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCardBrandStyle(
                                cardBrand,
                              )}`}
                            >
                              {cardBrand}
                            </span>
                          </span>
                        )}
                      </span>
                      {fieldErrors.cardNumber && (
                        <span className="text-red-600">
                          {fieldErrors.cardNumber}
                        </span>
                      )}
                    </div>
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Validade (MM)</span>
                    <input
                      className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                        fieldErrors.cardExpiry
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                      value={form.cardExpiryMonth}
                      onChange={(event) => {
                        setForm((prev) => ({
                          ...prev,
                          cardExpiryMonth: onlyDigits(event.target.value).slice(
                            0,
                            2,
                          ),
                        }));
                        setFieldErrors((prev) => ({ ...prev, cardExpiry: "" }));
                      }}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Validade (AAAA)</span>
                    <input
                      className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                        fieldErrors.cardExpiry
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                      value={form.cardExpiryYear}
                      onChange={(event) => {
                        setForm((prev) => ({
                          ...prev,
                          cardExpiryYear: onlyDigits(event.target.value).slice(
                            0,
                            4,
                          ),
                        }));
                        setFieldErrors((prev) => ({ ...prev, cardExpiry: "" }));
                      }}
                    />
                    {fieldErrors.cardExpiry && (
                      <span className="mt-1 block text-xs text-red-600">
                        {fieldErrors.cardExpiry}
                      </span>
                    )}
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">CVV</span>
                    <input
                      className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                        fieldErrors.cardCvv
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                      value={form.cardCvv}
                      onChange={(event) => {
                        setForm((prev) => ({
                          ...prev,
                          cardCvv: onlyDigits(event.target.value).slice(0, 4),
                        }));
                        setFieldErrors((prev) => ({ ...prev, cardCvv: "" }));
                      }}
                    />
                    {fieldErrors.cardCvv && (
                      <span className="mt-1 block text-xs text-red-600">
                        {fieldErrors.cardCvv}
                      </span>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-gray-600">Nome completo</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={form.holderName}
                      onChange={handleChange("holderName")}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Email</span>
                    <input
                      type="email"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={form.holderEmail}
                      onChange={handleChange("holderEmail")}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">CPF/CNPJ</span>
                    <input
                      className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                        fieldErrors.holderCpfCnpj
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                      value={form.holderCpfCnpj}
                      onChange={handleCpfCnpjChange}
                    />
                    {fieldErrors.holderCpfCnpj && (
                      <span className="mt-1 block text-xs text-red-600">
                        {fieldErrors.holderCpfCnpj}
                      </span>
                    )}
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Telefone</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={form.holderPhone}
                      onChange={(event) => {
                        setForm((prev) => ({
                          ...prev,
                          holderPhone: maskPhone(event.target.value),
                        }));
                      }}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">CEP</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={form.holderPostalCode}
                      onChange={handleCepChange}
                    />
                    {cepLoading && (
                      <span className="text-xs text-gray-500">
                        Buscando endereço...
                      </span>
                    )}
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Endereço</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={form.holderAddress}
                      onChange={handleChange("holderAddress")}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Número</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={form.holderAddressNumber}
                      onChange={handleChange("holderAddressNumber")}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Complemento</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={form.holderComplement}
                      onChange={handleChange("holderComplement")}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Bairro/UF</span>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      value={form.holderProvince}
                      onChange={handleChange("holderProvince")}
                    />
                  </label>
                </div>

                <button
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                  onClick={handleSubmit}
                  disabled={checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending ? "Processando..." : "Pagar"}
                </button>
              </div>
            )}
          </div>
        )}

        <div
          className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${
            hasActiveSubscription ? "lg:col-span-2" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Histórico</h2>
            <span className="text-xs text-gray-400">
              Últimos pagamentos
            </span>
          </div>
          {loadingPayments ? (
            <p className="text-sm text-gray-500">Carregando...</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhum pagamento encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getPaymentBadgeClass(
                        payment.status,
                      )}`}
                    >
                      {mapPaymentStatus(payment.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {payment.created_at
                      ? new Date(payment.created_at).toLocaleString("pt-BR")
                      : "Data não disponível"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
