export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  contextLength?: number;
  pricing?: {
    prompt: number; // cost per 1M tokens in USD
    completion: number; // cost per 1M tokens in USD
  };
  description?: string;
  isPopular?: boolean;
  category?: 'flagship' | 'fast' | 'reasoning' | 'open-weights';
}

export interface ModelMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number; // USD
  latencyMs: number; // Milliseconds
  generationId?: string;
}

export interface ModelResponseItem {
  id: string;
  modelId: string;
  modelName: string;
  content: string;
  metrics: ModelMetrics;
  status: 'pending' | 'success' | 'error';
  error?: string;
  savedToSupabase?: boolean;
}

export interface ChatTurn {
  id: string;
  userMessage: {
    id: string;
    content: string;
    createdAt: string;
  };
  assistantResponses: ModelResponseItem[];
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatApiRequest {
  conversationId?: string;
  message: string;
  models: string[];
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AuthStatusResponse {
  authenticated: boolean;
  requiresPin: boolean;
}
