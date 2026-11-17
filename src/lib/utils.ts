import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCost(cost: number): string {
  if (cost === 0) return "$0.0000";
  if (cost < 0.00001) return "< $0.00001";
  if (cost < 0.01) return `$${cost.toFixed(5)}`;
  return `$${cost.toFixed(4)}`;
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function formatTokens(count: number): string {
  if (count < 1000) return count.toLocaleString();
  if (count < 100000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000).toFixed(0)}k`;
}

export function getProviderBadge(modelId: string): {
  provider: string;
  badgeClass: string;
  pillGradient: string;
} {
  const lower = modelId.toLowerCase();
  if (lower.includes("anthropic") || lower.includes("claude")) {
    return {
      provider: "Anthropic",
      badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      pillGradient: "from-amber-500/10 via-orange-500/10 to-amber-500/5",
    };
  }
  if (lower.includes("openai") || lower.includes("gpt")) {
    return {
      provider: "OpenAI",
      badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      pillGradient: "from-emerald-500/10 via-teal-500/10 to-emerald-500/5",
    };
  }
  if (lower.includes("google") || lower.includes("gemini")) {
    return {
      provider: "Google",
      badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      pillGradient: "from-blue-500/10 via-indigo-500/10 to-blue-500/5",
    };
  }
  if (lower.includes("meta") || lower.includes("llama")) {
    return {
      provider: "Meta",
      badgeClass: "bg-sky-500/10 text-sky-700 border-sky-500/20",
      pillGradient: "from-sky-500/10 via-blue-500/10 to-sky-500/5",
    };
  }
  if (lower.includes("deepseek")) {
    return {
      provider: "DeepSeek",
      badgeClass: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      pillGradient: "from-purple-500/10 via-pink-500/10 to-purple-500/5",
    };
  }
  if (lower.includes("mistral")) {
    return {
      provider: "Mistral",
      badgeClass: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      pillGradient: "from-orange-500/10 via-amber-500/10 to-orange-500/5",
    };
  }
  return {
    provider: "OpenRouter",
    badgeClass: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    pillGradient: "from-violet-500/10 via-purple-500/10 to-indigo-500/5",
  };
}
