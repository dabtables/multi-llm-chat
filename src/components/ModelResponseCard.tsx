"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BarChart2,
  Copy,
  Check,
  Clock,
  Coins,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { ModelResponseItem } from "@/lib/types";
import { formatCost, formatLatency, formatTokens, getProviderBadge } from "@/lib/utils";

interface ModelResponseCardProps {
  item: ModelResponseItem;
  onOpenMetrics: (item: ModelResponseItem) => void;
}

export default function ModelResponseCard({
  item,
  onOpenMetrics,
}: ModelResponseCardProps) {
  const [copied, setCopied] = useState(false);
  const { provider, badgeClass } = getProviderBadge(item.modelId);

  async function handleCopy() {
    if (!item.content) return;
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="glass-card rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100/80 bg-white/60 flex items-center justify-between gap-2 flex-wrap">
        {/* Model Title & Provider Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${badgeClass}`}
          >
            {provider}
          </span>
          <h4 className="text-xs font-semibold text-slate-800 truncate">
            {item.modelName}
          </h4>
        </div>

        {/* Action icons & stats */}
        <div className="flex items-center gap-1.5 shrink-0">
          {item.status === "success" && (
            <>
              {/* Quick latency chip */}
              <div
                className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/90 text-[10px] font-mono text-slate-600"
                title="Response Latency"
              >
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatLatency(item.metrics.latencyMs)}</span>
              </div>

              {/* Quick token count chip */}
              <div
                className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/90 text-[10px] font-mono text-slate-600"
                title="Tokens (Input + Output)"
              >
                <span>{formatTokens(item.metrics.totalTokens)} tok</span>
              </div>

              {/* Quick cost chip */}
              <div
                className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-[10px] font-mono text-violet-700 border border-violet-100"
                title="Estimated Cost"
              >
                <Coins className="w-3 h-3" />
                <span>{formatCost(item.metrics.cost)}</span>
              </div>

              {/* REQUIREMENT 5: Small Icon to view tokens (input/output), cost, latency */}
              <button
                type="button"
                onClick={() => onOpenMetrics(item)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-violet-700 bg-violet-100/60 hover:bg-violet-100 active:scale-95 transition-all border border-violet-200/60"
                title="Click to view detailed tokens (input/output), cost, and latency"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Metrics</span>
              </button>

              {/* Copy Response Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Copy response to clipboard"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[500px]">
        {item.status === "pending" && (
          <div className="space-y-3 py-6 animate-pulse">
            <div className="flex items-center gap-2 text-xs text-violet-600 font-medium">
              <Sparkles className="w-4 h-4 animate-spin text-violet-500" />
              <span>Generating response via OpenRouter...</span>
            </div>
            <div className="h-3.5 bg-slate-200/70 rounded-full w-3/4" />
            <div className="h-3.5 bg-slate-200/70 rounded-full w-full" />
            <div className="h-3.5 bg-slate-200/70 rounded-full w-5/6" />
          </div>
        )}

        {item.status === "error" && (
          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-xs text-rose-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Generation Failed</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-600">
              {item.error || "An unknown error occurred while communicating with OpenRouter."}
            </p>
            {/* Show latency even on error */}
            <div className="pt-2 text-[10px] text-rose-500 font-mono">
              Failed after {formatLatency(item.metrics.latencyMs)}
            </div>
          </div>
        )}

        {item.status === "success" && (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {item.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
