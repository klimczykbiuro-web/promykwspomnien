import { createHash, randomBytes } from "node:crypto";

const LOT_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const RUN_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const QR_TOKEN_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export type QrTokenPreset = "standard" | "gloss";

export function hashQrToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function generateQrRawToken(preset: QrTokenPreset = "standard") {
  if (preset === "gloss") {
    // Krótszy token = krótszy link = prostszy QR = większe pola na tej samej tabliczce.
    // 12 znaków z alfabetu 32-symbolowego daje ok. 60 bitów losowości.
    return randomFromAlphabet(12, QR_TOKEN_ALPHABET);
  }

  return randomBytes(24)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function getQrTokenPrefix(rawToken: string) {
  return rawToken.slice(0, 8);
}

function randomFromAlphabet(length: number, alphabet: string) {
  const bytes = randomBytes(length);
  let value = "";

  for (let i = 0; i < length; i += 1) {
    value += alphabet[bytes[i] % alphabet.length];
  }

  return value;
}

export function generateLotCode() {
  return randomFromAlphabet(4, LOT_ALPHABET);
}

export function generateRunCode() {
  return randomFromAlphabet(8, RUN_ALPHABET);
}
