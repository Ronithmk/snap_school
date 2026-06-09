import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import path from "path";
import fs from "fs";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { extractPrintSize } from "@/lib/print-size";

export async function POST(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const auth = await getAuthUser(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { schoolId } = await params;
  const body = await req.json() as {
    sizeGroup?: string;
    orderIds?: string[];
    markProcessing?: boolean;
  };

  const { sizeGroup, orderIds, markProcessing = true } = body;

  const where: Record<string, any> = {
    schoolId,
    status: { in: ["paid", "processing"] },
  };
  if (orderIds?.length) where.id = { in: orderIds };

  const orders = await db.order.findMany({ where, orderBy: { placedAt: "asc" } });

  if (!orders.length) {
    return NextResponse.json({ error: "No orders found to zip." }, { status: 404 });
  }

  // Collect photoIds
  const allPhotoIds = new Set<string>();
  for (const order of orders) {
    const items: any[] = typeof order.items === "string" ? JSON.parse(order.items) : (order.items as any[]);
    for (const item of items) {
      if (item.photoId) allPhotoIds.add(item.photoId);
    }
  }

  const photos = await db.photo.findMany({
    where: { id: { in: [...allPhotoIds] } },
    select: { id: true, hdUrl: true, fileName: true },
  });
  const photoMap = new Map(photos.map((p) => [p.id, p]));

  const zip = new JSZip();
  const school = await db.school.findUnique({ where: { id: schoolId }, select: { name: true } });

  // Add README
  zip.file(
    "README.txt",
    [
      `SnapSchool Print Queue`,
      `School: ${school?.name ?? schoolId}`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `Folders are organized by print size.`,
      `File naming: {OrderNumber}_{CustomerName}_x{Qty}.{ext}`,
      ``,
      `Sizes included: ${sizeGroup ?? "all"}`,
    ].join("\n"),
  );

  let filesAdded = 0;

  for (const order of orders) {
    const items: any[] = typeof order.items === "string" ? JSON.parse(order.items) : (order.items as any[]);
    for (const item of items) {
      const size = extractPrintSize(item.name ?? "");
      if (sizeGroup && size !== sizeGroup) continue;
      if (!item.photoId) continue;

      const photo = photoMap.get(item.photoId);
      if (!photo) continue;

      let buffer: Buffer | null = null;

      try {
        if (photo.hdUrl.startsWith("/uploads/")) {
          const filePath = path.join(process.cwd(), "public", photo.hdUrl);
          if (fs.existsSync(filePath)) buffer = fs.readFileSync(filePath);
        } else if (photo.hdUrl.startsWith("http")) {
          const res = await fetch(photo.hdUrl, { signal: AbortSignal.timeout(15000) });
          if (res.ok) buffer = Buffer.from(await res.arrayBuffer());
        }
      } catch {
        // Skip unreadable files
      }

      if (!buffer) continue;

      const ext = photo.hdUrl.split(".").pop()?.split("?")[0] ?? "jpg";
      const safeCustomer = order.customerName.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
      const filename = `${order.orderNumber}_${safeCustomer}_x${item.quantity}.${ext}`;
      zip.folder(size)!.file(filename, buffer);
      filesAdded++;
    }
  }

  if (filesAdded === 0) {
    return NextResponse.json({ error: "No printable photos found." }, { status: 422 });
  }

  // Mark orders as processing
  if (markProcessing) {
    const paidIds = orders.filter((o) => o.status === "paid").map((o) => o.id);
    if (paidIds.length) {
      await db.order.updateMany({
        where: { id: { in: paidIds } },
        data: { status: "processing" },
      });
    }
  }

  const zipBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "STORE", // fast — images are already compressed
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = school?.name.replace(/[^a-zA-Z0-9]/g, "-") ?? schoolId;
  const zipName = `print-queue-${safeName}${sizeGroup ? `-${sizeGroup}` : ""}-${dateStr}.zip`;

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
