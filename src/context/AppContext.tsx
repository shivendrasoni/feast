import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AIProvider, AIResponse, QuerySession, AppSettings } from '../types';
import { encryptData, decryptData } from '../utils/encryption';

interface AppState {
  settings: AppSettings;
  currentSession: QuerySession | null;
  sessions: QuerySession[];
  isLoading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'UPDATE_PROVIDER'; payload: { id: string; updates: Partial<AIProvider> } }
  | { type: 'START_QUERY'; payload: { query: string; enhancedQuery?: string } }
  | { type: 'ADD_RESPONSE'; payload: AIResponse }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BEST_RESPONSE'; payload: string };

const initialProviders: Record<string, AIProvider> = {
  openai: {
    id: 'openai',
    name: 'ChatGPT',
    color: 'text-green-400',
    enabled: true,
    model: 'gpt-4.1',
    maxTokens: 2000,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Claude',
    color: 'text-orange-400',
    enabled: true,
    model: 'claude-3-sonnet',
    maxTokens: 2000,
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    color: 'text-blue-400',
    enabled: true,
    model: 'deepseek-chat',
    maxTokens: 2000,
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    color: 'text-cyan-400',
    enabled: true,
    model: 'llama-3.1-sonar-large-128k-online',
    maxTokens: 2000,
  },
  grok: {
    id: 'grok',
    name: 'Grok',
    color: 'text-gray-400',
    enabled: false,
    model: 'grok-beta',
    maxTokens: 2000,
  },
};

const initialState: AppState = {
  settings: {
    providers: initialProviders,
    enhancePrompts: true,
    autoPickBest: true,
    showMetrics: true,
  },
  currentSession: null,
  sessions: [],
  isLoading: false,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'UPDATE_PROVIDER':
      return {
        ...state,
        settings: {
          ...state.settings,
          providers: {
            ...state.settings.providers,
            [action.payload.id]: {
              ...state.settings.providers[action.payload.id],
              ...action.payload.updates,
            },
          },
        },
      };
    case 'START_QUERY':
      const newSession: QuerySession = {
        id: Date.now().toString(),
        query: action.payload.query,
        enhancedQuery: action.payload.enhancedQuery,
        responses: [],
        timestamp: new Date(),
      };
      return {
        ...state,
        currentSession: newSession,
        isLoading: true,
        error: null,
      };
    case 'ADD_RESPONSE':
      if (!state.currentSession) return state;
      const updatedSession = {
        ...state.currentSession,
        responses: [...state.currentSession.responses, action.payload],
      };
      return {
        ...state,
        currentSession: updatedSession,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_BEST_RESPONSE':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          bestResponse: action.payload,
        },
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  saveSettings: () => void;
  loadSettings: () => void;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const saveSettings = () => {
    try {
      const encrypted = encryptData(JSON.stringify(state.settings));
      localStorage.setItem('aifeast-settings', encrypted);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const loadSettings = () => {
    try {
      const encrypted = localStorage.getItem('aifeast-settings');
      if (encrypted) {
        const decrypted = decryptData(encrypted);
        const settings = JSON.parse(decrypted) as AppSettings;
        dispatch({ type: 'SET_SETTINGS', payload: settings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, saveSettings, loadSettings }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};