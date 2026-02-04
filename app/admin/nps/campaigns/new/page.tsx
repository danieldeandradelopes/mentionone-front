"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CampaignForm from "../CampaignForm";
import { useCreateNPSCampaign } from "@/hooks/integration/nps-campaigns/mutations";
import notify from "@/utils/notify";

export default function NewNPSCampaignPage() {
  const router = useRouter();
  const createMutation = useCreateNPSCampaign();

  const handleSubmit = async (data: {
    name: string;
    slug?: string;
    active?: boolean;
    questions: { title: string; type: "nps" | "multiple_choice"; order?: number; options?: { label: string; order?: number }[] }[];
  }) => {
    await createMutation.mutateAsync(data);
    notify("Campanha criada com sucesso!", "success");
    router.push("/admin/nps/campaigns");
  };

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
        Nova campanha NPS
      </h1>
      <CampaignForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel="Criar campanha"
      />
      {createMutation.isError && (
        <p className="mt-4 text-sm text-red-600">
          {createMutation.error?.message}
        </p>
      )}
    </div>
  );
}
