// app/api/boxes/[id]/route.ts
import { NextResponse } from "next/server";
import { getBoxById, updateBox, deleteBox } from "@/lib/boxes";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const box = await getBoxById(params.id);

  if (!box) {
    return NextResponse.json({ error: "Box não encontrada" }, { status: 404 });
  }

  return NextResponse.json(box);
}

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json();

  const updated = await updateBox(params.id, body);

  if (!updated) {
    return NextResponse.json({ error: "Box não encontrada" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const deleted = await deleteBox(params.id);

  if (!deleted) {
    return NextResponse.json({ error: "Box não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
