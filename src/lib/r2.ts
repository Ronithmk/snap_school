import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import type { Readable } from "stream";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/** Treats unfilled `.env` placeholders like `[CLOUDFLARE_ACCOUNT_ID]` as unset. */
function envValue(name: string): string {
  const value = process.env[name] ?? "";
  return /^\[.*\]$/.test(value) ? "" : value;
}

const R2_ACCOUNT_ID = envValue("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = envValue("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = envValue("R2_SECRET_ACCESS_KEY");

const AWS_REGION = envValue("AWS_REGION");
const AWS_ACCESS_KEY_ID = envValue("AWS_ACCESS_KEY_ID");
const AWS_SECRET_ACCESS_KEY = envValue("AWS_SECRET_ACCESS_KEY");

const USING_R2 = !!R2_ACCOUNT_ID;

/** Whether either Cloudflare R2 or AWS S3 credentials are configured. */
export const STORAGE_CONFIGURED = USING_R2 || !!AWS_REGION;

export const R2_BUCKET = USING_R2
  ? process.env.R2_BUCKET_NAME ?? "snapschool-photos"
  : process.env.S3_BUCKET_NAME ?? "snapschool-photos";

export const R2_PUBLIC_URL = (
  USING_R2
    ? process.env.R2_PUBLIC_URL ?? ""
    : process.env.S3_PUBLIC_URL || `https://${R2_BUCKET}.s3.${AWS_REGION}.amazonaws.com`
).replace(/\/$/, "");

export const r2 = new S3Client(
  USING_R2
    ? {
        region: "auto",
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID,
          secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
      }
    : {
        region: AWS_REGION || "auto",
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      }
);

export function r2PublicUrl(key: string) {
  return `${R2_PUBLIC_URL}/${key}`;
}

export async function uploadToR2(key: string, buffer: Buffer, contentType: string) {
  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return r2PublicUrl(key);
}

export async function deleteFromR2(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

export async function downloadFromR2(key: string): Promise<Buffer> {
  const result = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  const stream = result.Body as Readable;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

/** Returns a short-lived URL the browser can PUT a file to directly, bypassing the server. */
export async function presignUpload(key: string, contentType: string, expiresInSeconds = 600) {
  const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

export function r2KeyFromUrl(url: string) {
  return url.replace(`${R2_PUBLIC_URL}/`, "");
}
