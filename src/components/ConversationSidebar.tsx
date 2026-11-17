"use client";

import React from "react";
import {
  X,
  MessageSquare,
  Plus,
  Clock,
  Database,
  ChevronRight,
} from "lucide-react";
import { ConversationSummary } from "@/lib/types";

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  supabaseConnected: boolean;
}

export default function ConversationSidebar({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  supabaseConnected,
}: ConversationSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/25 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-[85vw] bg-white/95 backdrop-blur-xl h-full shadow-2xl border-r border-slate-200/80 flex flex-col z-10 animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-800">Chat History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/15 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Arena Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs px-4">
              {supabaseConnected ? (
                <>No saved conversations found. Start chatting to save your arena sessions!</>
              ) : (
                <div className="space-y-2">
                  <p>Supabase credentials not configured.</p>
                  <p className="text-[11px] text-slate-400">
                    Add <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> in your <code className="font-mono">.env</code> to persist sessions.
                  </p>
                </div>
              )}
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-2 text-xs ${
                    isActive
                      ? "bg-violet-50 text-violet-900 border border-violet-200 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{conv.title || "Untitled Chat"}</p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-normal">
                      <Clock className="w-3 h-3" />
                      {new Date(conv.updated_at || conv.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer Database Status */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Supabase Sync</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              supabaseConnected
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {supabaseConnected ? "Active" : "Local Mode"}
          </span>
        </div>
      </div>
    </div>
  );
}
