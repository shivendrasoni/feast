import React, { useState } from 'react';
import { Settings as SettingsIcon, Key, Eye, EyeOff, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProviderToggle } from './ProviderToggle';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export const Settings: React.FC = () => {
  const { state, dispatch, saveSettings } = useApp();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  const handleApiKeyChange = (providerId: string, apiKey: string) => {
    setApiKeys(prev => ({ ...prev, [providerId]: apiKey }));
    dispatch({
      type: 'UPDATE_PROVIDER',
      payload: {
        id: providerId,
        updates: { apiKey },
      },
    });
  };

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };

  const handleSave = () => {
    saveSettings();
    // Show success message (in a real app, you'd use a toast notification)
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <SettingsIcon className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      </div>

      {/* Provider Toggles */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">AI Providers</h2>
        <div className="grid gap-3">
          {Object.values(state.settings.providers).map((provider) => (
            <ProviderToggle key={provider.id} provider={provider} />
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">API Keys</h2>
        </div>
        <div className="space-y-4">
          {Object.values(state.settings.providers).map((provider) => (
            <div key={provider.id} className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {provider.name} API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKeys[provider.id] ? 'text' : 'password'}
                  value={apiKeys[provider.id] || provider.apiKey || ''}
                  onChange={(e) => handleApiKeyChange(provider.id, e.target.value)}
                  placeholder="Enter API key..."
                  className="w-full p-3 pr-12 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility(provider.id)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKeys[provider.id] ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">General Settings</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <Switch
              checked={state.settings.enhancePrompts}
              onCheckedChange={(checked) =>
                dispatch({
                  type: 'SET_SETTINGS',
                  payload: {
                    ...state.settings,
                    enhancePrompts: checked,
                  },
                })
              }
            />
            <div>
              <span className="text-foreground font-medium">Enhance prompts automatically</span>
              <p className="text-sm text-muted-foreground">Use GPT-4-mini to improve your queries before sending</p>
            </div>
          </label>

          <Separator />

          <label className="flex items-center space-x-3">
            <Switch
              checked={state.settings.autoPickBest}
              onCheckedChange={(checked) =>
                dispatch({
                  type: 'SET_SETTINGS',
                  payload: {
                    ...state.settings,
                    autoPickBest: checked,
                  },
                })
              }
            />
            <div>
              <span className="text-foreground font-medium">Auto-pick best response</span>
              <p className="text-sm text-muted-foreground">Automatically evaluate and highlight the best response</p>
            </div>
          </label>

          <Separator />

          <label className="flex items-center space-x-3">
            <Switch
              checked={state.settings.showMetrics}
              onCheckedChange={(checked) =>
                dispatch({
                  type: 'SET_SETTINGS',
                  payload: {
                    ...state.settings,
                    showMetrics: checked,
                  },
                })
              }
            />
            <div>
              <span className="text-foreground font-medium">Show performance metrics</span>
              <p className="text-sm text-muted-foreground">Display response times and token counts</p>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="flex items-center space-x-2"
        >
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </Button>
      </div>
    </div>
  );
};