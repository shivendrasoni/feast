import React from 'react';
import { AIProvider } from '../types';
import { useApp } from '../context/AppContext';
import { Switch } from '@/components/ui/switch';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProviderToggleProps {
  provider: AIProvider;
}

export const ProviderToggle: React.FC<ProviderToggleProps> = ({ provider }) => {
  const { dispatch } = useApp();

  const handleToggle = (checked: boolean) => {
    dispatch({
      type: 'UPDATE_PROVIDER',
      payload: {
        id: provider.id,
        updates: { enabled: checked },
      },
    });
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-border">
      <Bot className={cn("w-4 h-4", provider.color)} />
      <span className="font-medium text-foreground flex-grow">{provider.name}</span>
      <Switch
        checked={provider.enabled}
        onCheckedChange={handleToggle}
      />
    </div>
  );
};