// app/api/boxes/[id]/route.ts
import { NextResponse } from "next/server";
import { getBoxById, updateBox, deleteBox } from "@/app/lib/boxes";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const box = await getBoxById(id);

  if (!box) {
    return NextResponse.json({ error: "Box não encontrada" }, { status: 404 });
  }

  return NextResponse.json(box);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const updated = await updateBox(id, body);

  if (!updated) {
    return NextResponse.json({ error: "Box não encontrada" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    console.log(`Tentando excluir box com id: ${id}`);

    const deleted = await deleteBox(id);

    if (!deleted) {
      console.log(`Box com id ${id} não encontrada`);
      return NextResponse.json(
        { error: "Box não encontrada" },
        { status: 404 }
      );
    }

    console.log(`Box ${id} excluída com sucesso`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir box:", error);
    return NextResponse.json(
      {
        error: "Erro ao excluir box",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
