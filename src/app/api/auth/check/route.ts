import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated, isPinRequired } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const requiresPin = isPinRequired();
  const authenticated = await isAuthenticated(req);

  return NextResponse.json({
    authenticated,
    requiresPin,
  });
}
