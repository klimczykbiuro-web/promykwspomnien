import { randomUUID } from "node:crypto";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

const accountId = requireEnv("R2_ACCOUNT_ID");
const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
const bucket = requireEnv("R2_BUCKET");
const publicBaseUrl = requireEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/, "");

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

function sanitizeExtension(fileName: string, contentType: string) {
  const rawExt = path.extname(fileName).toLowerCase();

  if ([".jpg", ".jpeg", ".png", ".webp"].includes(rawExt)) {
    return rawExt;
  }

  if (contentType === "image/jpeg") return ".jpg";
  if (contentType === "image/png") return ".png";
  if (contentType === "image/webp") return ".webp";

  return ".bin";
}

export function createObjectKey(input: {
  profileId: string;
  kind: "hero" | "gallery";
  fileName: string;
  contentType: string;
}) {
  const extension = sanitizeExtension(input.fileName, input.contentType);
  const fileId = randomUUID();

  return `profiles/${input.profileId}/${input.kind}/${fileId}${extension}`;
}

export function getPublicUrlForKey(key: string) {
  return `${publicBaseUrl}/${key}`;
}

export async function createPresignedUpload(input: {
  key: string;
  contentType: string;
  expiresIn?: number;
}) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: input.key,
    ContentType: input.contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(r2, command, {
    expiresIn: input.expiresIn ?? 600,
  });

  return {
    uploadUrl,
    publicUrl: getPublicUrlForKey(input.key),
    objectKey: input.key,
  };
}