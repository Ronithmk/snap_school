import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { canManageSchool } from "@/lib/authz";
import { err } from "@/lib/api-helpers";
import { fmtOrder } from "@/lib/format-order";
import { InvoiceDocument } from "@/lib/pdf/invoice-document";
import type { DownloadAssetType } from "@/types";

async function fetchPhotoBuffer(hdUrl: string): Promise<Buffer | null> {
  try {
    if (hdUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", hdUrl);
      if (fs.existsSync(filePath)) return fs.readFileSync(filePath);
      return null;
    }
    if (hdUrl.startsWith("http")) {
      const res = await fetch(hdUrl, { signal: AbortSignal.timeout(15000) });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    }
  } catch {
    // Skip unreadable files
  }
  return null;
}

async function addPhotosToZip(zip: JSZip, orderItems: { photoId: string | null }[], folder?: string): Promise<number> {
  const photoIds = [...new Set(orderItems.map((i) => i.photoId).filter((id): id is string => !!id))];
  const photos = await db.photo.findMany({ where: { id: { in: photoIds } }, select: { id: true, hdUrl: true, fileName: true } });
  const photoMap = new Map(photos.map((p) => [p.id, p]));

  let filesAdded = 0;
  for (const item of orderItems) {
    if (!item.photoId) continue;
    const photo = photoMap.get(item.photoId);
    if (!photo) continue;
    const buffer = await fetchPhotoBuffer(photo.hdUrl);
    if (!buffer) continue;
    const ext = photo.hdUrl.split(".").pop()?.split("?")[0] ?? "jpg";
    const fileName = `${photo.fileName || photo.id}.${ext}`;
    (folder ? zip.folder(folder)! : zip).file(fileName, buffer);
    filesAdded++;
  }
  return filesAdded;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { orderId } = await params;
  const body = await req.json().catch(() => ({}));
  const assetType = body.assetType as DownloadAssetType;

  const order = await db.order.findUnique({ where: { id: orderId }, include: { school: true } });
  if (!order) return err("Order not found.", 404);
  if (!canManageSchool(user, order.schoolId)) return err("Unauthorized.", 403);

  const formatted = fmtOrder(order);

  if (assetType === "pdf_contact_sheet") {
    const buffer = await renderToBuffer(InvoiceDocument({ order: formatted }));
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
        "Content-Length": String(buffer.length),
      },
    });
  }

  if (assetType === "jpg") {
    const zip = new JSZip();
    const filesAdded = await addPhotosToZip(zip, formatted.items);
    if (filesAdded === 0) return err("No downloadable photos found for this order.", 404);
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "STORE" });
    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="photos-${order.orderNumber}.zip"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  }

  if (assetType === "zip_package") {
    const zip = new JSZip();
    await addPhotosToZip(zip, formatted.items, "photos");

    const invoiceBuffer = await renderToBuffer(InvoiceDocument({ order: formatted }));
    zip.file(`invoice-${order.orderNumber}.pdf`, invoiceBuffer);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "STORE" });
    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="order-${order.orderNumber}.zip"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  }

  return err("Unsupported download type.", 400);
}
