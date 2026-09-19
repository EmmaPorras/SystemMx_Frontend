type StatusBadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type StatusBadgeProps = {
  label: string;
  variant?: StatusBadgeVariant;
  className?: string;
};

const styles: Record<StatusBadgeVariant, { container: string; dot: string }> = {
  success: {
    container: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  warning: {
    container: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  danger: {
    container: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  neutral: {
    container: "bg-zinc-100 text-zinc-700 border-zinc-200",
    dot: "bg-zinc-400",
  },
  info: {
    container: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
};

function StatusBadge({
  label,
  variant = "neutral",
  className = "",
}: StatusBadgeProps) {
  const currentStyle = styles[variant] || styles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${currentStyle.container} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${currentStyle.dot}`}
      />
      <span>{label}</span>
    </span>
  );
}

export default StatusBadge;
