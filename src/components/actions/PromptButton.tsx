import styles from './PromptButton.module.css';

interface PromptButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export function PromptButton({ label, onClick, className = '' }: PromptButtonProps) {
  const classes = [styles.promptButton, className].filter(Boolean).join(' ');

  return (
    <button className={classes} onClick={onClick} type="button">
      {label}
    </button>
  );
}
