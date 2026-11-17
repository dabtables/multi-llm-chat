"use client";

import React from "react";
import {
  Sparkles,
  Layers,
  LogOut,
  Database,
  SlidersHorizontal,
  Plus,
  History,
  Grid2X2,
  List,
} from "lucide-react";

interface HeaderProps {
  selectedCount: number;
  onOpenModelSelector: () => void;
  onNewChat: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
  supabaseConnected: boolean;
  viewMode: "grid" | "tabs" | "stacked";
  onChangeViewMode: (mode: "grid" | "tabs" | "stacked") => void;
}

export default function Header({
  selectedCount,
  onOpenModelSelector,
  onNewChat,
  onOpenHistory,
  onLogout,
  supabaseConnected,
  viewMode,
  onChangeViewMode,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & New Chat */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-sm shadow-violet-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-sm tracking-tight">
                  Multi-LLM Arena
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-100/70 text-violet-700 border border-violet-200/50">
                  OpenRouter
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Parallel LLM Comparison & Benchmarks
              </p>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs"
            title="Start New Chat"
          >
            <Plus className="w-3.5 h-3.5 text-violet-600" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* History Drawer Toggle */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-all border border-transparent hover:border-slate-200/60"
            title="Chat History"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">History</span>
          </button>
        </div>

        {/* Center/Right: Model Selector Pill, View Mode, Status, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Mode Toggle */}
          <div className="hidden lg:flex items-center p-0.5 rounded-lg bg-slate-100/80 border border-slate-200/60 text-slate-600 text-xs">
            <button
              onClick={() => onChangeViewMode("grid")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-2xs font-medium"
                  : "hover:text-slate-900"
              }`}
              title="Side-by-side Grid View"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => onChangeViewMode("tabs")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                viewMode === "tabs"
                  ? "bg-white text-slate-900 shadow-2xs font-medium"
                  : "hover:text-slate-900"
              }`}
              title="Tabbed View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tabs</span>
            </button>
            <button
              onClick={() => onChangeViewMode("stacked")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
                viewMode === "stacked"
                  ? "bg-white text-slate-900 shadow-2xs font-medium"
                  : "hover:text-slate-900"
              }`}
              title="Vertical Stacked View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Stack</span>
            </button>
          </div>

          {/* Model Selector Pill */}
          <button
            onClick={onOpenModelSelector}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 border border-violet-200 hover:border-violet-300 text-violet-800 transition-all shadow-2xs group"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-violet-600 group-hover:rotate-45 transition-transform duration-200" />
            <span>
              <strong className="font-semibold">{selectedCount}</strong>{" "}
              {selectedCount === 1 ? "Model" : "Models"} Active
            </span>
          </button>

          {/* Supabase status indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-200/60 bg-white/50 text-slate-600 hidden sm:flex"
            title={
              supabaseConnected
                ? "Supabase connected. Chat history and metrics are persistently saved."
                : "Supabase not connected. Running with local in-memory storage."
            }
          >
            <Database
              className={`w-3.5 h-3.5 ${
                supabaseConnected ? "text-emerald-500" : "text-amber-500"
              }`}
            />
            <span className="hidden xl:inline">
              {supabaseConnected ? "Supabase Synced" : "Local Mode"}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                supabaseConnected
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-colors"
            title="Lock workspace / Logout PIN session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
