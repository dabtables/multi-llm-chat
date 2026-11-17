import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { dbGetConversations, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const auth = await isAuthenticated(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      conversations: [],
      supabaseConnected: false,
    });
  }

  const conversations = await dbGetConversations();
  return NextResponse.json({
    conversations,
    supabaseConnected: true,
  });
}
