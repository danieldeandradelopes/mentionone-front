"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CampaignForm from "../../CampaignForm";
import { useGetNPSCampaign } from "@/hooks/integration/nps-campaigns/queries";
import { useUpdateNPSCampaign } from "@/hooks/integration/nps-campaigns/mutations";
import notify from "@/utils/notify";

export default function EditNPSCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const campaignId = Number(id);
  const router = useRouter();
  const { data: campaign, isLoading, error } = useGetNPSCampaign(campaignId);
  const updateMutation = useUpdateNPSCampaign();

  const handleSubmit = async (data: {
    name: string;
    slug?: string;
    active?: boolean;
    questions: { title: string; type: "nps" | "multiple_choice"; order?: number; options?: { label: string; order?: number }[] }[];
  }) => {
    await updateMutation.mutateAsync({ id: campaignId, data });
    notify("Campanha atualizada!", "success");
    router.push("/admin/nps/campaigns");
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-10 text-gray-500">
        Carregando campanha...
      </div>
    );
  }
  if (error || !campaign) {
    return (
      <div className="max-w-3xl mx-auto py-10 text-red-600">
        Campanha não encontrada.
        <Link
          href="/admin/nps/campaigns"
          className="block mt-2 text-indigo-600 hover:underline"
        >
          Voltar às campanhas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/admin/nps/campaigns"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={18} />
        Voltar às campanhas
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Editar campanha: {campaign.name}
      </h1>
      <CampaignForm
        initialData={campaign}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="Salvar alterações"
      />
      {updateMutation.isError && (
        <p className="mt-4 text-sm text-red-600">
          {updateMutation.error?.message}
        </p>
      )}
    </div>
  );
}
