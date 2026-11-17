"use client";

import React, { useEffect, useRef } from "react";
import { ChatTurn, ModelResponseItem } from "@/lib/types";
import MultiModelResponseView from "./MultiModelResponseView";
import { Sparkles, ArrowRight, User } from "lucide-react";

interface ChatThreadProps {
  turns: ChatTurn[];
  viewMode: "grid" | "tabs" | "stacked";
  onOpenMetrics: (item: ModelResponseItem) => void;
  onSelectPrompt: (prompt: string) => void;
  selectedModelsCount: number;
}

const STARTER_PROMPTS = [
  "Compare Python vs Go for building high-concurrency microservices.",
  "Explain quantum entanglement and superposition in simple terms.",
  "Write an idiomatic TypeScript utility function to debounce async functions with cancel support.",
  "What are the architecture trade-offs between Supabase PostgreSQL and MongoDB?",
];

export default function ChatThread({
  turns,
  viewMode,
  onOpenMetrics,
  onSelectPrompt,
  selectedModelsCount,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  if (turns.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto">
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/90 border border-violet-200 text-violet-800 text-xs font-semibold mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          <span>Parallel Multi-Model Arena</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Compare Any LLM{" "}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Side-by-Side
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mb-8 leading-relaxed font-normal">
          Type your message once and benchmark answers across{" "}
          <strong className="text-slate-900 font-semibold">{selectedModelsCount} selected models</strong>{" "}
          simultaneously. Click the small{" "}
          <strong className="text-violet-700 font-semibold">Metrics</strong> icon
          on any response to inspect token consumption (prompt & completion), cost, and latency.
        </p>

        {/* Suggested Prompts Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt(prompt)}
              className="p-4 rounded-2xl bg-white/90 hover:bg-white border border-slate-200 hover:border-violet-300 text-slate-800 hover:text-violet-950 transition-all text-xs group flex items-start justify-between gap-3 shadow-xs hover:shadow-md cursor-pointer"
            >
              <span className="leading-relaxed font-medium">{prompt}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
      {turns.map((turn) => (
        <div key={turn.id} className="space-y-4">
          {/* User Message Bubble (Right aligned) */}
          <div className="flex justify-end">
            <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[70%]">
              <div className="p-3.5 sm:p-4 rounded-2xl rounded-tr-xs bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs sm:text-sm leading-relaxed shadow-md shadow-violet-500/15">
                <p className="whitespace-pre-wrap">{turn.userMessage.content}</p>
                <div className="text-[10px] text-violet-200 text-right mt-1.5 opacity-80">
                  {new Date(turn.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Assistant Multi-Model Responses */}
          <div className="w-full">
            <MultiModelResponseView
              responses={turn.assistantResponses}
              viewMode={viewMode}
              onOpenMetrics={onOpenMetrics}
            />
          </div>
        </div>
      ))}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
