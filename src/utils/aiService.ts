import { AIProvider, AIResponse } from '../types';
import OpenAI from 'openai';

// Provider configurations for OpenAI-compatible APIs
const PROVIDER_CONFIGS = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4.1',
    headers: {}
  },
  anthropic: {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    headers: {
      'anthropic-version': '2023-06-01'
    }
  },
  deepseek: {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    headers: {}
  },
  perplexity: {
    baseURL: 'https://api.perplexity.ai',
    defaultModel: 'llama-3.1-sonar-large-128k-online',
    headers: {}
  },
  grok: {
    baseURL: 'https://api.x.ai/v1',
    defaultModel: 'grok-beta',
    headers: {}
  }
};

// Create OpenAI client for any provider
function createProviderClient(provider: AIProvider): OpenAI {
  const config = PROVIDER_CONFIGS[provider.id as keyof typeof PROVIDER_CONFIGS];
  if (!config) {
    throw new Error(`Unsupported provider: ${provider.id}`);
  }

  // Handle Anthropic's different auth header
  const authHeaders = provider.id === 'anthropic' 
    ? { 'x-api-key': provider.apiKey! }
    : { 'Authorization': `Bearer ${provider.apiKey}` };

  return new OpenAI({
    baseURL: config.baseURL,
    apiKey: provider.apiKey!,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      ...authHeaders,
      ...config.headers
    }
  });
}

// Unified query function using OpenAI SDK for all providers
async function queryProviderUnified(provider: AIProvider, query: string) {
  const config = PROVIDER_CONFIGS[provider.id as keyof typeof PROVIDER_CONFIGS];
  const client = createProviderClient(provider);

  try {
    const completion = await client.chat.completions.create({
      model: provider.model || config.defaultModel,
      messages: [{ role: 'user', content: query }],
      max_tokens: provider.maxTokens || 2000,
      temperature: 0.7,
    });

    return {
      content: completion.choices[0]?.message?.content || 'No response generated',
      tokenCount: completion.usage?.total_tokens || 0,
    };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`${provider.name} API error: ${error.status} - ${error.message}`);
    }
    throw error;
  }
}

// Make actual API calls to AI providers
export const queryAI = async (provider: AIProvider, query: string): Promise<AIResponse> => {
  const startTime = Date.now();
  
  if (!provider.apiKey) {
  const responseTime = Date.now() - startTime;
    return {
      providerId: provider.id,
      content: '',
      responseTime,
      timestamp: new Date(),
      error: `API key not provided for ${provider.name}`,
    };
  }

  try {
    const response = await queryProviderUnified(provider, query);
    
    const responseTime = Date.now() - startTime;
    return {
      providerId: provider.id,
      content: response.content,
      responseTime,
      timestamp: new Date(),
      tokenCount: response.tokenCount,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      providerId: provider.id,
      content: '',
      responseTime,
      timestamp: new Date(),
      error: `API Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

export const enhancePrompt = async (originalPrompt: string, openaiApiKey?: string): Promise<string> => {
  if (!openaiApiKey) {
    // Fallback to basic enhancement if no API key
    return `${originalPrompt} Please provide a comprehensive and detailed response.`;
  }

  try {
    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{
        role: 'system',
        content: 'You are a prompt enhancement assistant. Take the user\'s query and enhance it to be more specific, detailed, and likely to generate better responses from AI models. Keep the core intent but add context, structure, and clarity. Return only the enhanced prompt.'
      }, {
        role: 'user',
        content: originalPrompt
      }],
      max_tokens: 500,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || originalPrompt;
  } catch (error) {
    console.warn('Error enhancing prompt:', error);
    return `${originalPrompt} Please provide a comprehensive and detailed response.`;
  }
};

export const pickBestResponse = async (responses: AIResponse[], openaiApiKey?: string): Promise<string> => {
  const validResponses = responses.filter(r => !r.error && r.content);
  if (validResponses.length === 0) return '';
  if (validResponses.length === 1) return validResponses[0].providerId;

  if (!openaiApiKey) {
    // Fallback to simple heuristic if no API key
    // Pick response with highest content length as a simple metric
    const bestResponse = validResponses.reduce((best, current) => 
      current.content.length > best.content.length ? current : best
    );
  return bestResponse.providerId;
  }

  try {
    const openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true,
    });

    const responseTexts = validResponses.map((r, index) => 
      `Response ${index + 1} (${r.providerId}): ${r.content.substring(0, 1000)}...`
    ).join('\n\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: 'You are an AI response evaluator. Compare the provided responses and determine which one is the best based on accuracy, helpfulness, clarity, and completeness. Return only the number of the best response (1, 2, 3, etc.).'
      }, {
        role: 'user',
        content: `Please evaluate these responses and tell me which one is best:\n\n${responseTexts}`
      }],
      max_tokens: 10,
      temperature: 0.1,
    });

    const choice = completion.choices[0]?.message?.content?.trim();
    const responseIndex = parseInt(choice || '') - 1;
    
    if (responseIndex >= 0 && responseIndex < validResponses.length) {
      return validResponses[responseIndex].providerId;
    }
    
    return validResponses[0].providerId;
  } catch (error) {
    console.warn('Error picking best response:', error);
    return validResponses[0].providerId;
  }
};