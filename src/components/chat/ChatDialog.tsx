'use client';

import { useRef, useEffect, useCallback, type ReactNode } from 'react';
import styles from './ChatDialog.module.css';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function ChatDialog({ isOpen, onClose, children }: ChatDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const savedScrollYRef = useRef(0);

  // Handle viewport changes for mobile keyboard
  const handleViewportChange = useCallback(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      const keyboardHeight = Math.max(
        0,
        window.innerHeight - window.visualViewport.height
      );
      document.documentElement.style.setProperty(
        '--keyboard-height',
        `${keyboardHeight}px`
      );
    }
  }, []);

  // Handle dialog click (backdrop click to close)
  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  // Prevent content clicks from closing dialog
  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  // Handle keyboard events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  // Manage dialog open/close state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Manage scroll lock
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isOpen) {
      savedScrollYRef.current = window.scrollY;
      document.body.style.cssText = `
        overflow: hidden;
        position: fixed;
        width: 100%;
        top: -${savedScrollYRef.current}px;
      `;
    } else {
      document.body.style.cssText = '';
      if (savedScrollYRef.current) {
        window.scrollTo(0, savedScrollYRef.current);
      }
    }

    return () => {
      document.body.style.cssText = '';
    };
  }, [isOpen]);

  // Set up viewport change listener for mobile keyboard
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    window.visualViewport.addEventListener('resize', handleViewportChange);
    handleViewportChange();

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      document.documentElement.style.removeProperty('--keyboard-height');
    };
  }, [handleViewportChange]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.chatDialog}
      aria-labelledby="chat-title"
      onClick={handleDialogClick}
      onKeyDown={handleKeyDown}
    >
      {isOpen && (
        <div
          className={styles.dialogContent}
          role="none"
          onClick={handleContentClick}
        >
          {children}
        </div>
      )}
    </dialog>
  );
}
