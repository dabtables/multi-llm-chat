"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, SlidersHorizontal, CornerDownLeft } from "lucide-react";
import { ModelOption } from "@/lib/types";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isSending: boolean;
  selectedModels: ModelOption[];
  onOpenModelSelector: () => void;
}

export default function ChatInput({
  onSendMessage,
  isSending,
  selectedModels,
  onOpenModelSelector,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        160
      )}px`;
    }
  }, [input]);

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || isSending || selectedModels.length === 0) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="sticky bottom-0 z-20 w-full glass-panel border-t border-slate-200/70 p-3 sm:p-4 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Selected Models Pill Bar */}
        <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-slate-600">Dispatching to:</span>
            {selectedModels.length === 0 ? (
              <button
                type="button"
                onClick={onOpenModelSelector}
                className="text-rose-600 font-semibold hover:underline"
              >
                No models selected! Click to pick at least one
              </button>
            ) : (
              selectedModels.map((m) => (
                <span
                  key={m.id}
                  className="px-2 py-0.5 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200/60 font-medium"
                >
                  {m.name}
                </span>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={onOpenModelSelector}
            className="text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 shrink-0 ml-2"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Configure ({selectedModels.length})</span>
          </button>
        </div>

        {/* Input Card with soft gradient glow border */}
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl p-[1px] bg-gradient-to-r from-violet-300/40 via-purple-300/30 to-pink-300/40 focus-within:from-violet-500 focus-within:to-indigo-500 transition-all duration-300 shadow-sm"
        >
          <div className="flex items-end gap-2 bg-white/95 rounded-[15px] p-2 sm:p-2.5">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending || selectedModels.length === 0}
              placeholder={
                selectedModels.length === 0
                  ? "Select at least one model above to start..."
                  : `Ask a question to all ${selectedModels.length} models simultaneously... (Enter to send, Shift+Enter for newline)`
              }
              className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-sm text-slate-800 focus:outline-none placeholder:text-slate-400 max-h-36 py-1 px-1.5 leading-relaxed"
            />

            <button
              type="submit"
              disabled={
                !input.trim() || isSending || selectedModels.length === 0
              }
              className={`p-2.5 rounded-xl font-medium text-white transition-all duration-200 shrink-0 flex items-center justify-center active:scale-95 ${
                input.trim() && !isSending && selectedModels.length > 0
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/25"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
              title="Send message to all selected models"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
