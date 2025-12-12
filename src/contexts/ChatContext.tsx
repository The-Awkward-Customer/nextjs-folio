'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { ChatMessage, ChatState } from '@/types/chat';

// Actions
type ChatAction =
  | { type: 'OPEN_CHAT' }
  | { type: 'CLOSE_CHAT' }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Context value interface
interface ChatContextValue extends ChatState {
  openChat: () => void;
  closeChat: () => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  shouldShowIndicator: boolean;
  hasMessages: boolean;
}

// Initial state
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
  isOpen: false,
  hasBeenOpened: false,
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'OPEN_CHAT':
      return {
        ...state,
        isOpen: true,
        hasBeenOpened: true,
      };
    case 'CLOSE_CHAT':
      return {
        ...state,
        isOpen: false,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Context
const ChatContext = createContext<ChatContextValue | null>(null);

// Provider
interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const openChat = useCallback(() => {
    dispatch({ type: 'OPEN_CHAT' });
  }, []);

  const closeChat = useCallback(() => {
    dispatch({ type: 'CLOSE_CHAT' });
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Derived values
  const shouldShowIndicator = useMemo(
    () => !state.hasBeenOpened || (!state.isOpen && state.messages.length === 0),
    [state.hasBeenOpened, state.isOpen, state.messages.length]
  );

  const hasMessages = useMemo(
    () => state.messages.length > 0,
    [state.messages.length]
  );

  const value: ChatContextValue = useMemo(
    () => ({
      ...state,
      openChat,
      closeChat,
      addMessage,
      clearMessages,
      setLoading,
      setError,
      reset,
      shouldShowIndicator,
      hasMessages,
    }),
    [
      state,
      openChat,
      closeChat,
      addMessage,
      clearMessages,
      setLoading,
      setError,
      reset,
      shouldShowIndicator,
      hasMessages,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// Hook
export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

// Helper to generate message IDs
export function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
