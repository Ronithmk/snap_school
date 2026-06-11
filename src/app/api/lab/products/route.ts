import { NextRequest } from "next/server";
import { db, jsonField } from "@/lib/db";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err, paginate, parseIntParam } from "@/lib/api-helpers";
import { fmtLabProduct } from "@/lib/format-lab-product";
import { LAB_PRODUCTS_PAGE_SIZE } from "@/config/constants";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");
  const status = searchParams.get("status");

  if (!schoolId && status === "published") {
    const products = await db.labProduct.findMany({
      where: { status: "published" },
      orderBy: { updatedAt: "desc" },
    });
    return ok(products.map(fmtLabProduct));
  }

  const search = (searchParams.get("search") ?? "").toLowerCase();
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const page = parseIntParam(searchParams.get("page"), 1);
  const pageSize = parseIntParam(searchParams.get("pageSize"), LAB_PRODUCTS_PAGE_SIZE);

  const where: Record<string, unknown> = {};
  if (schoolId) where.schoolId = schoolId;
  if (status) where.status = status;
  if (category) where.category = category;
  if (type) where.type = type;

  const products = await db.labProduct.findMany({ where, orderBy: { updatedAt: "desc" } });
  let formatted = products.map(fmtLabProduct);

  if (search) {
    formatted = formatted.filter(
      (p) => p.name.toLowerCase().includes(search) || (p.description ?? "").toLowerCase().includes(search) || p.category.toLowerCase().includes(search),
    );
  }

  return ok(paginate(formatted, page, pageSize));
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const body = await req.json();
  const { schoolId, name, description, type, category, dimensions, orientation, price, currencyCode, taxIncluded, tags } = body;

  if (!schoolId || !name) return err("schoolId and name are required.", 400);

  const product = await db.labProduct.create({
    data: {
      schoolId,
      name,
      description: description ?? null,
      type: type ?? "custom",
      category: category ?? "",
      status: "draft",
      previewImageUrl: "",
      dimensions: jsonField(dimensions ?? { label: "", widthCm: 0, heightCm: 0 }),
      orientation: orientation ?? "portrait",
      price: price ?? 0,
      currencyCode: currencyCode ?? "INR",
      taxIncluded: taxIncluded ?? false,
      tags: jsonField(tags ?? []),
      pages: jsonField([
        {
          id: "pg_1",
          name: "Page 1",
          widthCm: dimensions?.widthCm ?? 0,
          heightCm: dimensions?.heightCm ?? 0,
          backgroundColor: "#ffffff",
          elements: [],
        },
      ]),
    },
  });

  return ok(fmtLabProduct(product), 201);
}
