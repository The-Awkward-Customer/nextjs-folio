import styles from './Tag.module.css';

interface TagProps {
  label: string;
  variant?: 'primary' | 'inverse';
  className?: string;
}

export function Tag({ label, variant = 'primary', className = '' }: TagProps) {
  const classes = [
    styles.tag,
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{label}</span>;
}
