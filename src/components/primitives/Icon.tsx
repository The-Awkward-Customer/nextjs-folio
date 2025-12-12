import { type CSSProperties } from 'react';

export type IconName =
  | 'arrow-right'
  | 'arrow-up'
  | 'close'
  | 'send'
  | 'refresh'
  | 'trash'
  | 'warning';

interface IconProps {
  name: IconName;
  size?: number;
  fill?: string;
  alt?: string;
  className?: string;
}

const icons: Record<IconName, string> = {
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  'arrow-up': 'M12 19V5M5 12l7-7 7 7',
  'close': 'M6 6l12 12M6 18L18 6',
  'send': 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  'refresh': 'M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15',
  'trash': 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6',
  'warning': 'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
};

export function Icon({
  name,
  size = 24,
  fill = '--fg-text-primary',
  alt,
  className = ''
}: IconProps) {
  const path = icons[name];

  // Handle CSS variable fill
  const strokeColor = fill.startsWith('--') ? `var(${fill})` : fill;

  const style: CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
  };

  return (
    <svg
      className={`icon ${className}`}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={!alt}
      aria-label={alt}
      role={alt ? 'img' : undefined}
    >
      <path d={path} />
    </svg>
  );
}
