import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { sanitizeFileName } from "@/lib/image";
import { uploadToR2, STORAGE_CONFIGURED } from "@/lib/r2";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["branding", "schools"]);

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return err("No file uploaded.", 400);

  const folderInput = String(formData.get("folder") ?? "branding");
  const folder = ALLOWED_FOLDERS.has(folderInput) ? folderInput : "branding";

  const isPdf = file.type === "application/pdf";
  const isSvg = file.type === "image/svg+xml";
  if (!file.type.startsWith("image/") && !isPdf) return err("Only image or PDF uploads are allowed.", 400);
  if (file.size > MAX_SIZE_BYTES) return err("File must be smaller than 10MB.", 400);

  const rawBuffer = Buffer.from(await file.arrayBuffer());
  const baseName = sanitizeFileName(file.name.replace(/\.[^.]+$/, "")) || "image";

  let buffer: Buffer = rawBuffer;
  let contentType = file.type;
  let extension = isPdf ? "pdf" : isSvg ? "svg" : "webp";

  if (!isPdf && !isSvg) {
    buffer = await sharp(rawBuffer).rotate().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
    contentType = "image/webp";
  }

  const fileName = `${baseName}-${Date.now()}.${extension}`;

  let url: string;
  if (STORAGE_CONFIGURED) {
    url = await uploadToR2(`${folder}/${fileName}`, buffer, contentType);
  } else {
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    url = `/uploads/${folder}/${fileName}`;
  }

  return ok({ url }, 201);
}
