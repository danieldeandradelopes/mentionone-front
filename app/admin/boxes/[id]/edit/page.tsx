import { getBoxById } from "@/app/lib/boxes";
import EditBoxForm from "./form";

export default async function EditBoxPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const box = await getBoxById(id as string);

  if (!box) {
    return <p className="p-6">Caixa não encontrada.</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar caixa</h1>

      <EditBoxForm box={box} />
    </div>
  );
}
