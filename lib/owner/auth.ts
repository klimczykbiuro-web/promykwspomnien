import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export const OWNER_SESSION_COOKIE = "owner_session";

const SESSION_TTL_DAYS = 30;

export function hashClaimToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algo, salt, hash] = storedHash.split(":");

  if (algo !== "scrypt" || !salt || !hash) {
    return false;
  }

  const candidate = Buffer.from(
    scryptSync(password, salt, 64).toString("hex"),
    "hex"
  );
  const original = Buffer.from(hash, "hex");

  if (candidate.length !== original.length) {
    return false;
  }

  return timingSafeEqual(candidate, original);
}

export function generateSessionToken() {
  const rawToken = randomBytes(32).toString("hex");
  const hashedToken = createHash("sha256").update(rawToken).digest("hex");

  return { rawToken, hashedToken };
}

export function getSessionExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);
  return expiresAt;
}