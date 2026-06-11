import { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { ok, err } from "@/lib/api-helpers";
import { LAB_PRODUCTS_PAGE_SIZE } from "@/config/constants";

/**
 * Product Lab has no backing data store yet. Return empty results in the shapes the
 * frontend expects so the catalogue/library/tags pages render their empty states
 * instead of 404ing and crashing on `.length` of an undefined response.
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return err("Unauthorized.", 401);

  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");
  const status = searchParams.get("status");

  if (!schoolId && status === "published") {
    return ok([]);
  }

  const page = Number(searchParams.get("page") ?? "1") || 1;
  const pageSize = Number(searchParams.get("pageSize") ?? String(LAB_PRODUCTS_PAGE_SIZE)) || LAB_PRODUCTS_PAGE_SIZE;

  return ok({
    data: [],
    meta: { page, pageSize, total: 0, totalPages: 0 },
  });
}
