import sharp from "sharp";

export interface ProcessedImage {
  thumbnail: Buffer;
  preview: Buffer;
  hd: Buffer;
  width: number;
  height: number;
  contentType: string;
}

export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const img = sharp(buffer).rotate(); // auto-rotate from EXIF

  const meta = await img.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const [thumbnail, preview, hd] = await Promise.all([
    img.clone().resize({ width: 300, withoutEnlargement: true }).webp({ quality: 75 }).toBuffer(),
    img.clone().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
    img.clone().resize({ width: 3000, withoutEnlargement: true }).webp({ quality: 90 }).toBuffer(),
  ]);

  return { thumbnail, preview, hd, width, height, contentType: "image/webp" };
}

export function sanitizeFileName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}
