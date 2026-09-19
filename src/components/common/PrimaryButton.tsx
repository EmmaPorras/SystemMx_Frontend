import type { ReactNode } from "react";

type PrimaryButtonVariant = "primary" | "secondary" | "danger" | "outline";

type PrimaryButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  variant?: PrimaryButtonVariant;
  className?: string;
  title?: string;
  ariaLabel?: string;
};

const variantClasses: Record<PrimaryButtonVariant, string> = {
  primary:
    "bg-zinc-950 text-white hover:bg-zinc-800 active:bg-zinc-900 focus-visible:ring-zinc-950",
  secondary:
    "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 focus-visible:ring-zinc-400 border border-zinc-200",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500",
  outline:
    "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100 focus-visible:ring-zinc-950",
};

function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  loadingText,
  variant = "primary",
  className = "",
  title,
  ariaLabel,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-label={ariaLabel}
      title={title}
      className={`inline-flex min-h-[40px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-xs transition duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default PrimaryButton;
