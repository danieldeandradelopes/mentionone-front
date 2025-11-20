import { NextRequest, NextResponse } from "next/server";
import { feedbackStore } from "@/app/lib/storage";
import Report from "@/app/entities/Report";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const boxId = searchParams.get("boxId") || null;
    const startDate = searchParams.get("startDate") || null;
    const endDate = searchParams.get("endDate") || null;
    const category = searchParams.get("category") || null;

    // Busca todos os feedbacks
    let feedbacks = feedbackStore.getAll();
    console.log(`Total de feedbacks encontrados: ${feedbacks.length}`);

    // Aplica filtros
    if (boxId) {
      feedbacks = feedbacks.filter((f) => f.boxId === boxId);
    }

    if (category) {
      feedbacks = feedbacks.filter((f) =>
        f.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      feedbacks = feedbacks.filter((f) => new Date(f.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Inclui o dia inteiro
      feedbacks = feedbacks.filter((f) => new Date(f.createdAt) <= end);
    }

    // Agrupa por categoria
    const groupedByCategory: Record<string, number> = {};
    feedbacks.forEach((f) => {
      groupedByCategory[f.category] = (groupedByCategory[f.category] || 0) + 1;
    });

    // Agrupa por dia
    const groupedByDay: Record<string, number> = {};
    feedbacks.forEach((f) => {
      const date = new Date(f.createdAt);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      groupedByDay[dateKey] = (groupedByDay[dateKey] || 0) + 1;
    });

    // Cria o objeto Report
    const report = new Report(
      randomUUID(),
      boxId,
      category,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null,
      feedbacks.length,
      groupedByCategory,
      groupedByDay
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}
