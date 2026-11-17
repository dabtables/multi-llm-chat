"use client";

import React, { useState } from "react";
import { ModelResponseItem } from "@/lib/types";
import ModelResponseCard from "./ModelResponseCard";
import { formatCost, formatLatency, formatTokens, getProviderBadge } from "@/lib/utils";
import { Coins, Zap, Layers } from "lucide-react";

interface MultiModelResponseViewProps {
  responses: ModelResponseItem[];
  viewMode: "grid" | "tabs" | "stacked";
  onOpenMetrics: (item: ModelResponseItem) => void;
}

export default function MultiModelResponseView({
  responses,
  viewMode,
  onOpenMetrics,
}: MultiModelResponseViewProps) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  if (!responses || responses.length === 0) return null;

  // Aggregate stats across all chosen models
  const totalCost = responses.reduce((acc, r) => acc + (r.metrics?.cost || 0), 0);
  const totalTokens = responses.reduce((acc, r) => acc + (r.metrics?.totalTokens || 0), 0);
  const maxLatency = Math.max(...responses.map((r) => r.metrics?.latencyMs || 0));

  // Determine grid columns
  let gridClass = "grid-cols-1";
  if (viewMode === "grid") {
    if (responses.length === 2) gridClass = "grid-cols-1 md:grid-cols-2";
    else if (responses.length === 3) gridClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    else if (responses.length >= 4) gridClass = "grid-cols-1 md:grid-cols-2 xl:grid-cols-2";
  }

  return (
    <div className="space-y-3 w-full">
      {/* Turn Overview Bar: Cumulative cost & tokens across all models */}
      {responses.length > 1 && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-3 py-1.5 rounded-xl bg-white/40 border border-slate-200/50 backdrop-blur-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">Turn Aggregate:</span>
            <span>{responses.length} Models Responded</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-mono">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Max Latency: {formatLatency(maxLatency)}</span>
            </div>
            <div className="flex items-center gap-1 font-mono">
              <Layers className="w-3 h-3 text-blue-500" />
              <span>{formatTokens(totalTokens)} tokens</span>
            </div>
            <div className="flex items-center gap-1 font-mono font-semibold text-violet-700">
              <Coins className="w-3 h-3" />
              <span>{formatCost(totalCost)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TABS VIEW */}
      {viewMode === "tabs" && responses.length > 1 && (
        <div className="space-y-3">
          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {responses.map((item, idx) => {
              const { badgeClass } = getProviderBadge(item.modelId);
              const isActive = activeTabIdx === idx;
              return (
                <button
                  key={item.id || idx}
                  onClick={() => setActiveTabIdx(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all border shrink-0 ${
                    isActive
                      ? "bg-white text-slate-900 border-violet-300 shadow-xs font-semibold"
                      : "bg-white/40 text-slate-600 border-slate-200/60 hover:bg-white"
                  }`}
                >
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full border ${badgeClass}`}
                  >
                    {item.modelName}
                  </span>
                  {item.metrics?.latencyMs > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatLatency(item.metrics.latencyMs)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          {responses[activeTabIdx] && (
            <ModelResponseCard
              item={responses[activeTabIdx]}
              onOpenMetrics={onOpenMetrics}
            />
          )}
        </div>
      )}

      {/* GRID OR STACKED VIEW */}
      {(viewMode !== "tabs" || responses.length === 1) && (
        <div
          className={`grid gap-3.5 ${
            viewMode === "stacked" ? "grid-cols-1" : gridClass
          }`}
        >
          {responses.map((item) => (
            <ModelResponseCard
              key={item.id}
              item={item}
              onOpenMetrics={onOpenMetrics}
            />
          ))}
        </div>
      )}
    </div>
  );
}
