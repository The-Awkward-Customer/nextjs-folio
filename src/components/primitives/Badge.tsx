'use client';

import { useState, useEffect } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  pulse?: boolean;
  className?: string;
  delay?: number;
}

export function Badge({ pulse = false, className = '', delay = 1000 }: BadgeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!mounted) {
    return null;
  }

  const classes = [
    styles.badge,
    pulse && styles.badgePulse,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} role="status" aria-label="Status badge" />
  );
}
