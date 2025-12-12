'use client';

import { useChat } from '@/hooks/useChat';
import { ChatTrigger, QAChat } from '@/components/chat';
import { AnimatedTextPath } from '@/components/graphics';
import { Button } from '@/components/actions';
import styles from './page.module.css';

export default function Home() {
  const { openChat, shouldShowIndicator } = useChat();

  function handleChatTriggerClick() {
    openChat();
  }

  return (
    <>
      <div className={styles.pageContainer}>
        <div className={styles.backgroundAnimation}>
          <AnimatedTextPath
            texts={['COMING SOON']}
            showPath={false}
            speed={80}
            pathWildness={0.9}
            verticalBounds={0.1}
            textStyle={{
              font: 'bold 48px sans-serif',
              size: 48,
              color: '#888888',
            }}
          />
        </div>

        <div className={styles.content}>
          <div className={styles.topBar}>
            <div className={styles.chatTriggerContainer}>
              <ChatTrigger
                onClick={handleChatTriggerClick}
                shouldShowIndicator={shouldShowIndicator}
              />
            </div>
            <Button
              as="link"
              href="/documents/Peter_Abbott_CV_04:08:25.pdf"
              label="Download CV"
              variant="primary"
              target="_blank"
            />
          </div>

          <div className={styles.comingSoon}>
            <h1>
              Peter
              <br />
              Abbott
            </h1>
          </div>
        </div>
      </div>

      <QAChat />
    </>
  );
}
