'use client';

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { IconButton } from '../actions';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  disabled?: boolean;
  placeholder?: string;
  onSend: (message: string) => void;
}

export function ChatInput({
  disabled = false,
  placeholder = 'Ask me anything...',
  onSend,
}: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage();
  };

  const sendMessage = () => {
    const message = inputValue.trim();
    if (message && !disabled) {
      onSend(message);
      setInputValue('');
      resetTextareaHeight();
    }
  };

  const handleKeydown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Shift+Enter = new line (default behavior)
        return;
      } else {
        // Enter = send message
        event.preventDefault();
        sendMessage();
      }
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFocus = () => {
    if (containerRef.current && 'scrollIntoView' in containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
      }, 300);
    }
  };

  return (
    <div className={styles.inputContainer} ref={containerRef}>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            onKeyDown={handleKeydown}
            onInput={handleInput}
            onFocus={handleFocus}
            className={styles.messageInput}
          />
          <IconButton
            name="arrow-up"
            variant="inverse"
            type="submit"
            disabled={!inputValue.trim()}
            isLoading={disabled}
            alt="Send message (Enter)"
            size={24}
            onClick={sendMessage}
          />
        </div>
        <div className={styles.inputHint}>
          <span className={styles.hintText}>
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </form>
    </div>
  );
}
