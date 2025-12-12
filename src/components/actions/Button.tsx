import { Icon, type IconName } from '../primitives';
import styles from './Button.module.css';

type ButtonVariant = 'inverse' | 'primary' | 'ghost';

interface CommonProps {
  variant?: ButtonVariant;
  label: string;
  disabled?: boolean;
  iconName?: IconName;
  fullWidth?: boolean;
  className?: string;
}

type ButtonAsButton = CommonProps & {
  as: 'button';
  type?: 'button' | 'submit' | 'reset';
  onClick: () => void;
};

type ButtonAsLink = CommonProps & {
  as: 'link';
  href: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const {
    label,
    variant = 'inverse',
    as,
    disabled,
    iconName,
    fullWidth = false,
    className = '',
  } = props;

  const iconFillColor = variant === 'inverse' ? '--fg-text-inverse' : '--fg-text-primary';

  const classes = [
    styles.btn,
    styles[variant],
    fullWidth && styles.fullWidth,
    iconName && styles.hasIcon,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <span className={styles.btnLayout}>
      {iconName && <Icon name={iconName} size={24} fill={iconFillColor} />}
      <span className={styles.middle}>{label}</span>
    </span>
  );

  if (as === 'button') {
    const { type = 'button', onClick } = props as ButtonAsButton;
    return (
      <button
        className={classes}
        aria-label={label}
        type={type}
        disabled={disabled}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  const { href, target, rel } = props as ButtonAsLink;
  return (
    <a
      className={classes}
      aria-label={label}
      href={href}
      target={target}
      rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
    >
      {content}
    </a>
  );
}
