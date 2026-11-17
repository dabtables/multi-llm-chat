"use client";

import React from "react";
import {
  X,
  Gauge,
  Coins,
  Cpu,
  Clock,
  Database,
  CheckCircle2,
  ExternalLink,
  Layers,
} from "lucide-react";
import { ModelResponseItem } from "@/lib/types";
import { formatCost, formatLatency, getProviderBadge } from "@/lib/utils";

interface MetricsModalProps {
  item: ModelResponseItem | null;
  onClose: () => void;
}

export default function MetricsModal({ item, onClose }: MetricsModalProps) {
  if (!item) return null;

  const { metrics, modelName, modelId, status, savedToSupabase } = item;
  const { provider, badgeClass } = getProviderBadge(modelId);

  // Determine speed tier
  let speedLabel = "Normal";
  let speedColor = "text-blue-600 bg-blue-50 border-blue-200";
  if (metrics.latencyMs < 1000) {
    speedLabel = "⚡ Ultra Fast";
    speedColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  } else if (metrics.latencyMs > 3500) {
    speedLabel = "Complex Reasoning";
    speedColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md glass-dropdown rounded-3xl border border-white/80 shadow-2xl p-6 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Generation Metrics & Logs
              </h3>
              <p className="text-[11px] text-slate-400">
                Token consumption, cost, and latency breakdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model ID & Provider Badge */}
        <div className="py-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-800 block">
              {modelName}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {modelId}
            </span>
          </div>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeClass}`}
          >
            {provider}
          </span>
        </div>

        {/* 2x2 Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5 my-3">
          {/* Latency */}
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Latency</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold font-mono text-slate-800">
                {formatLatency(metrics.latencyMs)}
              </div>
              <span
                className={`inline-block text-[9px] font-medium px-1.5 py-0.2 rounded border mt-0.5 ${speedColor}`}
              >
                {speedLabel}
              </span>
            </div>
          </div>

          {/* Cost */}
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Estimated Cost</span>
              <Coins className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold font-mono text-violet-700">
                {formatCost(metrics.cost)}
              </div>
              <span className="text-[10px] text-slate-400">
                USD billed by OpenRouter
              </span>
            </div>
          </div>

          {/* Input Tokens */}
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Prompt (Input)</span>
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold font-mono text-slate-800">
                {metrics.promptTokens.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Tokens consumed</span>
            </div>
          </div>

          {/* Output Tokens */}
          <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Completion (Output)</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="mt-2">
              <div className="text-lg font-bold font-mono text-slate-800">
                {metrics.completionTokens.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">
                Total: {metrics.totalTokens.toLocaleString()} tok
              </span>
            </div>
          </div>
        </div>

        {/* Database & Generation Log Status */}
        <div className="mt-3 p-3 rounded-xl bg-violet-50/40 border border-violet-100 text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-violet-600" />
              <span className="font-medium text-slate-700">Supabase Log:</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              {savedToSupabase ? "Saved to model_responses" : "In Memory"}
            </span>
          </div>

          {metrics.generationId && (
            <div className="flex items-center justify-between pt-1 border-t border-violet-100/60 font-mono text-[10px] text-slate-500">
              <span>OpenRouter ID:</span>
              <span className="truncate max-w-[170px]" title={metrics.generationId}>
                {metrics.generationId}
              </span>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
