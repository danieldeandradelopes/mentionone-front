import { cookies } from "next/headers";

const SESSION_NAME = "admin_session";

export async function createSession() {
  (await cookies()).set({
    name: SESSION_NAME,
    value: "active",
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_NAME);
}

export async function isAuthenticated() {
  const cookie = (await cookies()).get(SESSION_NAME)?.value;
  return cookie === "active";
}
