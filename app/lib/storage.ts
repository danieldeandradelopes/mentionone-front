// Sistema de armazenamento em memória para ambientes serverless
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import Feedback from "@/app/entities/Feedback";
import { Box } from "./boxes";

// Armazenamento em memória
let boxesStorage: Box[] = [];
let feedbackStorage: Feedback[] = [];

// Carrega dados iniciais dos arquivos JSON (apenas leitura)
function loadInitialData() {
  try {
    const boxesPath = path.join(process.cwd(), "data", "boxes.json");
    if (fs.existsSync(boxesPath)) {
      const boxesData = fs.readFileSync(boxesPath, "utf8");
      boxesStorage = JSON.parse(boxesData) as Box[];
    }
  } catch (error) {
    console.warn("Erro ao carregar boxes.json inicial:", error);
    boxesStorage = [];
  }

  try {
    const feedbackPath = path.join(process.cwd(), "data", "feedback.json");
    if (fs.existsSync(feedbackPath)) {
      const feedbackData = fs.readFileSync(feedbackPath, "utf8");
      feedbackStorage = JSON.parse(feedbackData) as Feedback[];
    }
  } catch (error) {
    console.warn("Erro ao carregar feedback.json inicial:", error);
    feedbackStorage = [];
  }
}

// Inicializa os dados na primeira importação
loadInitialData();

// Boxes Storage
export const boxesStore = {
  getAll: (): Box[] => boxesStorage,

  getById: (id: string): Box | null => {
    return boxesStorage.find((b) => b.id === id) || null;
  },

  create: (data: Omit<Box, "id">): Box => {
    const newBox: Box = {
      id: randomUUID(),
      ...data,
    };
    boxesStorage.push(newBox);
    console.log(
      `Box criado: ${newBox.id} - ${newBox.name}. Total no storage: ${boxesStorage.length}`
    );
    return newBox;
  },

  update: (id: string, data: Partial<Omit<Box, "id">>): Box | null => {
    const index = boxesStorage.findIndex((b) => b.id === id);
    if (index === -1) return null;

    boxesStorage[index] = {
      ...boxesStorage[index],
      ...data,
    };
    return boxesStorage[index];
  },

  delete: (id: string): boolean => {
    const initialLength = boxesStorage.length;
    boxesStorage = boxesStorage.filter((b) => b.id !== id);
    return boxesStorage.length < initialLength;
  },
};

// Feedback Storage
export const feedbackStore = {
  getAll: (): Feedback[] => feedbackStorage,

  create: (feedback: Feedback): Feedback => {
    feedbackStorage.push(feedback);
    return feedback;
  },
};
