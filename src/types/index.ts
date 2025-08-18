export interface AIProvider {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  maxTokens?: number;
}

export interface AIResponse {
  providerId: string;
  content: string;
  responseTime: number;
  timestamp: Date;
  error?: string;
  tokenCount?: number;
}

export interface QuerySession {
  id: string;
  query: string;
  enhancedQuery?: string;
  responses: AIResponse[];
  bestResponse?: string;
  timestamp: Date;
}

export interface AppSettings {
  providers: Record<string, AIProvider>;
  enhancePrompts: boolean;
  autoPickBest: boolean;
  showMetrics: boolean;
}