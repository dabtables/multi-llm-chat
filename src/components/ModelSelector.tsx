"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Zap,
  Cpu,
  Coins,
  SlidersHorizontal,
} from "lucide-react";
import { ModelOption } from "@/lib/types";
import { getProviderBadge } from "@/lib/utils";

interface ModelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  allModels: ModelOption[];
  selectedModelIds: string[];
  onToggleModel: (modelId: string) => void;
  onSelectPreset: (modelIds: string[]) => void;
}

export default function ModelSelector({
  isOpen,
  onClose,
  allModels,
  selectedModelIds,
  onToggleModel,
  onSelectPreset,
}: ModelSelectorProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredModels = useMemo(() => {
    return allModels.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.id.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (activeCategory === "all") return true;
      if (activeCategory === "free") return m.id.includes(":free");
      return m.category === activeCategory;
    });
  }, [allModels, search, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl glass-dropdown rounded-3xl border border-white/70 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/70 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500/20 to-purple-500/20 border border-violet-200/60 flex items-center justify-center text-violet-700 shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Choose Comparison Models
              </h2>
              <p className="text-xs text-slate-500">
                Pick 2 or more LLMs to stream and benchmark parallel answers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Presets Toolbar */}
        <div className="p-6 pb-3 border-b border-slate-100 bg-white/40 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by model name, provider (Claude, GPT-4o, Gemini, Llama)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200/80 bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Quick Presets & Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: "all", label: "All Models" },
                { id: "flagship", label: "Flagship" },
                { id: "fast", label: "Fast & Light" },
                { id: "reasoning", label: "Reasoning" },
                { id: "open-weights", label: "Open Weights" },
                { id: "free", label: "Free" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeCategory === cat.id
                      ? "bg-violet-600 text-white font-medium shadow-xs"
                      : "text-slate-600 hover:bg-slate-100/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                onClick={() =>
                  onSelectPreset([
                    "google/gemini-2.5-flash",
                    "anthropic/claude-haiku-5.5",
                    "liquid/lfm-3-1.7b:free",
                  ])
                }
                className="px-2.5 py-1 rounded-md bg-violet-50 hover:bg-violet-100/80 text-violet-700 border border-violet-200/60 font-medium transition-all"
              >
                Top 3 Arena
              </button>
              <button
                onClick={() =>
                  onSelectPreset([
                    "liquid/lfm-3-1.7b:free",
                    "google/gemma-4-26b-a4b-it:free",
                  ])
                }
                className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-medium transition-all"
              >
                100% Free Duo
              </button>
              <button
                onClick={() =>
                  onSelectPreset(allModels.map((m) => m.id))
                }
                className="px-2 py-1 text-slate-500 hover:text-slate-800"
              >
                Select All
              </button>
            </div>
          </div>
        </div>

        {/* Model Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-2.5 max-h-[50vh]">
          {filteredModels.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No models match your search criteria.
            </div>
          ) : (
            filteredModels.map((model) => {
              const isSelected = selectedModelIds.includes(model.id);
              const { badgeClass } = getProviderBadge(model.id);

              return (
                <div
                  key={model.id}
                  onClick={() => onToggleModel(model.id)}
                  className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? "bg-violet-50/60 border-violet-300/80 shadow-xs ring-1 ring-violet-500/20"
                      : "bg-white/70 hover:bg-white border-slate-200/70 hover:border-slate-300"
                  }`}
                >
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="pt-0.5">
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-violet-600 text-white"
                            : "border border-slate-300 group-hover:border-slate-400 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-800">
                          {model.name}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeClass}`}
                        >
                          {model.provider}
                        </span>
                        {model.id.includes(":free") && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            FREE
                          </span>
                        )}
                      </div>
                      {model.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {model.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Pricing & Context length */}
                  <div className="shrink-0 flex items-center gap-2 text-[11px] text-slate-500">
                    {model.pricing && (
                      <div className="text-right hidden sm:block">
                        <span className="font-mono text-slate-700">
                          ${model.pricing.prompt}
                        </span>
                        <span className="text-slate-400"> / </span>
                        <span className="font-mono text-slate-700">
                          ${model.pricing.completion}
                        </span>
                        <div className="text-[9px] text-slate-400">per 1M tok</div>
                      </div>
                    )}
                    {model.contextLength && (
                      <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                        {model.contextLength >= 1000000
                          ? `${model.contextLength / 1000000}M`
                          : `${model.contextLength / 1000}k`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/70 bg-white/80 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <strong className="text-violet-700 font-semibold">
              {selectedModelIds.length}
            </strong>{" "}
            {selectedModelIds.length === 1 ? "model" : "models"} selected
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all shadow-md shadow-violet-500/20"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
