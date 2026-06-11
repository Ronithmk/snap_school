import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID ?? "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? "";

const AWS_REGION = process.env.AWS_REGION ?? "";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? "";

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
        region: AWS_REGION,
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

export function r2KeyFromUrl(url: string) {
  return url.replace(`${R2_PUBLIC_URL}/`, "");
}
