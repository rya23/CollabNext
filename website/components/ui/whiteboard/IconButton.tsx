import styles from "./IconButton.module.css";

type Props = {
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
};

export default function IconButton({
  onClick,
  children,
  isActive,
  disabled,
  title,
}: Props) {
  return (
    <button
      className={`${styles.button} ${isActive ? styles.button_active : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}
