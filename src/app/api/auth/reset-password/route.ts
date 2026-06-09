import { NextRequest } from "next/server";
import { err, ok } from "@/lib/api-helpers";

export async function POST(_req: NextRequest) {
  // In production: validate reset token from DB and update password.
  return err("Password reset via token is not yet implemented.", 501);
}
