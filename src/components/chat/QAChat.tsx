'use client';

import { useChat } from '@/hooks/useChat';
import { ChatDialog } from './ChatDialog';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { Button, IconButton } from '../actions';
import { Tag } from '../primitives';
import type { ChatMessage } from '@/types/chat';
import { isChatApiResponse, isChatApiError } from '@/types/chat';
import styles from './QAChat.module.css';

export function QAChat() {
  const {
    messages,
    isLoading,
    error,
    isOpen,
    closeChat,
    addMessage,
    clearMessages,
    setLoading,
    setError,
  } = useChat();

  function createUserMessage(content: string): ChatMessage {
    return {
      id: crypto.randomUUID(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
  }

  function createAssistantMessage(content: string): ChatMessage {
    return {
      id: crypto.randomUUID(),
      type: 'assistant',
      content,
      timestamp: new Date(),
    };
  }

  async function handleSendMessage(question: string): Promise<void> {
    if (!question.trim() || isLoading) {
      return;
    }

    const userMessage = createUserMessage(question);

    addMessage(userMessage);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      const result: unknown = await response.json();

      if (!response.ok) {
        if (isChatApiError(result)) {
          throw new Error(`${result.error}: ${result.details || ''}`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!isChatApiResponse(result)) {
        throw new Error('Invalid response format from server');
      }

      const assistantMessage = createAssistantMessage(result.response);

      addMessage(assistantMessage);
      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get response';
      console.error('Chat error:', err);

      setError(errorMessage);
      setLoading(false);
    }
  }

  function handleClearMessages(): void {
    clearMessages();
  }

  return (
    <ChatDialog isOpen={isOpen} onClose={closeChat}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <Tag label="Beta" />
          <div className={styles.chatActions}>
            {messages.length > 0 && (
              <Button
                as="button"
                variant="ghost"
                label="Clear"
                onClick={handleClearMessages}
              />
            )}
            <IconButton
              name="close"
              variant="inverse"
              alt="Close chat"
              size={24}
              onClick={closeChat}
            />
          </div>
        </div>

        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          error={error}
          onPromptSelected={handleSendMessage}
        />

        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </ChatDialog>
  );
}
