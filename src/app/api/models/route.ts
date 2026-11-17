import { NextResponse } from "next/server";
import { DEFAULT_MODELS } from "@/lib/openrouter";
import { ModelOption } from "@/lib/types";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    // Return curated defaults with warning flag
    return NextResponse.json({
      models: DEFAULT_MODELS,
      hasApiKey: false,
    });
  }

  try {
    // Try to fetch additional models from OpenRouter if available
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour on Next.js/Vercel
    });

    if (res.ok) {
      const data = await res.json();
      const openRouterList = Array.isArray(data?.data) ? data.data : [];

      // Create a map of default models for easy lookup
      const defaultIds = new Set(DEFAULT_MODELS.map((m) => m.id));

      // Map OpenRouter models
      const dynamicModels: ModelOption[] = openRouterList
        .filter((item: { id: string }) => !defaultIds.has(item.id))
        .slice(0, 30) // Take top 30 additional models to keep UI crisp
        .map((item: {
          id: string;
          name: string;
          context_length?: number;
          pricing?: { prompt?: string | number; completion?: string | number };
          description?: string;
        }) => {
          const promptPrice = item.pricing?.prompt
            ? Number(item.pricing.prompt) * 1_000_000
            : 0;
          const completionPrice = item.pricing?.completion
            ? Number(item.pricing.completion) * 1_000_000
            : 0;

          return {
            id: item.id,
            name: item.name || item.id,
            provider: item.id.split("/")[0] || "Unknown",
            contextLength: item.context_length || 128000,
            pricing: {
              prompt: promptPrice,
              completion: completionPrice,
            },
            description: item.description?.slice(0, 120),
            category: "open-weights",
          };
        });

      return NextResponse.json({
        models: [...DEFAULT_MODELS, ...dynamicModels],
        hasApiKey: true,
      });
    }
  } catch (err) {
    console.warn("Could not fetch remote OpenRouter models, using defaults:", err);
  }

  return NextResponse.json({
    models: DEFAULT_MODELS,
    hasApiKey: true,
  });
}
