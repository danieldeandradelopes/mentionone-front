// app/api/boxes/route.ts
import { NextResponse } from "next/server";
import { getAllBoxes, createBox } from "@/lib/boxes";

export async function GET() {
  try {
    const boxes = await getAllBoxes();
    return NextResponse.json(boxes);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao listar boxes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: "Campos obrigatórios não enviados." },
        { status: 400 }
      );
    }

    const box = await createBox({
      name: body.name,
      location: body.location,
    });

    return NextResponse.json(box, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar box" }, { status: 500 });
  }
}
