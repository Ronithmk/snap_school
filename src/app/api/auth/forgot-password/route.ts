import { NextRequest } from "next/server";
import { ok } from "@/lib/api-helpers";

export async function POST(_req: NextRequest) {
  // Always resolve — don't expose whether the email exists.
  // In production: send a real reset email here.
  return ok({ message: "If that email is registered, a reset link has been sent." });
}
