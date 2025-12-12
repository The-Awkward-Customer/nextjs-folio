'use client';

import Image from 'next/image';
import { Badge } from '../primitives';
import styles from './ChatTrigger.module.css';

interface ChatTriggerProps {
  onClick?: () => void;
  onMouseEnter?: () => void;
  shouldShowIndicator?: boolean;
}

export function ChatTrigger({
  onClick,
  onMouseEnter,
  shouldShowIndicator = true,
}: ChatTriggerProps) {
  return (
    <button
      className={styles.chatTrigger}
      onClick={onClick}
      aria-label="Chat with Peter Abbott"
      onMouseEnter={onMouseEnter}
    >
      <Image
        src="/images/Ani_me.png"
        alt="Peter Abbott"
        width={54}
        height={54}
        className={styles.profileImage}
        priority
      />
      {shouldShowIndicator && <Badge className={styles.chatIndicator} pulse />}
    </button>
  );
}
