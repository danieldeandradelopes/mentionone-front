import { destroySession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  destroySession();
  return NextResponse.json({ ok: true });
}
