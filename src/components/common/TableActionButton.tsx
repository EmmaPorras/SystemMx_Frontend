import type { ReactNode } from "react";

type TableActionVariant =
  | "view"
  | "edit"
  | "delete"
  | "default"
  | "restore"
  | "cancel";

type TableActionButtonProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: TableActionVariant;
  disabled?: boolean;
  className?: string;
};

const variantClasses: Record<TableActionVariant, string> = {
  view:
    "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900 hover:bg-zinc-950 hover:text-white focus-visible:ring-zinc-950",
  edit:
    "border-blue-200 bg-blue-50/80 text-blue-700 hover:border-blue-600 hover:bg-blue-600 hover:text-white focus-visible:ring-blue-500",
  delete:
    "border-red-200 bg-red-50/80 text-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white focus-visible:ring-red-500",
  restore:
    "border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white focus-visible:ring-emerald-500",
  cancel:
    "border-amber-200 bg-amber-50/80 text-amber-700 hover:border-amber-600 hover:bg-amber-600 hover:text-white focus-visible:ring-amber-500",
  default:
    "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-900 hover:bg-zinc-950 hover:text-white focus-visible:ring-zinc-950",
};

function TableActionButton({
  icon,
  label,
  onClick,
  variant = "default",
  disabled = false,
  className = "",
}: TableActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-8 w-8 place-items-center rounded-lg border shadow-2xs transition-all duration-150 outline-none hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none ${variantClasses[variant]} ${className}`}
    >
      {icon}
    </button>
  );
}

export default TableActionButton;