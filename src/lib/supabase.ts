import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ModelResponseItem } from "./types";

if (typeof globalThis.WebSocket === "undefined") {
  try {
    // Polyfill for Node.js < 22 environments
    globalThis.WebSocket = require("ws");
  } catch {
    // ignore in browser
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith("http") &&
    (supabaseAnonKey || supabaseServiceKey)
  );
}

// Server-side client (prefers service role if available for administrative writes)
export function getServerSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!supabaseUrl || !key) return null;
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false },
  });
}

// Client-side public Supabase client
export function getBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured() || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Save conversation in Supabase
export async function dbCreateConversation(title: string): Promise<string | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ title: title.slice(0, 80) })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert conversation error:", error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error("Error creating conversation in Supabase:", err);
    return null;
  }
}

// Save user or assistant message
export async function dbSaveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<string | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert message error:", error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error("Error saving message in Supabase:", err);
    return null;
  }
}

// Save model response with token usage, cost, latency, and status
export async function dbSaveModelResponse(params: {
  conversationId: string;
  messageId?: string | null;
  modelId: string;
  modelName: string;
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  latencyMs: number;
  status: "success" | "error";
  errorMessage?: string;
  openrouterGenerationId?: string;
}): Promise<string | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("model_responses")
      .insert({
        conversation_id: params.conversationId,
        message_id: params.messageId || null,
        model_id: params.modelId,
        model_name: params.modelName,
        content: params.content,
        prompt_tokens: params.promptTokens,
        completion_tokens: params.completionTokens,
        total_tokens: params.totalTokens,
        cost: params.cost,
        latency_ms: params.latencyMs,
        status: params.status,
        error_message: params.errorMessage || null,
        openrouter_generation_id: params.openrouterGenerationId || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert model_response error:", error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error("Error saving model response in Supabase:", err);
    return null;
  }
}

// Fetch all conversations
export async function dbGetConversations() {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("Supabase get conversations error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Error fetching conversations:", err);
    return [];
  }
}

// Fetch messages and logs for a conversation
export async function dbGetConversationMessages(conversationId: string) {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  try {
    const [messagesRes, responsesRes] = await Promise.all([
      supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
      supabase
        .from("model_responses")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true }),
    ]);

    if (messagesRes.error) {
      console.error("Error fetching messages:", messagesRes.error.message);
      return [];
    }

    const messages = messagesRes.data || [];
    const responses = responsesRes.data || [];

    // Group into ChatTurn format
    const turns: Array<{
      id: string;
      userMessage: { id: string; content: string; createdAt: string };
      assistantResponses: ModelResponseItem[];
      createdAt: string;
    }> = [];

    // Each user message starts a turn
    for (const msg of messages) {
      if (msg.role === "user") {
        const associatedResponses = responses
          .filter((r) => r.message_id === msg.id || !r.message_id)
          .map((r) => ({
            id: r.id,
            modelId: r.model_id,
            modelName: r.model_name,
            content: r.content,
            metrics: {
              promptTokens: r.prompt_tokens,
              completionTokens: r.completion_tokens,
              totalTokens: r.total_tokens,
              cost: Number(r.cost),
              latencyMs: r.latency_ms,
              generationId: r.openrouter_generation_id || undefined,
            },
            status: r.status as 'pending' | 'success' | 'error',
            error: r.error_message || undefined,
            savedToSupabase: true,
          }));

        turns.push({
          id: msg.id,
          userMessage: {
            id: msg.id,
            content: msg.content,
            createdAt: msg.created_at,
          },
          assistantResponses: associatedResponses,
          createdAt: msg.created_at,
        });
      }
    }

    return turns;
  } catch (err) {
    console.error("Error fetching conversation messages:", err);
    return [];
  }
}
