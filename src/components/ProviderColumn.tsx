import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AIProvider, AIResponse } from '../types';
import { Clock, AlertCircle, CheckCircle2, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProviderColumnProps {
  provider: AIProvider;
  response?: AIResponse;
  isLoading: boolean;
  isBest?: boolean;
}

export const ProviderColumn: React.FC<ProviderColumnProps> = ({
  provider,
  response,
  isLoading,
  isBest,
}) => {
  return (
    <div className="flex-shrink-0 w-80 h-full bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className={cn("w-5 h-5", provider.color)} />
            <h3 className="font-medium text-foreground">{provider.name}</h3>
          </div>
          {isBest && (
            <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Best</span>
            </div>
          )}
        </div>
        {provider.enabled && (
          <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 h-[500px] overflow-y-auto">
        {!provider.enabled ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Provider disabled</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Generating response...</p>
            </div>
          </div>
        ) : response?.error ? (
          <div className="flex items-center justify-center h-full text-destructive">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">{response.error}</p>
            </div>
          </div>
        ) : response?.content ? (
          <div className="space-y-4">
            <div className="text-foreground leading-relaxed text-sm prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-li:text-foreground">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {response.content}
              </ReactMarkdown>
            </div>
            
            {/* Metrics */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{response.responseTime}ms</span>
              </div>
              {response.tokenCount && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{response.tokenCount} tokens</span>
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {response.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Awaiting query...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};