'use client';

import { Avatar } from '../primitives';
import { PromptButton } from '../actions';
import type { ChatMessage as ChatMessageType, MessageDisplayType } from '@/types/chat';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message?: ChatMessageType;
  displayType?: MessageDisplayType;
  error?: string;
  isLoading?: boolean;
  onPromptSelected?: (prompt: string) => void;
}

const suggestedPrompts = [
  "What's your experience?",
  "What's your tech-stack?",
  "What's your process?",
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatMessage({
  message,
  displayType,
  error,
  isLoading = false,
  onPromptSelected,
}: ChatMessageProps) {
  // Determine display type from props
  const actualDisplayType: MessageDisplayType = (() => {
    if (displayType) return displayType;
    if (isLoading) return 'loading';
    if (error) return 'error';
    if (!message) return 'welcome';
    return message.type;
  })();

  const handlePromptClick = (prompt: string) => {
    onPromptSelected?.(prompt);
  };

  // User Message
  if (actualDisplayType === 'user' && message) {
    return (
      <div className={`${styles.message} ${styles.userMessage}`}>
        <div className={`${styles.messageContent} ${styles.userContent}`}>
          <div className={`${styles.messageBubble} ${styles.userBubble}`}>
            <p>{message.content}</p>
          </div>
          <div className={`${styles.messageMeta} ${styles.userMeta}`}>
            <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant Message
  if (actualDisplayType === 'assistant' && message) {
    return (
      <div className={`${styles.message} ${styles.assistantMessage}`}>
        <div className={`${styles.messageAvatar} ${styles.assistantAvatar}`}>
          <Avatar size="xs" alt="Assistant avatar" />
        </div>
        <div className={`${styles.messageContent} ${styles.assistantContent}`}>
          <div className={`${styles.messageBubble} ${styles.assistantBubble}`}>
            <p>{message.content}</p>
          </div>
          <div className={`${styles.messageMeta} ${styles.assistantMeta}`}>
            <span className={styles.messageTime}>{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Loading Message
  if (actualDisplayType === 'loading') {
    return (
      <div className={`${styles.message} ${styles.loadingMessage}`}>
        <div className={`${styles.messageAvatar} ${styles.loadingAvatar}`}>
          <Avatar
            size="xs"
            alt="Assistant avatar"
            src="/images/Ani_me_glitched.png"
            isLoading={true}
          />
        </div>
        <div className={`${styles.messageContent} ${styles.loadingContent}`}>
          <div className={`${styles.messageBubble} ${styles.loadingBubble}`}>
            <p className={styles.loadingText}>Thinking...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error Message
  if (actualDisplayType === 'error' && error) {
    return (
      <div className={`${styles.message} ${styles.errorMessage}`}>
        <div className={styles.errorContent}>
          <span className={styles.errorIcon}>Warning</span>
          <div>
            <p className={styles.errorTitle}>Something went wrong</p>
            <p className={styles.errorDetails}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Welcome Message
  return (
    <div className={`${styles.message} ${styles.assistantMessage}`}>
      <div className={`${styles.messageAvatar} ${styles.assistantAvatar}`}>
        <Avatar size="xs" alt="Assistant avatar" />
      </div>
      <div className={`${styles.messageContent} ${styles.assistantContent}`}>
        <div className={`${styles.messageBubble} ${styles.assistantBubble}`}>
          <p>
            Hello! I&apos;m here to help answer questions about my background, skills,
            and experience. Feel free to ask me anything!
          </p>
        </div>
        <div className={styles.promptButtons}>
          {suggestedPrompts.map((prompt) => (
            <PromptButton
              key={prompt}
              label={prompt}
              onClick={() => handlePromptClick(prompt)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
