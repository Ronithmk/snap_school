import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { extractPrintSize } from "@/lib/print-size";

export interface PrintJob {
  key: string;
  orderId: string;
  orderNumber: string;
  albumId: string | null;
  albumTitle: string;
  customerName: string;
  customerEmail: string;
  photoId: string | null;
  thumbnailUrl: string;
  hdUrl: string | null;
  itemName: string;
  size: string;
  quantity: number;
  unitPrice: number;
  orderStatus: string;
  placedAt: string;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ schoolId: string }> }) {
  const auth = await getAuthUser(req);
  if (!auth) return err("Unauthorized.", 401);

  const { schoolId } = await params;
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status"); // comma-separated
  const sizeFilter = searchParams.get("size");
  const search = searchParams.get("search")?.toLowerCase() ?? "";

  const statuses = statusFilter
    ? statusFilter.split(",")
    : ["paid", "cod", "processing", "completed", "shipped"];

  const orders = await db.order.findMany({
    where: { schoolId, status: { in: statuses } },
    orderBy: { placedAt: "desc" },
  });

  // Collect all photoIds to batch-fetch
  const allPhotoIds = new Set<string>();
  for (const order of orders) {
    const items: any[] = typeof order.items === "string" ? JSON.parse(order.items) : (order.items as any[]);
    for (const item of items) {
      if (item.photoId) allPhotoIds.add(item.photoId);
    }
  }

  const photos = await db.photo.findMany({
    where: { id: { in: [...allPhotoIds] } },
    select: { id: true, hdUrl: true, thumbnailUrl: true, previewUrl: true },
  });
  const photoMap = new Map(photos.map((p) => [p.id, p]));

  const jobs: PrintJob[] = [];

  for (const order of orders) {
    const items: any[] = typeof order.items === "string" ? JSON.parse(order.items) : (order.items as any[]);
    items.forEach((item: any, idx: number) => {
      const size = extractPrintSize(item.name ?? "");
      const photo = item.photoId ? photoMap.get(item.photoId) : null;

      if (sizeFilter && size !== sizeFilter) return;

      const job: PrintJob = {
        key: `${order.id}:${idx}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        albumId: order.albumId ?? null,
        albumTitle: order.albumTitle,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        photoId: item.photoId ?? null,
        thumbnailUrl: photo?.thumbnailUrl ?? item.thumbnailUrl ?? "",
        hdUrl: photo?.hdUrl ?? null,
        itemName: item.name ?? "",
        size,
        quantity: item.quantity ?? 1,
        unitPrice: item.unitPrice ?? 0,
        orderStatus: order.status,
        placedAt: order.placedAt.toISOString(),
      };

      if (
        search &&
        !job.customerName.toLowerCase().includes(search) &&
        !job.orderNumber.toLowerCase().includes(search) &&
        !job.albumTitle.toLowerCase().includes(search)
      ) {
        return;
      }

      jobs.push(job);
    });
  }

  // Stats
  const allOrders = await db.order.findMany({
    where: { schoolId, status: { in: ["paid", "cod", "processing", "completed", "shipped"] } },
    select: { status: true },
  });
  const stats = {
    pending: allOrders.filter((o) => ["paid", "cod"].includes(o.status)).length,
    printing: allOrders.filter((o) => o.status === "processing").length,
    completed: allOrders.filter((o) => ["completed", "shipped"].includes(o.status)).length,
  };

  return ok({ jobs, stats });
}
