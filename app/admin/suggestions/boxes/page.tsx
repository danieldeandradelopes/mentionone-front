"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import BoxesList from "./BoxesList";
import { useGetBoxes } from "@/hooks/integration/boxes/queries";
import { usePlanFeatures } from "@/hooks/utils/use-plan-features";
import UpgradeBanner from "@/components/UpgradeBanner";
import { Plus } from "lucide-react";

function BoxesHeaderClient() {
  const { data: boxes = [] } = useGetBoxes();
  const { hasBoxLimit, getMaxBoxes } = usePlanFeatures();

  const maxBoxes = getMaxBoxes();
  const currentBoxes = boxes.length;
  const canCreateMore =
    !hasBoxLimit() || (maxBoxes !== null && currentBoxes < maxBoxes);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Caixas</h1>
          {hasBoxLimit() && maxBoxes !== null && (
            <p className="text-sm text-gray-500 mt-1">
              {currentBoxes} de {maxBoxes} caixas
            </p>
          )}
        </div>
        {canCreateMore ? (
          <Link
            href="/admin/suggestions/boxes/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Criar caixa
          </Link>
        ) : (
          <button
            disabled
            className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
          >
            Limite atingido
          </button>
        )}
      </div>

      {!canCreateMore && (
        <UpgradeBanner
          message={`Você atingiu o limite de ${maxBoxes} caixa(s) do seu plano. Faça upgrade para criar mais caixas.`}
        />
      )}
    </>
  );
}

const BoxesHeader = dynamic(() => Promise.resolve(BoxesHeaderClient), {
  ssr: false,
});

export default function SuggestionsBoxesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <BoxesHeader />
      <BoxesList />
    </div>
  );
}
