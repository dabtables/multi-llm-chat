import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { dbGetConversationMessages, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await isAuthenticated(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      turns: [],
      supabaseConnected: false,
    });
  }

  const turns = await dbGetConversationMessages(id);
  return NextResponse.json({
    turns,
    supabaseConnected: true,
  });
}
