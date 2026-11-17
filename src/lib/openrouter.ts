import { ModelMetrics, ModelOption } from "./types";

export const DEFAULT_MODELS: ModelOption[] = [
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    contextLength: 1000000,
    pricing: { prompt: 0.15, completion: 0.6 },
    description: "Ultra-fast inference with massive context and excellent reasoning.",
    isPopular: true,
    category: "fast",
  },
  {
    id: "anthropic/claude-haiku-5.5",
    name: "Claude Haiku 5.5",
    provider: "Anthropic",
    contextLength: 200000,
    pricing: { prompt: 0.25, completion: 1.25 },
    description: "Lightning-fast Anthropic model with exceptional accuracy.",
    isPopular: true,
    category: "fast",
  },
  {
    id: "anthropic/claude-sonnet-5.5",
    name: "Claude Sonnet 5.5",
    provider: "Anthropic",
    contextLength: 200000,
    pricing: { prompt: 3.0, completion: 15.0 },
    description: "Frontier intelligence, nuance, deep coding, and reasoning.",
    isPopular: true,
    category: "flagship",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    contextLength: 2000000,
    pricing: { prompt: 1.25, completion: 5.0 },
    description: "High-capability Google flagship for complex problem solving.",
    isPopular: false,
    category: "flagship",
  },
  {
    id: "liquid/lfm-3-1.7b:free",
    name: "Liquid LFM 3 (Free)",
    provider: "Liquid",
    contextLength: 32000,
    pricing: { prompt: 0.0, completion: 0.0 },
    description: "100% free open model with fast token generation.",
    isPopular: true,
    category: "open-weights",
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Gemma 4 26B (Free)",
    provider: "Google",
    contextLength: 131072,
    pricing: { prompt: 0.0, completion: 0.0 },
    description: "Free high-performance open weights instruction model.",
    isPopular: true,
    category: "open-weights",
  },
  {
    id: "deepseek/deepseek-v4.1-flash",
    name: "DeepSeek V4.1 Flash",
    provider: "DeepSeek",
    contextLength: 64000,
    pricing: { prompt: 0.14, completion: 0.28 },
    description: "State of the art reasoning & coding at minimal cost.",
    isPopular: true,
    category: "reasoning",
  },
];

export function calculateEstimatedCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number
): number {
  const model = DEFAULT_MODELS.find((m) => m.id === modelId);
  if (!model || !model.pricing) {
    return (promptTokens * 0.5 + completionTokens * 1.5) / 1_000_000;
  }
  const promptCost = (promptTokens * model.pricing.prompt) / 1_000_000;
  const completionCost = (completionTokens * model.pricing.completion) / 1_000_000;
  return promptCost + completionCost;
}

export async function callOpenRouterModel({
  modelId,
  messages,
  apiKey,
}: {
  modelId: string;
  messages: { role: string; content: string }[];
  apiKey: string;
}): Promise<{
  content: string;
  metrics: ModelMetrics;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const siteUrl = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
    const siteName = process.env.OPENROUTER_SITE_NAME || "Multi-LLM Chat";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": siteUrl,
        "X-Title": siteName,
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: 1500, // Safe limit to prevent 402 upfront credit reservations
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = errText;
      try {
        const json = JSON.parse(errText);
        parsedErr = json.error?.message || json.message || errText;
      } catch {
        // use raw text
      }
      return {
        content: "",
        metrics: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
          latencyMs,
        },
        error: `OpenRouter API error (${response.status}): ${parsedErr}`,
      };
    }

    const data = await response.json();
    const generationId = data.id;
    const choice = data.choices?.[0];
    const content = choice?.message?.content || "";

    const promptTokens = data.usage?.prompt_tokens || 0;
    const completionTokens = data.usage?.completion_tokens || 0;
    const totalTokens = data.usage?.total_tokens || promptTokens + completionTokens;

    // Use OpenRouter reported cost or calculate estimate
    let cost = 0;
    if (data.usage?.cost !== undefined) {
      cost = Number(data.usage.cost);
    } else if (data.usage?.total_cost !== undefined) {
      cost = Number(data.usage.total_cost);
    } else {
      cost = calculateEstimatedCost(modelId, promptTokens, completionTokens);
    }

    return {
      content,
      metrics: {
        promptTokens,
        completionTokens,
        totalTokens,
        cost,
        latencyMs,
        generationId,
      },
    };
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: "",
      metrics: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cost: 0,
        latencyMs,
      },
      error: `Network/Request failed: ${message}`,
    };
  }
}
