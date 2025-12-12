'use client';

import { type CSSProperties } from 'react';
import styles from './Avatar.module.css';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

interface BaseAvatarProps {
  size?: AvatarSize;
  src?: string;
  alt?: string;
  className?: string;
  isLoading?: boolean;
}

type AvatarProps = BaseAvatarProps &
  (
    | {
        isButton: true;
        onClick: () => void;
        disabled?: boolean;
      }
    | {
        isButton?: false;
        onClick?: never;
        disabled?: never;
      }
  );

export function Avatar({
  size = 'md',
  src = '/images/Ani_me.png',
  alt = 'Avatar',
  className = '',
  isButton = false,
  isLoading = false,
  ...props
}: AvatarProps) {
  const classes = [
    styles.avatar,
    styles[`avatar${size.charAt(0).toUpperCase() + size.slice(1)}`],
    isButton && styles.avatarButton,
    isLoading && styles.glitchActive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const imageStyle: CSSProperties = {
    backgroundImage: `url(${src})`,
  };

  const content = (
    <>
      <span
        className={styles.avatarImage}
        style={imageStyle}
        role="img"
        aria-label={alt}
      />
      {isLoading && (
        <>
          <span className={styles.glitchRed} style={imageStyle} aria-hidden="true" />
          <span className={styles.glitchGreen} style={imageStyle} aria-hidden="true" />
          <span className={styles.glitchBlue} style={imageStyle} aria-hidden="true" />
          <span className={styles.glitchScanlines} aria-hidden="true" />
        </>
      )}
    </>
  );

  if (isButton) {
    const { onClick, disabled } = props as { onClick: () => void; disabled?: boolean };
    return (
      <button
        className={classes}
        onClick={onClick}
        disabled={disabled}
        aria-label={alt}
        aria-busy={isLoading}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={classes} aria-busy={isLoading}>
      {content}
    </div>
  );
}
