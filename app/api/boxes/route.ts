// app/api/boxes/route.ts
import { NextResponse } from "next/server";
import { getAllBoxes, createBox } from "@/app/lib/boxes";

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
    console.log("POST /api/boxes - Body recebido:", body);

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

    console.log("Box criado com sucesso:", box);
    console.log("Total de boxes no storage:", (await getAllBoxes()).length);

    return NextResponse.json(box, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar box:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar box",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
