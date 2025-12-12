'use client';

import { useRef, useEffect, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import styles from './ChatMessages.module.css';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
  error?: string | null;
  onPromptSelected?: (prompt: string) => void;
}

export function ChatMessages({
  messages,
  isLoading = false,
  error = null,
  onPromptSelected,
}: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current && !userScrolledUp) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading, userScrolledUp]);

  // Handle scroll events to detect user scrolling up
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setUserScrolledUp(!isNearBottom);
    }
  };

  return (
    <div
      className={styles.messagesContainer}
      ref={containerRef}
      onScroll={handleScroll}
    >
      {/* Welcome message if no messages */}
      {messages.length === 0 && !isLoading && !error && (
        <ChatMessage displayType="welcome" onPromptSelected={onPromptSelected} />
      )}

      {/* Render messages */}
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          displayType={message.type}
        />
      ))}

      {/* Loading state */}
      {isLoading && <ChatMessage displayType="loading" isLoading />}

      {/* Error state */}
      {error && <ChatMessage displayType="error" error={error} />}
    </div>
  );
}
