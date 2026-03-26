import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";

function getAdminLogin() {
  const value = process.env.ADMIN_LOGIN;
  if (!value) throw new Error("Missing ADMIN_LOGIN");
  return value;
}

function getAdminPassword() {
  const value = process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("Missing ADMIN_PASSWORD");
  return value;
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "admin-session-secret";
}

export function verifyAdminCredentials(login: string, password: string) {
  return login === getAdminLogin() && password === getAdminPassword();
}

export function createAdminSessionToken() {
  const raw = randomBytes(32).toString("hex");
  const hash = createHash("sha256")
    .update(`${raw}:${getAdminSessionSecret()}`)
    .digest("hex");

  return { raw, hash };
}

export function hashAdminSessionToken(rawToken: string) {
  return createHash("sha256")
    .update(`${rawToken}:${getAdminSessionSecret()}`)
    .digest("hex");
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!raw) return false;

  const expected = hashAdminSessionToken(raw);
  return expected.length > 0;
}