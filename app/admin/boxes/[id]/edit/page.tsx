"use client";

import { use } from "react";
import { useGetBox } from "@/hooks/integration/boxes/queries";
import EditBoxForm from "./form";

export default function EditBoxPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const boxId = Number(id);
  const { data: box, isLoading, error } = useGetBox(boxId);

  if (isLoading) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (error || !box) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <p className="text-red-500">Caixa não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar caixa</h1>

      <EditBoxForm box={box} />
    </div>
  );
}
