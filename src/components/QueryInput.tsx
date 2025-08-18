import React, { useState } from 'react';
import { Send, Wand2, Zap, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { queryAI, enhancePrompt, pickBestResponse } from '../utils/aiService';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export const QueryInput: React.FC = () => {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || state.isLoading) return;

    let finalQuery = query;

    // Enhance prompt if enabled
    if (state.settings.enhancePrompts) {
      setIsEnhancing(true);
      try {
        const openaiApiKey = state.settings.providers.openai?.apiKey;
        finalQuery = await enhancePrompt(query, openaiApiKey);
      } catch (error) {
        console.error('Failed to enhance prompt:', error);
      }
      setIsEnhancing(false);
    }

    // Start query session
    dispatch({
      type: 'START_QUERY',
      payload: { query, enhancedQuery: finalQuery !== query ? finalQuery : undefined },
    });

    // Query all enabled providers
    const enabledProviders = Object.values(state.settings.providers).filter(p => p.enabled);
    const responses: any[] = [];

    const queryPromises = enabledProviders.map(async (provider) => {
      try {
        const response = await queryAI(provider, finalQuery);
        dispatch({ type: 'ADD_RESPONSE', payload: response });
        responses.push(response);
      } catch (error) {
        dispatch({
          type: 'ADD_RESPONSE',
          payload: {
            providerId: provider.id,
            content: '',
            responseTime: 0,
            timestamp: new Date(),
            error: `Failed to query ${provider.name}`,
          },
        });
      }
    });

    await Promise.all(queryPromises);

    // Pick best response if enabled
    if (state.settings.autoPickBest && responses.length > 0) {
      try {
        const openaiApiKey = state.settings.providers.openai?.apiKey;
        const bestProviderId = await pickBestResponse(responses, openaiApiKey);
        if (bestProviderId) {
          dispatch({ type: 'SET_BEST_RESPONSE', payload: bestProviderId });
        }
      } catch (error) {
        console.error('Failed to pick best response:', error);
      }
    }

    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const enabledCount = Object.values(state.settings.providers).filter(p => p.enabled).length;

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything..."
            className="w-full h-32 p-4 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-foreground placeholder:text-muted-foreground"
            disabled={state.isLoading || isEnhancing}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <Switch
                checked={state.settings.enhancePrompts}
                onCheckedChange={(checked) =>
                  dispatch({
                    type: 'SET_SETTINGS',
                    payload: { ...state.settings, enhancePrompts: checked },
                  })
                }
              />
              <span className="text-sm text-foreground">Enhance prompt</span>
            </label>
            <label className="flex items-center space-x-2">
              <Switch
                checked={state.settings.autoPickBest}
                onCheckedChange={(checked) =>
                  dispatch({
                    type: 'SET_SETTINGS',
                    payload: { ...state.settings, autoPickBest: checked },
                  })
                }
              />
              <span className="text-sm text-foreground">Auto-pick best</span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={!query.trim() || state.isLoading || isEnhancing || enabledCount === 0}
            className="flex items-center space-x-2"
          >
            {isEnhancing ? (
              <>
                <Zap className="w-4 h-4 animate-pulse" />
                <span>Enhancing...</span>
              </>
            ) : state.isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Querying...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send to All</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};