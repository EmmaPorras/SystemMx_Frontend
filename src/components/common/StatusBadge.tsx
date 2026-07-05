type StatusBadgeProps = {
  label: string;
  variant?: "success" | "warning" | "danger" | "neutral";
};

const styles = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  neutral: "bg-zinc-100 text-zinc-700",
};

function StatusBadge({ label, variant = "neutral" }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[variant]}`}>
      {label}
    </span>
  );
}

export default StatusBadge;
