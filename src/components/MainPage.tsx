import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { QueryInput } from './QueryInput';
import { ProviderColumn } from './ProviderColumn';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

export const MainPage: React.FC = () => {
  const { state } = useApp();

  const enabledProviders = Object.values(state.settings.providers).filter(p => p.enabled);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">

        {/* Query Input */}
        <QueryInput />

        {/* Current Query Display */}
        {state.currentSession && (
          <div className="mb-6 bg-card rounded-lg border border-border p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-foreground">Current Query:</span>
              <span className="text-sm text-muted-foreground">
                {new Date(state.currentSession.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-foreground mb-2">{state.currentSession.query}</p>
            {state.currentSession.enhancedQuery && (
              <div className="border-t pt-2">
                <span className="font-medium text-primary text-sm">Enhanced:</span>
                <p className="text-muted-foreground text-sm mt-1">{state.currentSession.enhancedQuery}</p>
              </div>
            )}
          </div>
        )}

        {/* Provider Columns */}
        {enabledProviders.length > 0 ? (
          <div className="flex space-x-6 overflow-x-auto pb-4 snap-x">
            {enabledProviders.map((provider) => {
              const response = state.currentSession?.responses.find(r => r.providerId === provider.id);
              const isBest = state.currentSession?.bestResponse === provider.id;
              return (
                <div key={provider.id} className="snap-center">
                  <ProviderColumn
                    provider={provider}
                    response={response}
                    isLoading={state.isLoading && !response}
                    isBest={isBest}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-card rounded-lg border border-border p-8 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-2">No AI Providers Enabled</h3>
              <p className="text-muted-foreground mb-4">
                Please enable at least one AI provider in settings to start comparing responses.
              </p>
              <Button
                onClick={() => window.location.hash = '#settings'}
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Go to Settings
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive">{state.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};