// Chat-related types and interfaces

/**
 * Represents the type of message in a chat conversation
 */
export type MessageType = 'user' | 'assistant';

/**
 * Represents a single chat message
 */
export interface ChatMessage {
  /** Unique identifier for the message */
  id: string;
  /** Type of message (user or assistant) */
  type: MessageType;
  /** The actual message content */
  content: string;
  /** When the message was created */
  timestamp: Date;
}

/**
 * Represents a search result from the QA system
 */
export interface QASearchResult {
  /** The question that was matched */
  question: string;
  /** The answer to the question */
  answer: string;
  /** Similarity score (0-1) */
  similarity: number;
  /** Optional category classification */
  category?: string;
  /** Optional tags for the QA pair */
  tags?: string[];
}

/**
 * Response structure from the chat API
 */
export interface ChatApiResponse {
  /** The original question asked */
  question: string;
  /** Similar Q&A pairs found in the search */
  similarQAs: Array<{
    question: string;
    answer: string;
    similarity: number;
  }>;
  /** The generated response */
  response: string;
  /** Debug information about the response generation */
  debug: {
    embeddingLength: number;
    searchResults: number;
    responseLength: number;
  };
}

/**
 * Error response structure from the chat API
 */
export interface ChatApiError {
  /** Error message */
  error: string;
  /** Optional additional error details */
  details?: string;
}

/**
 * Overall state of the chat component
 */
export interface ChatState {
  /** Array of chat messages */
  messages: ChatMessage[];
  /** Whether the chat is currently loading */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Whether the chat dialog is open */
  isOpen: boolean;
  /** Whether the chat has been opened before */
  hasBeenOpened: boolean;
}

/**
 * Message display types for different chat states
 */
export type MessageDisplayType =
  | 'user'
  | 'assistant'
  | 'loading'
  | 'error'
  | 'welcome';

/**
 * Props for ChatMessage component
 */
export interface ChatMessageProps {
  /** The message to display (optional for non-message states) */
  message?: ChatMessage;
  /** The type of display state */
  displayType?: MessageDisplayType;
  /** Error message for error state */
  error?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Callback for when a prompt is selected */
  onPromptSelected?: (prompt: string) => void;
}

/**
 * Props for ChatMessages component
 */
export interface ChatMessagesProps {
  /** Array of messages to display */
  messages: ChatMessage[];
  /** Whether messages are currently loading */
  isLoading?: boolean;
  /** Current error message, if any */
  error?: string | null;
  /** Callback for when a prompt is selected */
  onPromptSelected?: (prompt: string) => void;
}

/**
 * Props for ChatInput component
 */
export interface ChatInputProps {
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Callback when a message is sent */
  onSend: (message: string) => void;
}

/**
 * Props for ChatDialog component
 */
export interface ChatDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog closes */
  onClose: () => void;
  /** Dialog content */
  children: React.ReactNode;
}

/**
 * Props for ChatTrigger component
 */
export interface ChatTriggerProps {
  /** Click handler to open chat */
  onClick: () => void;
  /** Whether to show the indicator badge */
  shouldShowIndicator: boolean;
}

// Type Guards
/**
 * Type guard to check if a value is a valid ChatMessage
 */
export function isChatMessage(value: unknown): value is ChatMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'content' in value &&
    'timestamp' in value &&
    typeof (value as ChatMessage).id === 'string' &&
    ['user', 'assistant'].includes((value as ChatMessage).type) &&
    typeof (value as ChatMessage).content === 'string' &&
    (value as ChatMessage).timestamp instanceof Date
  );
}

/**
 * Type guard to check if a value is a valid ChatApiResponse
 */
export function isChatApiResponse(value: unknown): value is ChatApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'response' in value &&
    'question' in value &&
    'similarQAs' in value &&
    'debug' in value &&
    typeof (value as ChatApiResponse).response === 'string' &&
    typeof (value as ChatApiResponse).question === 'string' &&
    Array.isArray((value as ChatApiResponse).similarQAs) &&
    typeof (value as ChatApiResponse).debug === 'object'
  );
}

/**
 * Type guard to check if a value is a ChatApiError
 */
export function isChatApiError(value: unknown): value is ChatApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ChatApiError).error === 'string'
  );
}
