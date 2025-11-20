// lib/boxes.ts
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export interface Box {
  id: string;
  name: string;
  location: string;
}

const DATA_PATH = path.join(process.cwd(), "data", "boxes.json");

async function readFile() {
  const data = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(data) as Box[];
}

async function saveFile(boxes: Box[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(boxes, null, 2), "utf8");
}

/*
 * GET ALL
 */
export async function getAllBoxes(): Promise<Box[]> {
  return await readFile();
}

/*
 * GET ONE
 */
export async function getBoxById(id: string): Promise<Box | null> {
  const boxes = await readFile();
  return boxes.find((b) => b.id === id) || null;
}

/*
 * CREATE
 */
export async function createBox(data: Omit<Box, "id">): Promise<Box> {
  const boxes = await readFile();
  const newBox: Box = {
    id: randomUUID(),
    ...data,
  };

  boxes.push(newBox);
  await saveFile(boxes);

  return newBox;
}

/*
 * UPDATE
 */
export async function updateBox(
  id: string,
  data: Partial<Omit<Box, "id">>
): Promise<Box | null> {
  const boxes = await readFile();
  const index = boxes.findIndex((b) => b.id === id);

  if (index === -1) return null;

  boxes[index] = {
    ...boxes[index],
    ...data,
  };

  await saveFile(boxes);
  return boxes[index];
}

/*
 * DELETE
 */
export async function deleteBox(id: string): Promise<boolean> {
  const boxes = await readFile();
  const newList = boxes.filter((b) => b.id !== id);

  if (newList.length === boxes.length) return false;

  await saveFile(newList);
  return true;
}
