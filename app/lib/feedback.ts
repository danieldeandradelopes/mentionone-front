import fs from "fs/promises";
import path from "path";
import Feedback from "../entities/Feedback";

const filePath = path.join(process.cwd(), "data", "feedback.json");

export async function getAllFeedbacks(): Promise<Feedback[]> {
  try {
    const json = await fs.readFile(filePath, "utf-8");
    return JSON.parse(json);
  } catch {
    return []; // caso o arquivo ainda não exista
  }
}

export async function getDashboardStats() {
  const feedbacks = await getAllFeedbacks();

  const total = feedbacks.length;

  const lastFive = feedbacks.slice(-5).reverse();

  return {
    total,
    lastFive,
  };
}
