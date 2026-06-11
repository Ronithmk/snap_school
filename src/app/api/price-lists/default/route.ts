import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api-helpers";
import { getCachedPriceLists } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");
  if (!schoolId) return err("schoolId is required.", 400);

  const priceLists = await getCachedPriceLists(schoolId);
  const defaultList = priceLists.find((p) => p.isDefault) ?? priceLists[0] ?? null;

  return ok(defaultList);
}
