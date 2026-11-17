"use client";

import React, { useState, useEffect } from "react";
import SoftGradientBackground from "@/components/SoftGradientBackground";
import PinLockScreen from "@/components/PinLockScreen";
import Header from "@/components/Header";
import ModelSelector from "@/components/ModelSelector";
import ChatThread from "@/components/ChatThread";
import ChatInput from "@/components/ChatInput";
import MetricsModal from "@/components/MetricsModal";
import ConversationSidebar from "@/components/ConversationSidebar";
import {
  ChatTurn,
  ConversationSummary,
  ModelOption,
  ModelResponseItem,
} from "@/lib/types";
import { DEFAULT_MODELS } from "@/lib/openrouter";
import { AlertCircle, KeyRound, Sparkles } from "lucide-react";

export default function Home() {
  // Authentication State
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Models State
  const [allModels, setAllModels] = useState<ModelOption[]>(DEFAULT_MODELS);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([
    "google/gemini-2.5-flash",
    "anthropic/claude-haiku-5.5",
    "liquid/lfm-3-1.7b:free",
  ]);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  // View Mode & Dialogs
  const [viewMode, setViewMode] = useState<"grid" | "tabs" | "stacked">("grid");
  const [activeMetricsItem, setActiveMetricsItem] = useState<ModelResponseItem | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Conversation & Chat Turns State
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // 1. Check Auth Status on Mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          const data = await res.json();
          if (!data.requiresPin || data.authenticated) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Fetch Models and Conversations once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch models
    fetch("/api/models")
      .then((res) => res.json())
      .then((data) => {
        if (data.models && Array.isArray(data.models)) {
          setAllModels(data.models);
        }
        if (typeof data.hasApiKey === "boolean") {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch((err) => console.error("Error loading models:", err));

    // Fetch conversations
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        }
        if (typeof data.supabaseConnected === "boolean") {
          setSupabaseConnected(data.supabaseConnected);
        }
      })
      .catch((err) => console.error("Error loading conversations:", err));
  }, [isAuthenticated]);

  // Model selection handlers
  function handleToggleModel(modelId: string) {
    setSelectedModelIds((prev) => {
      if (prev.includes(modelId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  }

  function handleSelectPreset(modelIds: string[]) {
    if (modelIds.length > 0) {
      setSelectedModelIds(modelIds);
    }
  }

  // New Chat Handler
  function handleNewChat() {
    setConversationId(null);
    setTurns([]);
  }

  // Load selected conversation from Supabase
  async function handleSelectConversation(id: string) {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setConversationId(id);
        setTurns(data.turns || []);
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  }

  // Logout Handler
  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  }

  // Send Message to ALL selected models
  async function handleSendMessage(messageText: string) {
    if (!messageText.trim() || isSending || selectedModelIds.length === 0) return;

    setIsSending(true);

    const turnId = crypto.randomUUID();
    const userMsgId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // 1. Optimistic Assistant Responses with 'pending' state
    const optimisticResponses: ModelResponseItem[] = selectedModelIds.map((mId) => {
      const meta = allModels.find((m) => m.id === mId);
      return {
        id: crypto.randomUUID(),
        modelId: mId,
        modelName: meta?.name || mId.split("/")[1] || mId,
        content: "",
        metrics: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
          latencyMs: 0,
        },
        status: "pending",
      };
    });

    const newTurn: ChatTurn = {
      id: turnId,
      userMessage: {
        id: userMsgId,
        content: messageText,
        createdAt: timestamp,
      },
      assistantResponses: optimisticResponses,
      createdAt: timestamp,
    };

    setTurns((prev) => [...prev, newTurn]);

    // 2. Prepare history for API
    const historyPayload = turns.flatMap((t) => [
      { role: "user" as const, content: t.userMessage.content },
      // Use first successful assistant response as context
      ...(t.assistantResponses.length > 0 && t.assistantResponses[0].content
        ? [{ role: "assistant" as const, content: t.assistantResponses[0].content }]
        : []),
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: messageText,
          models: selectedModelIds,
          history: historyPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process message across models.");
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      if (typeof data.supabaseConnected === "boolean") {
        setSupabaseConnected(data.supabaseConnected);
      }

      // Update the turn with real model results
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? {
                ...t,
                assistantResponses: data.responses || [],
              }
            : t
        )
      );

      // Refresh conversations list if Supabase is connected
      if (supabaseConnected) {
        fetch("/api/conversations")
          .then((r) => r.json())
          .then((d) => {
            if (d.conversations) setConversations(d.conversations);
          })
          .catch(() => {});
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Error querying models";
      // Mark all pending responses as error
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? {
                ...t,
                assistantResponses: t.assistantResponses.map((r) => ({
                  ...r,
                  status: "error",
                  error: errorMsg,
                })),
              }
            : t
        )
      );
    } finally {
      setIsSending(false);
    }
  }

  // Loading spinner while checking auth
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SoftGradientBackground />
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Checking credentials...</p>
        </div>
      </div>
    );
  }

  // PIN Authentication Screen
  if (!isAuthenticated) {
    return (
      <>
        <SoftGradientBackground />
        <PinLockScreen onSuccess={() => setIsAuthenticated(true)} />
      </>
    );
  }

  const selectedModelsList = allModels.filter((m) =>
    selectedModelIds.includes(m.id)
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <SoftGradientBackground />

      {/* Header */}
      <Header
        selectedCount={selectedModelIds.length}
        onOpenModelSelector={() => setIsModelSelectorOpen(true)}
        onNewChat={handleNewChat}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onLogout={handleLogout}
        supabaseConnected={supabaseConnected}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
      />

      {/* Missing API Key Alert Banner if not configured */}
      {!hasApiKey && (
        <div className="bg-amber-500/10 border-b border-amber-200/60 px-4 py-2.5 text-center text-xs text-amber-800 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>OPENROUTER_API_KEY</strong> is not yet set in <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env</code>.
            Add your key to test real AI model responses.
          </span>
        </div>
      )}

      {/* Main Chat Thread Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <ChatThread
          turns={turns}
          viewMode={viewMode}
          onOpenMetrics={(item) => setActiveMetricsItem(item)}
          onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          selectedModelsCount={selectedModelIds.length}
        />

        {/* Floating Input Dock */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isSending={isSending}
          selectedModels={selectedModelsList}
          onOpenModelSelector={() => setIsModelSelectorOpen(true)}
        />
      </main>

      {/* Model Selection Modal */}
      <ModelSelector
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        allModels={allModels}
        selectedModelIds={selectedModelIds}
        onToggleModel={handleToggleModel}
        onSelectPreset={handleSelectPreset}
      />

      {/* Generation Metrics & Logs Modal (Requirement 5) */}
      <MetricsModal
        item={activeMetricsItem}
        onClose={() => setActiveMetricsItem(null)}
      />

      {/* History Slide-over Drawer */}
      <ConversationSidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={conversations}
        activeConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        supabaseConnected={supabaseConnected}
      />
    </div>
  );
}
