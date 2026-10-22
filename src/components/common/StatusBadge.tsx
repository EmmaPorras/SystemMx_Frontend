type StatusBadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

type StatusBadgeProps = {
  label: string;
  variant?: StatusBadgeVariant;
  className?: string;
};

const styles: Record<StatusBadgeVariant, { container: string; dot: string }> = {
  success: {
    container: "bg-emerald-50/80 text-emerald-800 border-emerald-200/80",
    dot: "bg-emerald-500",
  },
  warning: {
    container: "bg-amber-50/90 text-amber-800 border-amber-200/90",
    dot: "bg-amber-500",
  },
  danger: {
    container: "bg-rose-50/80 text-rose-800 border-rose-200/80",
    dot: "bg-rose-500",
  },
  neutral: {
    container: "bg-zinc-100/80 text-zinc-700 border-zinc-200/80",
    dot: "bg-zinc-400",
  },
  info: {
    container: "bg-sky-50/80 text-sky-800 border-sky-200/80",
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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-normal shadow-2xs ${currentStyle.container} ${className}`}
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
