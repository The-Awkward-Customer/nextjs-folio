import { Icon, type IconName } from '../primitives';
import styles from './IconButton.module.css';

type ButtonVariant = 'inverse' | 'primary';

interface IconButtonProps {
  name: IconName;
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isLoading?: boolean;
  alt?: string;
  size?: number;
  onClick: () => void;
  className?: string;
}

export function IconButton({
  name,
  variant = 'inverse',
  type = 'button',
  disabled = false,
  isLoading = false,
  alt = '',
  size = 32,
  onClick,
  className = '',
}: IconButtonProps) {
  const computedFill = variant === 'primary' ? '--fg-text-primary' : '--fg-text-inverse';

  const classes = [
    styles.btn,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={styles.btnRoot}>
      <button
        className={classes}
        aria-label={alt || name}
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        {isLoading ? (
          <Icon
            name="refresh"
            alt="Loading"
            size={size}
            fill={computedFill}
            className={styles.loadingIcon}
          />
        ) : (
          <Icon name={name} alt={alt} size={size} fill={computedFill} />
        )}
      </button>
    </span>
  );
}
