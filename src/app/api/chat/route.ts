import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { callOpenRouterModel, DEFAULT_MODELS } from "@/lib/openrouter";
import {
  dbCreateConversation,
  dbSaveMessage,
  dbSaveModelResponse,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { ModelResponseItem } from "@/lib/types";

export const maxDuration = 60; // Max allowed execution duration on Vercel Pro/Hobby

export async function POST(req: NextRequest) {
  // 1. Verify authentication
  const auth = await isAuthenticated(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized. PIN authentication required." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { conversationId, message, models, history = [] } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    if (!Array.isArray(models) || models.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one LLM model." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY is not set in .env. Please add your OpenRouter API key to test generation.",
        },
        { status: 500 }
      );
    }

    // 2. Prepare or create conversation in Supabase (if configured)
    let convId = conversationId;
    if (!convId) {
      const dbConvId = await dbCreateConversation(
        message.trim().slice(0, 50) || "New Chat"
      );
      convId = dbConvId || crypto.randomUUID();
    }

    // 3. Save User Message to Supabase
    const userMsgId = await dbSaveMessage(convId, "user", message.trim());

    // 4. Build prompt messages chain
    // Take previous history turns (last 10 messages) for context
    const formattedHistory = Array.isArray(history)
      ? history.slice(-10).map((h: { role: string; content: string }) => ({
          role: h.role === "assistant" ? "assistant" : "user",
          content: String(h.content),
        }))
      : [];

    const messagesToSend = [
      ...formattedHistory,
      { role: "user", content: message.trim() },
    ];

    // 5. Query ALL selected models in parallel
    const modelPromises = models.map(async (modelId: string): Promise<ModelResponseItem> => {
      // Find model display name
      const meta = DEFAULT_MODELS.find((m) => m.id === modelId);
      const modelName = meta?.name || modelId.split("/")[1] || modelId;

      const result = await callOpenRouterModel({
        modelId,
        messages: messagesToSend,
        apiKey,
      });

      const isSuccess = !result.error && Boolean(result.content);
      const status: "success" | "error" = isSuccess ? "success" : "error";

      // 6. Save each model's response and metrics to Supabase
      let savedToDb = false;
      try {
        const savedId = await dbSaveModelResponse({
          conversationId: convId,
          messageId: userMsgId,
          modelId,
          modelName,
          content: result.content,
          promptTokens: result.metrics.promptTokens,
          completionTokens: result.metrics.completionTokens,
          totalTokens: result.metrics.totalTokens,
          cost: result.metrics.cost,
          latencyMs: result.metrics.latencyMs,
          status,
          errorMessage: result.error,
          openrouterGenerationId: result.metrics.generationId,
        });
        savedToDb = Boolean(savedId);
      } catch (saveErr) {
        console.error(`Failed to save response for ${modelId} to Supabase:`, saveErr);
      }

      return {
        id: crypto.randomUUID(),
        modelId,
        modelName,
        content: result.content,
        metrics: result.metrics,
        status,
        error: result.error,
        savedToSupabase: savedToDb,
      };
    });

    const modelResponses = await Promise.all(modelPromises);

    return NextResponse.json({
      conversationId: convId,
      userMessageId: userMsgId || crypto.randomUUID(),
      responses: modelResponses,
      supabaseConnected: isSupabaseConfigured(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
